var copyAllInserted = false;
document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({"type": "getTabInfo"}).then(function (data) {
        if (data != undefined) {
            if (data['Url'] != null && data['Url'] != '' && data['Url'].substring(1, 9) != 'chrome://') {
                var tabTitle = data['Title'];
                var url = data['Url'];

                document.getElementById('externalSearch').onclick=function(){
                    document.getElementById('feeds2').style.display = "block";
                    externalSearchGetFeedsURLs(url, tabTitle, callbackfeeds);
                    document.getElementsByTagName("footer")[0].style.display = "none";
                };
                getFeedsURLs(url, tabTitle, callbackfeeds);
            }
        }
    });
});

function callbackfeeds(no, tabTitle, feeds){
    if (feeds.length > 0)
    {
        let insertcopyAll = false;
        let html = '<table id="feeds-list' + no + '">';
        for (let i = 0; i < feeds.length; i++) {
            html += '<tr>';
            html +=   '<td class="feed-title">';
            html +=     '<a class="link" href="'+feeds[i].url+'" title="'+feeds[i].title+'" data-tabtitle="'+tabTitle+'" target="_blank">'+feeds[i].title+'</a>';
            html +=     '<span class="feed-url">'+truncate(feeds[i].url, 50)+'</span>';
            html +=   '</td>';
            html +=   '<td class="feed-copy">';
            html +=     '<a class="copyButton copyLink' + no + '" title="Copy feed URL" href="#">Copy URL</a>';
            html +=   '</td>';
            html +=   '<td class="feed-copy">';
            html +=     '<a class="copyButton sendToSlickRss' + no + '" title="Send to Slick RSS" href="#">Send to Slick RSS</a>';
            html +=   '</td>';
            html += '</tr>';
        }
        html += '</table>';
        render(html, no == 1 ? 'feeds' : 'feeds' + no);

        if (!copyAllInserted) {
            html = '<div class="copyAllLinks-container">';
            html +=   '<a id="copyAllLinks" class="" title="Copy all feeds URLs" href="#">Copy all URLs</a>';
            html += '</div>';
            html += '<div class="copyAllLinks-container">';
            html +=   '<a id="sendToSlickRssAllLinks" class="" title="Send to Slick RSS all feeds URLs" href="#">Send to Slick RSS all URLs</a>';
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

                copyToClipboard(url, {type: "success", title: tabTitle, message: "Feed URL copied in clipboard!"});
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

                copyToClipboard(textToCopy, {type: "success", title: '', message: "Feeds URLs copied in clipboard!"});
            });

            let sendToSlickRssAllLinks = document.getElementById('sendToSlickRssAllLinks');

            sendToSlickRssAllLinks.addEventListener("click", function() {
                let feeds_list;
                let text = '';
                if (document.getElementById('feeds-list1') != undefined) {
                    feeds_list = document.getElementById('feeds-list1').querySelectorAll('.feed-title a.link');

                    for (let j = 0; j < feeds_list.length; j++) {
                        let url = feeds_list[j].getAttribute('href');
                        let tabTitle = feeds_list[j].getAttribute('data-tabtitle');
                        sendToExtension(url, tabTitle);
                    }
                }

                if (document.getElementById('feeds-list2') != undefined) {
                    feeds_list = document.getElementById('feeds-list2').querySelectorAll('.feed-title a.link');

                    for (let j = 0; j < feeds_list.length; j++) {
                        let url = feeds_list[j].getAttribute('href');
                        let tabTitle = feeds_list[j].getAttribute('data-tabtitle');
                        sendToExtension(url, tabTitle);
                    }
                }
            });
        }
    }
    else
    {
        render("No feed found");
    }
}