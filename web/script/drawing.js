const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let = isDown = false

let cache_pos = { x: 0, y: 0 }
let pos = { x: 0, y: 0 }
let offset = {}

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
    isDown = false
    switch (tool.type) {
        case "rect":
            drawRect(cache_pos, pos)
            break;
        case "line":
            drawLine(cache_pos, pos)
    }
}

function mouseMove(event) {
    old_pos = { x: pos.x, y: pos.y }
    pos.x = event.clientX - offset.x;
    pos.y = event.clientY - offset.y;
    if (!isDown) { return }

    switch (tool.type) {
        case "brush":
            drawLine(old_pos, pos)
            break;
        case "eraser":
            drawLine(old_pos, pos, true)
            break;
    }
}

function drawLine(from, to, eraser = false) {
    if (eraser) { ctx.globalCompositeOperation = "destination-out"; }
    ctx.beginPath()
    ctx.lineWidth = tool.size;
    ctx.lineCap = "round";
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    if (eraser) { ctx.globalCompositeOperation = "source-over"; }
}

function drawRect(from, to) {
    ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y)
    ctx.stroke()
}


function setTool({ type = false, size = false, color = false }) {
    if (type) { tool.type = type }
    if (size) {
        tool.size = size
        ctx.lineWidth = size;
    }
    if (color) {
        tool.color = color
        ctx.strokeStyle = color
        ctx.fillStyle = color
    }
}
setTool({ type: "brush", size: 15, color: "black" })


function win_resize(){
    offset = { x: canvas.offsetLeft, y: canvas.offsetTop }
}
win_resize()