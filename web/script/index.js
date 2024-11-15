let current_prof=0;
const max_prof=3
const prof_img = document.getElementById("pfp_img")

function change_prof(x){
    current_prof = current_prof + x <= max_prof ? current_prof + x : 0;
    prof_img.src=`web/img/prof/${current_prof}.jpg`
}

const ws = new WebSocket("ws://localhost:80");

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