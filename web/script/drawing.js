const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.lineCap = "round";

let = isDown = false

let cache_pos = { x: 0, y: 0 }
let pos = { x: 0, y: 0 }
let offset = {}
let bufferPoints=[]
let buffercount=0
let tool = { type: "brush", size: 5, color: "black" }

function mouseDown() {
    isDown = true
    switch (tool.type) {
        case "brush":
            drawLine(pos,pos);
            break;
        case "eraser":
            drawLine(pos, pos, true)
            break;
        case "rect":
        case "line":
            cache_pos.x = pos.x
            cache_pos.y = pos.y
            break;
    }
}

function mouseUp() {
    ctx.beginPath()

    ctx.strokeStyle = tool.color
    isDown = false
    switch (tool.type) {
        case "rect":
            drawRect(cache_pos, pos)
            sendData()
            break;
        case "line":
            drawLine(cache_pos, pos)
            sendData()
        case "brush":
        case "eraser":
            if (buffercount==0) break
            sendData(bufferPoints)
            bufferPoints=[]
            buffercount=0
    }
}

function mouseMove(event) {
    old_pos = { x: pos.x, y: pos.y }
    pos.x = event.clientX - offset.x;
    pos.y = event.clientY - offset.y;
    if (!isDown) { return }

    switch (tool.type) {
        case "brush":
        case "eraser":
            drawLine(old_pos, pos, tool.type=="eraser")
            
            // zapisuje ścieżke rysowania, i raz na jakiś czas ją wysyła
            if (buffercount==0) bufferPoints=[old_pos.x,old_pos.y]
            bufferPoints.push([pos.x,pos.y])
            buffercount+=1
            if (buffercount>=49){
                sendData(bufferPoints)
                bufferPoints=[]
                buffercount=0
            }
            break;
    }
}

function drawLine(from, to, eraser = false) {
    if (eraser) { ctx.globalCompositeOperation = "destination-out"; }
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    if (eraser) { ctx.globalCompositeOperation = "source-over"; }
}

function drawRect(from, to) {
    ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y)
    ctx.stroke()
}

// zmiana narzędzia
function setTool({ type = false, size = false, color = false }) {
    if (type) { tool.type = type }
    if (size) {
        tool.size = size
        ctx.lineWidth = size
    }
    if (color) {
        tool.color = color
        ctx.strokeStyle = color
    }
}
setTool({ type: "brush", size: 15, color: "black" })


// jakby sie rozmiar okna zmienił
function win_resize(){
    offset = { x: canvas.offsetLeft, y: canvas.offsetTop }
}
win_resize()

// wysyłanie danych
function sendData(points=[[cache_pos.x,cache_pos.y],[pos.x,pos.y]],type=tool.type, size=tool.size, color=tool.color){
    if (type=="rect"){
        points[1][0]-=points[0][0]
        points[1][1]-=points[0][1]
    }
    //console.log(points,type,size,color)
    //receiveData(points,type,4,"red")
}

// odbieranie ruchów innych graczy
function receiveData(p,type,size,color){
    if (type=="eraser") { ctx.globalCompositeOperation = "destination-out"; }
    ctx.strokeStyle = color
    ctx.lineWidth = size

    ctx.beginPath()
    switch (type){
        case "rect":
            ctx.rect(p[0][0], p[0][1], p[1][0], p[1][1])
            break;
        case "brush":
        case "eraser":
        case "line":
            ctx.moveTo(p[0][0], p[0][1])
            for (let i=1; i<p.length; i++){
                ctx.lineTo(p[i][0],p[i][1])
            }
    }
    ctx.stroke()

    ctx.strokeStyle = tool.color
    ctx.lineWidth = tool.size
    ctx.globalCompositeOperation = "source-over"
}