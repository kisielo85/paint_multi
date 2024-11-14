const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let = isDown = false

let cache_pos = { x: 0, y: 0 }
let pos = { x: 0, y: 0 }
let offset = { x: canvas.offsetLeft, y: canvas.offsetTop }

let tool = { type: "brush", size: 5, color: "black" }

function mouseDown() {
    isDown = true
    switch (tool.type) {
        case "brush":
            drawPoint(pos);
            break;
        case "rect":
        case "line":
            cache_pos.x = pos.x
            cache_pos.y = pos.y
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
    }
}

function drawPoint(cords) {
    const w = tool.size
    ctx.beginPath()
    ctx.lineWidth = 1;
    ctx.arc(cords.x, cords.y, w / 2, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.stroke()
}

function drawLine(from, to) {
    ctx.beginPath()
    ctx.lineWidth = tool.size;
    ctx.lineCap = "round";
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
}

function drawRect(from, to) {
    ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y)
    ctx.stroke()
}

function setTool({type = false, size = false, color = false}) {
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
setTool({type:"brush",size:10,color:"red"})