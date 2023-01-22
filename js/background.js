var currentUrl = '';
var currentTabTitle = '';

chrome.tabs.query({ active: true, lastFocusedWindow: true }).then(function (tabs) {
    if (tabs != null) {
        if (tabs.length > 0) {
            if (tabs[0].url != undefined) {
                currentUrl = tabs[0].url;
                currentTabTitle = tabs[0].title;
            }
        }
    }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    updateIcon(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    updateIcon(tabId);
});

chrome.runtime.onMessage.addListener(ExternalRequest);

function updateIcon(tabId) {
    currentUrl = '';
    currentTabTitle = '';
    try {
        chrome.tabs.get(tabId, function(tab){
            if (tab != undefined) {
                if (tab.url != undefined) {
                    currentUrl = tab.url;
                    currentTabTitle = tab.title;
                }
            }
        });
    } catch (_) { };
}

function ExternalRequest(request, sender, sendResponse) {
    if (request.type == 'getTabInfo') {
        sendResponse({"Url": currentUrl, 'Title': currentTabTitle});
    }
    if (request.type == 'sendToSlickRSS') {
        sendResponse("");

        try {
            //release
            chrome.runtime.sendMessage("lloonpjjgockligalihhebapcafgbgef", {recipient: "Slick RSS", feedUrl: request.url, feedTitle: request.tabTitle, feedGroup: ""}).then(function (response) {
            //test
            //chrome.runtime.sendMessage("omnlpihheaaokdfcenobamhjhpjgeneg", {recipient: "Slick RSS", feedUrl: request.url, feedTitle: request.tabTitle, feedGroup: ""}).then(function (response) {
            });
        }
        catch (_) {
        }
    }
}
