const express = require('express');
const { createCanvas } = require('canvas');
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

// Generate roomCode wich dosnt exist yet
function genRoom() {
    let randString = genRandString();
    return typeof pathClients[`/room/${randString}`] ? randString : genRoom();
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
/*

// Set background color
ctx.fillStyle = 'lightblue';
ctx.fillRect(0, 0, width, height);

// Draw a red rectangle
ctx.fillStyle = 'red';
ctx.fillRect(100, 100, 200, 150);

// Draw some text
ctx.font = '30px Arial';
ctx.fillStyle = 'black';
ctx.fillText('Hello, Canvas!', 150, 300);

// Save the canvas as an image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('output.png', buffer);
*/

function createRoom(code){
    if(typeof pathClients[`/room/${code}`] != 'undefined') return null
    pathClients[`/room/${code}`] = { "ctx": createCanvas(2048, 2048).getContext('2d'), clients:[] };
    pathClients[`/room/${code}`].ctx.lineCap = "round";
    console.log(`made ${code} room`)
    return pathClients[`/room/${code}`];
}

app.post('/add-room', (req, res) => {
    const { roomCode } = req.body;
    
    if(typeof roomCode == 'undefined' || roomCode == ''){
        return res.status(411).send('Empty room code')
    }

    if (typeof pathClients["/room/"+roomCode] != 'undefined') {
        return res.status(409).send('Room code already exists');
    }
    
    if (roomCode.length > 12) {
        return res.status(404).send('Code too long, longer than 12');
    }

    createRoom(roomCode)

    res.status(201).send(`Room ${roomCode} added successfully`);
    
});

createRoom("public")

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
        if (typeof pathClients[pathname] != 'undefined') {
            createRoom(pathname)
        }else{
            if(pathClients[pathname].clients.length > 0)
                id = pathClients[pathname].clients[pathClients[pathname].clients.length - 1].user.id + 1
        }
        ws.user = { "id":id, "username":username, "img":parseInt(imgID)}
        pathClients[pathname].clients.push(ws);
        wss.emit('connection', ws, request);
    });
});

function sendDataToRoomOtherClients(ws, data){
    pathClients[ws.path].clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify(data));
    });
}

// =============================


let tool = {type: "brush"} // ustawienia narzędzia

// odbieranie ruchów innych graczy
function receiveData(p, type, size, color, ctx) {
    ctx.globalCompositeOperation = type == "eraser" ? "destination-out" : "source-over"
    
    ctx.strokeStyle = color
    ctx.lineWidth = size

    ctx.beginPath()
    switch (type) {
        case "brush":
        case "eraser":
        case "line":
            ctx.lineJoin = "round";
            ctx.moveTo(p[0][0], p[0][1])
            for (let i = 0; i < p.length; i++) {
                ctx.lineTo(p[i][0], p[i][1])
            }
            break;

        case "rect":
            ctx.rect(p[0][0], p[0][1], p[1][0], p[1][1])
            break;
    }
    ctx.stroke()

    ctx.lineJoin = "miter";
    ctx.strokeStyle = tool.color
    ctx.lineWidth = tool.size
    ctx.globalCompositeOperation = tool.type == "eraser" ? "destination-out" : "source-over"

    //fs.writeFileSync('output.png', ctx.canvas.toBuffer('image/png'));
}

/*switch (d.action){
    case "draw":
        receiveData(d.points,d.type,d.size,d.color)
        break
}*/

//===========================


// WebSocket server connection
wss.on('connection', async (ws) => {
    console.log(`New WebSocket connection on path: ${ws.path}`);
    ws.send(JSON.stringify({"action":"ctxUpdate", "base64":await pathClients[ws.path].ctx.canvas.toBuffer('image/png').toString('base64')}))
    pathClients[ws.path].clients.forEach((client) => { if(client !== ws && client.readyState === WebSocket.OPEN) ws.send(JSON.stringify({"action":"connect", "user": client.user})) } )
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
                    receiveData(data.points, data.type, data.size, data.color, pathClients[ws.path].ctx)
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
        pathClients[ws.path].clients = pathClients[ws.path].clients.filter((client) => client !== ws);
        
        if(ws.path != "/room/public" && pathClients[ws.path].clients.length == 0)
        setTimeout(() => {
            if(ws.path != "/room/public" && pathClients[ws.path].clients.length == 0)
                delete pathClients[ws.path]
        }, 20000)
    });
});
