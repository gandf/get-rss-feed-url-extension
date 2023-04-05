var copyAllInserted = false;
var options = GetDefaultOptions();
document.addEventListener('DOMContentLoaded', function() {
    GetOptions().then(function() {
        TranslateText();
        SetupScreen();

        chrome.runtime.sendMessage({"type": "getTabInfo"}).then(function (data) {
            if (data != undefined) {
                if (data['Url'] != null && data['Url'] != '' && data['Url'].substring(1, 9) != 'chrome://') {
                    var tabTitle = data['Title'];
                    var url = data['Url'];

                    document.getElementById('externalSearch1').onclick=function(){
                        document.getElementById('feeds2').style.display = "block";
                        externalSearchGetFeedsURLs(url, tabTitle, 1, callbackfeeds);
                        document.getElementById("footer1").style.display = "none";
                        if (document.getElementById("footer2").style.display == "none") {
                            document.getElementsByTagName("footer")[0].style.display = "none";
                        }
                    };
                    document.getElementById('externalSearch2').onclick=function(){
                        document.getElementById('feeds3').style.display = "block";
                        externalSearchGetFeedsURLs(url, tabTitle, 2, callbackfeeds);
                        document.getElementById("footer2").style.display = "none";
                        if (document.getElementById("footer1").style.display == "none") {
                            document.getElementsByTagName("footer")[0].style.display = "none";
                        }
                    };
                    getFeedsURLs(url, tabTitle, callbackfeeds);
                } else {
                    render(GetMessageText('urlInvalid'));
                    document.getElementsByTagName("footer")[0].style.display = "none";
                }
            }
        });
    });
});

function callbackfeeds(no, tabTitle, feeds, type){
    if (feeds.length > 0)
    {
        let insertcopyAll = false;
        let insertTable = document.getElementById("feeds-list" + no) == undefined;
        let html;

        if (insertTable) {
            html = '<table id="feeds-list' + no + '">';
        } else {
            if (document != undefined) {
                html = document.getElementById(no == 1 ? 'feeds' : 'feeds' + no).innerHTML.replace("</table>", "");
            }
        }

        for (let i = 0; i < feeds.length; i++) {
            let title = feeds[i].title;
            if (title == "") {
                title = tabTitle;
            }
            html += '<tr>';
            html +=   '<td class="feed-title">';
            html +=     '<a class="link" href="'+feeds[i].url+'" title="'+feeds[i].title+'" data-tabtitle="'+title+'" data-type="'+type+'" target="_blank">'+title+'</a>';
            html +=     '<span class="feed-url">'+truncate(feeds[i].url, 50)+'</span>';
            html +=   '</td>';
            html +=   '<td class="feed-copy">';
            html +=     '<a class="copyButton copyLink' + no + '" title="' + GetMessageText('copyFeedUrl') + '" href="#">' + GetMessageText('copyUrl') + '</a>';
            html +=   '</td>';
            html +=   '<td class="feed-copy">';
            html +=     '<a class="copyButton sendToSlickRss' + no + '" title="' + GetMessageText('sendToSlick') + '" href="#">' + GetMessageText('sendToSlick') + '</a>';
            html +=   '</td>';
            html += '</tr>';
        }
        html += '</table>';
        render(html, no == 1 ? 'feeds' : 'feeds' + no);

        if (!copyAllInserted) {
            html = '<div class="copyAllLinks-container">';
            html +=   '<a id="copyAllLinks" class="" title="' + GetMessageText('copyAllFeedsUrls') + '" href="#">' + GetMessageText('copyAllUrls') + '</a>';
            html += '</div>';
            html += '<div class="copyAllLinks-container">';
            html +=   '<a id="sendToSlickRssAllLinks" class="" title="' + GetMessageText('sendToSlickAllFeedsUrls') + '" href="#">' + GetMessageText('sendToSlickAllUrls') + '</a>';
            html += '</div>';
            copyAllInserted = true;
            insertcopyAll = true;
            render(html, 'feedsCopyAll');
        }

        // Copy to clipboard feed URL
        let copyButtons = document.getElementsByClassName('copyLink' + no);

        for (let i = 0; i < copyButtons.length; i++) {
            copyButtons[i].addEventListener("click", function() {
                let feed = this.parentNode.parentNode.querySelector('a.link');
                let url = feed.getAttribute('href');
                let tabTitle = feed.getAttribute('data-tabtitle');

                copyToClipboard(url, {type: "success", title: tabTitle, message: GetMessageText("FeedsCopiedClipboard")});
            });
        }

        // Send to Slick RSS
        let sendTSR = document.getElementsByClassName('sendToSlickRss' + no);

        for (let i = 0; i < sendTSR.length; i++) {
            sendTSR[i].addEventListener("click", function() {
                let feed = this.parentNode.parentNode.querySelector('a.link');
                let url = feed.getAttribute('href');
                let tabTitle = feed.getAttribute('data-tabtitle');

                sendToExtension(url, tabTitle);
            });
        }

        if (insertcopyAll) {
            // Copy to clipboard all feeds URLs
            let copyButtonAll = document.getElementById('copyAllLinks');

            copyButtonAll.addEventListener("click", function() {
                let feeds_list;
                let text = '';
                if (document.getElementById('feeds-list1') != undefined) {
                    feeds_list = document.getElementById('feeds-list1').querySelectorAll('.feed-title a.link');

                    for (let j = 0; j < feeds_list.length; j++) {
                        text += feeds_list[j]+"\n";
                    }
                }

                if (document.getElementById('feeds-list2') != undefined) {
                    feeds_list = document.getElementById('feeds-list2').querySelectorAll('.feed-title a.link');

                    for (let j = 0; j < feeds_list.length; j++) {
                        text += feeds_list[j]+"\n";
                    }
                }
                let textToCopy = text.substring(0, text.length - 1);

                copyToClipboard(textToCopy, {type: "success", title: '', message: GetMessageText("FeedsCopiedClipboard")});
            });

            let sendToSlickRssAllLinks = document.getElementById('sendToSlickRssAllLinks');

            sendToSlickRssAllLinks.addEventListener("click", function() {
                let allFeeds = [];
                addFeedToList('feeds-list2', allFeeds);
                addFeedToList('feeds-list1', allFeeds);
                sendToExtensionFeedList(allFeeds);
            });
        }
    }
    else
    {
        render(GetMessageText("noFeedFound"));
    }
}

function addFeedToList(elementName, list) {
    if (document.getElementById(elementName) != undefined) {
        let feeds_list = document.getElementById(elementName).querySelectorAll('.feed-title a.link');

        for (let j = 0; j < feeds_list.length; j++) {
            let url = feeds_list[j].getAttribute('href');
            let tabTitle = feeds_list[j].getAttribute('data-tabtitle');
            let type = parseInt(feeds_list[j].getAttribute('data-type'));

            if (!list.find(function (el) { return (el.url == url); })) {
                list.push({url: url, tabTitle: tabTitle, feedGroup: "", type: type});
            } else {
                if (type < 3) {
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].url == url) {
                            if (list[i].type > type) {
                                list[i].tabTitle = tabTitle;
                            }
                            if ((list[i].type == type) && (list[i].tabTitle.length < tabTitle.length)) {
                                list[i].tabTitle = tabTitle;
                            }
                            break;
                        }
                    }
                }
            }
        }
    }
}

function GetOptions() {
    return store.getItem('options').then(function (data) {
        if (data != null) {
            options = data;

            // fill in defaults for new options
            for (let key in GetDefaultOptions()) {
                if (options[key] == undefined) {
                    options[key] = defaultOptions[key];
                }
            }
        }
    });
}

function GetDefaultOptions() {
    return {
        "darkmode": true,
        "forcelangen": false,
        "targettype": "Release"
    };
}