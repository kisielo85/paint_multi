const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const WebSocket = require('ws');
const config = require('./server-config.json');

const charSets = [
    { min: 48, max: 57 },   //0-9
    { min: 65, max: 90 },   //A-Z
    { min: 97, max: 122 },  //a-z
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

// Routes
app.get('/rooms', (req, res) => {
    const RoomList = Rooms.map(({ clients, ...room }) => room);
    res.json(RoomList);
});

app.get('/gen-room', (req, res) => {
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
const wss = new WebSocket.Server({ server });
console.log(`WebSocket running on ws://localhost`);

wss.on('connection', (client) => {
    console.log('New WebSocket client connected');
    client.send('Welcome to the WebSocket server!');
    // 0 - publiczny pokój
    client.roomId=0
    Rooms[0].clients.push(client)

    client.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch {
            data = String(message);
        }
        console.log('Received:', data);
        for (const c of Rooms[client.roomId].clients) {
            if (c == client) continue
            c.send(`${message}`)
        }
        //client.send(`Server received: ${message}`);
    });

    client.on('close', () => {
        console.log('Client disconnected');
    });
});
