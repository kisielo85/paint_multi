const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let = isDown = false

let pos = { x: 0, y: 0 }
let offset = { x: canvas.offsetLeft, y: canvas.offsetTop }

let tool = {
    type: "brush",
    width: 20,
    color: "green",
    shape: "circle", //circle, square
}

ctx.lineWidth = tool.width;
ctx.strokeStyle = tool.color
ctx.fillStyle = tool.color

function mouseDown() {
    isDown = true
    switch (tool.type) {
        case "brush":
            drawPoint(pos.x, pos.y);
            ctx.beginPath()
            break;
    }
}
function mouseUp() {
    isDown = false
    ctx.stroke()
}

function mouseMove(event) {
    old_x=pos.x
    old_y=pos.y
    pos.x = event.clientX - offset.x;
    pos.y = event.clientY - offset.y;
    if (!isDown) { return }
    drawLine(old_x,old_y,pos.x,pos.y)
}

function drawPoint(x, y) {
    w = tool.width
    x = pos.x
    y = pos.y
    switch (tool.shape) {
        case "square":
            ctx.fillRect(x - w / 2, y - w / 2, w, w);
            break;
        case "circle":
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2, true)
            ctx.stroke()
            break;
    }

}

function drawLine(x1,y1,x2,y2) {
    ctx.beginPath()
    ctx.lineCap = "round";
    ctx.moveTo(x1,y1)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

}