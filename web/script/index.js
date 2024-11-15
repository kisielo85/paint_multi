const serverURL = "127.0.0.1:80"
const ws = new WebSocket("ws://" + serverURL);

//sends data/buffer to WebSocket server
function sendMessage(message) {
    if(typeof message == 'object'){
        ws.send(JSON.stringify(message))
        return
    }
    ws.send(message);
    return
}


/*

ws.onopen = () => {
   console.log("Connected to WebSocket server");
};

ws.onmessage = (event) => {
    console.log(event.data);
};
ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
};

*/