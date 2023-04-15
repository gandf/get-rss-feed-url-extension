function activeDarkMode() {
    let keys = Object.keys(document.getElementsByTagName("link"));
    for (let i = 0; i < keys.length; i++) {
        let oldlink = document.getElementsByTagName("link").item(keys[i]);
        if (!oldlink.getAttribute("href").includes('common')) {
            oldlink.setAttribute("href", oldlink.getAttribute("href").replace(".", "_dark."));
        }
    }
}

function disableDarkMode() {
    let keys = Object.keys(document.getElementsByTagName("link"));
    for (let i = 0; i < keys.length; i++) {
        let oldlink = document.getElementsByTagName("link").item(keys[i]);
        if (!oldlink.getAttribute("href").includes('common')) {
            oldlink.setAttribute("href", oldlink.getAttribute("href").replace("_dark.", "."));
        }
    }
}

function SetupScreen()
{
    if (options.darkmode) {
        activeDarkMode();
    } else {
        disableDarkMode();
    }
}