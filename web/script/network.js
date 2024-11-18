//const serverURL = "localhost:2140"
const serverURL = "paint_multi.153070065.xyz"
let roomCode = "3561261"
let userName ="googooGaga"
let imageID = 1
const ws = new WebSocket(`wss://${serverURL}/room/${roomCode}?username=${encodeURIComponent(userName)}&img=${imageID}`);

//sends data/buffer to WebSocket server
function sendMessage(message) {
    if(typeof message == 'object'){
        ws.send(JSON.stringify(message))
        return
    }
    console.log("SEND:", message)
    ws.send(message);
    return
}

ws.onmessage = (event) => {
    const d = JSON.parse(event.data)
    console.log(d);
    switch (d.action){
        case "draw":
            receiveData(d.points,d.type,d.size,d.color)
    }
};


/*

ws.onopen = () => {
   console.log("Connected to WebSocket server");
};


ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
};

*/