const urlParams = new URLSearchParams(window.location.href.split("?")[1])
let roomCode = urlParams.get("code")
let userName = urlParams.get("username")
let imageID = urlParams.get("img")
console.log(userName, imageID, roomCode);

if(roomCode == null || userName == null || imageID == null || parseInt(imageID) == NaN){
    window.location.href = "../index.html"
}else{
    const ws = new WebSocket(`${(serverURL.startsWith("127.0.0.1") || serverURL.startsWith("localhost") ? "ws" : "wss")}://${serverURL}/room/${roomCode}?username=${encodeURIComponent(userName)}&img=${imageID}`);

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
                break
            case "move":
                move_player(d.id,d.pos)
                break
            case "connect":
                add_player(d.user.id,d.user.username,d.user.img)
                break
            case "disconnect":
                del_player(d.id)
                break
            case "ctxUpdate":
                updateCtx(d.base64)
                break
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
}

