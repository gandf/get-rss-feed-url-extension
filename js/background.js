var currentUrl = '';
var currentTabTitle = '';

updateIcon();
chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateIcon();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    updateIcon();
});

chrome.runtime.onMessage.addListener(ExternalRequest);

function updateIcon() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
        if (tabs != null) {
            if (tabs.length > 0) {
                if (tabs[0].url != undefined) {
                    switch (tabs[0].url.protocol) {
                        case "chrome:":
                        case "chrome-extension:":
                        case "about:":
                        case "moz-extension:":
                        case "vivaldi:":
                        case "edge:":
                        case "chrome-devtools:":
                        case "devtools:":
                            return;
                        default:
                            currentUrl = tabs[0].url;
                            currentTabTitle = tabs[0].title;
                            return;
                    }
                }
            }
        }
    });
}

function ExternalRequest(request, sender, sendResponse) {
    if (request.type == 'getTabInfo') {
        sendResponse({"Url": currentUrl, 'Title': currentTabTitle});
        return;
    }
    if (request.type == 'sendToSlickRSS') {
        if (request.targetEnv == undefined || request.targetEnv != "Test") {
            //release
            chrome.runtime.sendMessage("lloonpjjgockligalihhebapcafgbgef", {recipient: "Slick RSS", feedUrl: request.url, feedTitle: request.tabTitle, feedGroup: ""}).then(function (response) {
            });
        } else {
            //test
            chrome.runtime.sendMessage("omnlpihheaaokdfcenobamhjhpjgeneg", {recipient: "Slick RSS", feedUrl: request.url, feedTitle: request.tabTitle, feedGroup: ""}).then(function (response) {
            });
        }
        sendResponse("ok");
        return;
    }
}
