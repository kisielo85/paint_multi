const max_prof = 12
let current_prof = Math.floor(Math.random() * max_prof + 1)
const prof_img = document.getElementById("pfp_img")

function change_prof(x) {
    current_prof += x
    if (current_prof < 0) { current_prof = max_prof }
    else if (current_prof > max_prof) { current_prof = 0 }
    prof_img.src = `web/img/prof/${current_prof}.jpg`
}
change_prof(0)

function room() {
    document.getElementById('main').style.visibility = "hidden";
    document.getElementById('roomSelect').style.visibility = "visible";
}

async function create_room() {
    document.getElementById('main').style.visibility = "hidden";
    document.getElementById('roomCreate').style.visibility = "visible";
    let genCode = (await axios.get(`${fullURL}/gen-code`)).data
    document.getElementById('crtRoomId').value = genCode
    joinCode = genCode
}

function back() {
    document.getElementById('main').style.visibility = "visible";
    document.getElementById('roomCreate').style.visibility = "hidden";
    document.getElementById('roomSelect').style.visibility = "hidden";
}

let joinCode = ""
async function join(create = false) {
    let name = document.getElementById("nameInput").value.trim()
    if (name.length == 0) {
        alert("input name")
        return
    }
    setCookie("userName", name)
    setCookie("imageID", current_prof)
    if (create) {
        console.log(await axios.post(`${fullURL}/add-room`, { "roomCode": joinCode }))
        window.location.href = `./web/game.html?code=${joinCode}`
        return
    }
    if (joinCode == "public") {
        window.location.href = `./web/game.html?code=${joinCode}`
        return
    }
    if ((await axios.get(`${fullURL}/room?code=${joinCode}`)).data) {
        window.location.href = `./web/game.html?code=${joinCode}`
    } else {
        alert("room noot exist :<")
    }
}

// gets all public avaible rooms
//axios.get(`http://${serverURL}/rooms`).then(output => {console.log(output.data)})

// gets room code and sents its to make one
/*
axios.get(`http://${serverURL}/gen-room`).then(codeData => {
    axios.post(`http://${serverURL}/add-room`, { roomCode:codeData.data }).then(console.log)
})
*/