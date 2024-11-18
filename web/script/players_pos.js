const pos_div=document.getElementById("players_container")
function add_player(id,username,prof){
    pos_div.innerHTML+=`<div id='player_${id}' class='player_prof'><img src='img/prof/${prof}.jpg'></div>`
    console.log("amoo",id,username,prof)
}


function del_player(id){
    document.getElementById(`player_${id}`).remove()
}

function move_player(id, pos){
    const p = document.getElementById(`player_${id}`)
    p.style.left=`${pos.x+canvas.offsetLeft}px`
    p.style.top=`${pos.y+canvas.offsetTop}px`
}
