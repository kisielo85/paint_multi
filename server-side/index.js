const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const WebSocket = require('ws');
const config = require('./server-config.json');

const charSets = [
    { min: 48, max: 57 },   //0-9
    { min: 65, max: 90 },   //A-Z
    //{ min: 97, max: 122 },  //a-z
];

// Generate string with random characters
function genRandString(length = 8) {
    const randomBytes = Array.from({ length }, () => {
        const set = charSets[Math.floor(Math.random() * charSets.length)]; // Randomly select character set
        return Math.floor(Math.random() * (set.max - set.min + 1)) + set.min; // Random value within the range
    });

    const buffer = Buffer.from(randomBytes);
    return buffer.toString();
}

const app = express();

app.use(cors());
app.use(express.json());

const catURL = "https://http.cat/"

let Rooms = [
    {
        name: "public",
        clients:[],
        canvas: null,
    }
];

// Generate roomCode wich dosnt exist yet
function genRoom() {
    let randString = genRandString();
    return RoomList.findIndex(ele => ele === randString) === -1 ? randString : genRoom();
}

const pathClients = {};

// Routes
app.get('/room', (req, res) => {
    if(typeof req.query.code == undefined || req.query.code.length > 12){
        res.send(false)
        return
    }
    res.send(typeof pathClients["/room/"+req.query.code] != 'undefined')
});

app.get('/gen-code', (req, res) => {
    const roomCode = genRoom();
    res.send(roomCode);
});

app.post('/add-room', (req, res) => {
    const { roomCode } = req.body;

    if(typeof roomCode == 'undefined' || roomCode == ''){
        return res.status(411).send('Empty room code')
    }

    if (RoomList.includes(roomCode)) {
        return res.status(409).send('Room code already exists');
    }

    RoomList.push(roomCode);
    res.status(201).send(`Room ${roomCode} added successfully`);
});

// For unknown routes
app.all('*', (req, res) => {
    res.status(404).redirect(catURL);
});

const server = app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});

// WebSocket
const wss = new WebSocket.Server({ noServer: true }); 

// Handle upgrade requests
server.on('upgrade', (request, socket, head) => {
    const roomCode = request.url.match(/^\/room\/([^?]+)/)
    if(roomCode == null || roomCode[1].length > 12) return

    const params = new URLSearchParams(request.url.split('?')[1]);
    const username = params.get("username");
    const imgID = params.get("img");
    if(username == null || imgID == null || parseInt(imgID) == NaN) return
    
    const pathname = "/room/" + roomCode[1]
    
    // Handle WebSocket
    wss.handleUpgrade(request, socket, head, (ws) => {
        ws.path = pathname; // Store the path on the WebSocket instance
        let id = 0;
        if (!pathClients[pathname]) {
            pathClients[pathname] = [];
        }else{
            console.log(pathClients[pathname][pathClients[pathname].length - 1])
            id = pathClients[pathname][pathClients[pathname].length - 1].user.id + 1
        }
        ws.user = { "id":id, "username":username, "img":parseInt(imgID)}
        console.log(ws)
        pathClients[pathname].push(ws);
        wss.emit('connection', ws, request);
    });
});

function sendDataToRoomOtherClients(ws, data){
    pathClients[ws.path].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify(data));
    });
}

// WebSocket server connection
wss.on('connection', (ws) => {
    console.log(`New WebSocket connection on path: ${ws.path}`);
    pathClients[ws.path].forEach((client) => { if(client !== ws && client.readyState === WebSocket.OPEN) ws.send(JSON.stringify({"action":"connect", "user": client.user})) } )
    sendDataToRoomOtherClients(ws, {"action":"connect", "user": ws.user})

    // Messages from clients
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch {
            data = String(message);
        }

        console.log(`Message:`, ws.user, data);
        if(typeof data["action"] != 'undefined'){
            switch(data["action"]){
                case "draw":
                    sendDataToRoomOtherClients(ws, data)
                    break
                case "move":
                    data.id = ws.user.id;
                    sendDataToRoomOtherClients(ws, data)
                    break
            }
        }
    });

    // Clean up on disconnect
    ws.on('close', () => {
        console.log(`Connection closed on path: ${ws.path}`);
        sendDataToRoomOtherClients(ws, {"action":"disconnect", "id": ws.user.id})
        pathClients[ws.path] = pathClients[ws.path].filter((client) => client !== ws);
        if(pathClients[ws.path].length == 0) delete pathClients[ws.path]
    });
});
