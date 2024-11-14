function closeList() {
    document.getElementById('playersList').classList.remove('open');
    document.getElementById('closePlayerList').style.display = 'none';
    document.getElementById('openPlayerList').style.display = 'block';
}

function openList() {
    document.getElementById('playersList').classList.add('open');
    document.getElementById('openPlayerList').style.display = 'none';
    document.getElementById('closePlayerList').style.display = 'block';
}