const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let = isDown=false
let pos={x:0, y:0}

function mouseDown(){
    isDown=true
    drawSquare()

}
function mouseUp(){ isDown=false }
function mouseMove(){
    pos.x = event.clientX;
    pos.y = event.clientY;
    if (isDown){drawSquare()}
}

function drawSquare(width=2){
    x=pos.x
    y=pos.y
    ctx.fillStyle = "red";
    ctx.fillRect(x-width, y-width, 2*width, 2*width);
}