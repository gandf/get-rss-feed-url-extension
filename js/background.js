importScripts('config.js', 'functions.js');

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
    try {
        chrome.tabs.get(tabId, function(tab){
            if (tab.url != undefined) {
                currentUrl = tab.url;
                currentTabTitle = tab.title;
            }
        });
    } catch (e) {
        currentUrl = '';
        currentTabTitle = '';
    };
};

function ExternalRequest(request, sender, sendResponse) {
    if (request.type == 'getTabInfo') {
        sendResponse({"Url": currentUrl, 'Title': currentTabTitle});
    }
    if (request.type == 'sendToSlickRSS') {
        sendResponse("");
        sendToExtensionFromServiceWorker(request.url, request.tabTitle);
    }
};