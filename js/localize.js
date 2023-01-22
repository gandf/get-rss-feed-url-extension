function TranslateText() {
    let objects = document.getElementsByTagName('html');
    for (let j = 0; j < objects.length; j++)
    {
        let obj = objects[j];

        obj.querySelectorAll('[data-locale]').forEach(elem => {
            elem.innerText = GetMessageText(elem.dataset.locale)
        });
    }
}

function GetMessageText(value) {
    if (options.forcelangen) {
        return chrome.i18n.getMessage('en' + value);
    } else {
        return chrome.i18n.getMessage(value);
    }
}