function activeDarkMode() {
    let keys = Object.keys(document.getElementsByTagName("link"));
    for (let i = 0; i < keys.length; i++) {
        let oldlink = document.getElementsByTagName("link").item(keys[i]);
        oldlink.setAttribute("href", oldlink.getAttribute("href").replace(".", "_dark."));
    }
}

function disableDarkMode() {
    let keys = Object.keys(document.getElementsByTagName("link"));
    for (let i = 0; i < keys.length; i++) {
        let oldlink = document.getElementsByTagName("link").item(keys[i]);
        oldlink.setAttribute("href", oldlink.getAttribute("href").replace("_dark.", "."));
    }
}
