function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue
}

function getCookie(cname) {
    let cookies = document.cookie.split('; ')
    for (let i = 0; i < cookies.length; i++) {
        console.log(cookies[i], "<")
        let [n, s] = cookies[i].split("=")
        if (n == cname) return s
    }
    return null
}

function screenResized() {
    document.documentElement.style.setProperty('--grid-width', 2 / window.devicePixelRatio + "px");
}
screenResized();
window.addEventListener('resize', screenResized);