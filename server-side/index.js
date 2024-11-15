const WebSocket = require('ws');
const fs = require('fs');
const config = require('./server-config.json');

const wss = new WebSocket.Server({ port: config.PORT });
console.log(`WebSocket running on ws://localhost:${config.PORT}`);

wss.on('connection', (client) => {
    console.log('New client connected');
    client.send('Welcome to the WebSocket server!');

    client.on('message', (message) => {
        let data;
        try{
            data = JSON.parse(message);
        }catch{
            data = String(message)
        }
        console.log('Received:', typeof message);
        client.send(`Server received: ${message}`);
    });

    client.on('close', () => {
        console.log('Client disconnected');
    });
});

/*
setInterval(() => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('test');
        }
    });
}, 500);
*/