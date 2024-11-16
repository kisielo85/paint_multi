const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas_preview = document.getElementById("canvas_preview");
const ctx_pr = canvas_preview.getContext("2d");
ctx.lineCap = "round";
ctx_pr.lineCap = "round";
ctx_pr.globalAlpha = 0.3

let = isDown = false

let pos = { x: 0, y: 0 } // pozycja myszy
let cache_pos = { x: 0, y: 0 } // zapisana pozycja, używane do prostokątków itp
let bufferPoints = [] // dane czekające na wysłanie
let bufferCount = 0 // ilość danych w bufferPoints
let tool = {} // ustawienia narzędzia
setTool({ type: "brush", size: 15, color: "black" })

function mouseDown() {
    isDown = true
    switch (tool.type) {
        case "brush":
        case "eraser":
            drawLine(pos, pos);
            break;

        case "rect":
        case "line":
            ctx_pr.lineWidth = tool.size
            ctx_pr.strokeStyle = tool.color
            cache_pos.x = pos.x
            cache_pos.y = pos.y
            bufferPoints = [pos.x, pos.y]
            break;
    }
}

function mouseUp() {
    isDown = false
    switch (tool.type) {
        case "brush":
        case "eraser":
            if (bufferCount == 0) break
            sendData(bufferPoints)
            bufferPoints = []
            bufferCount = 0
            break;

        case "rect":
            clear_preview()
            drawRect(cache_pos, pos)
            sendData()
            break;

        case "line":
            clear_preview()
            drawLine(cache_pos, pos)
            sendData()
    }
}

function mouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    old_pos = { x: pos.x, y: pos.y }
    pos.x = event.clientX - rect.left;
    pos.y = event.clientY - rect.top;

    if (!isDown) { return }

    switch (tool.type) {
        case "brush":
        case "eraser":
            drawLine(old_pos, pos)

            // zapisuje ścieżke, i raz na jakiś czas ją wysyła
            bufferPoints.push([pos.x, pos.y])
            bufferCount += 1
            if (bufferCount >= 49) {
                sendData(bufferPoints)
                bufferPoints = []
                bufferCount = 0
            }
            break;

        case "line":
            clear_preview()
            drawLine(cache_pos, pos, ctx_pr)
            break;

        case "rect":
            clear_preview()
            drawRect(cache_pos, pos, ctx_pr)
            break;
    }
}

function drawLine(from, to, canv = ctx) {
    canv.beginPath()
    canv.moveTo(from.x, from.y)
    canv.lineTo(to.x, to.y)
    canv.stroke()
}

function drawRect(from, to, canv = ctx) {
    canv.beginPath()
    canv.rect(from.x, from.y, to.x - from.x, to.y - from.y)
    canv.stroke()
}

// czyści podgląd np. linii, prostokątu
function clear_preview() {
    ctx_pr.clearRect(0, 0, canvas_preview.width, canvas_preview.height)
}

// zmiana narzędzia
function setTool({ type = false, size = false, color = false }) {
    if (type) {
        tool.type = type
        if (type == "eraser") ctx.globalCompositeOperation = "destination-out"
        else ctx.globalCompositeOperation = "source-over"
    }
    if (size) {
        tool.size = size
        ctx.lineWidth = size
    }
    if (color) {
        tool.color = color
        ctx.strokeStyle = color
    }
}

// wysyłanie danych
function sendData(points = [[cache_pos.x, cache_pos.y], [pos.x, pos.y]], type = tool.type, size = tool.size, color = tool.color) {
    if (type == "rect") {
        points[1][0] -= points[0][0]
        points[1][1] -= points[0][1]
    }
    //console.log(points,type,size,color)
    //receiveData(points,type,4,"red")
}

// odbieranie ruchów innych graczy
function receiveData(p, type, size, color) {
    if (type == "eraser") { ctx.globalCompositeOperation = "destination-out"; }
    ctx.strokeStyle = color
    ctx.lineWidth = size

    ctx.beginPath()
    switch (type) {
        case "brush":
        case "eraser":
        case "line":
            ctx.moveTo(p[0][0], p[0][1])
            for (let i = 1; i < p.length; i++) {
                ctx.lineTo(p[i][0], p[i][1])
            }

        case "rect":
            ctx.rect(p[0][0], p[0][1], p[1][0], p[1][1])
            break;
    }
    ctx.stroke()

    ctx.strokeStyle = tool.color
    ctx.lineWidth = tool.size
    ctx.globalCompositeOperation = "source-over"
}