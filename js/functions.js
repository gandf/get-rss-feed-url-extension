function getJSON(url, callback) {

    var token = _CONFIG_.api_token;
    fetch(url, {
           method: 'get', 
           headers: new Headers({
             'Content-Type': 'application/json',
               'Accept-Charset': 'utf-8'
             //,'Authorization': 'Bearer ' + token
           })
         })
        .then(function(response){
            if (response.status == 200) {
                response.json().then(function(data){
                callback(data);
            })}
            else {
                if (document.getElementById('feeds-list') == undefined) {
                    render(GetMessageText('unableFindFeed'));
                } else {
                    callback(GetMessageText('unableFindFeed'));
                }
            }
        })
        .catch(function(error){
            if (document.getElementById('feeds-list') == undefined) {
                render(GetMessageText('Error')+error.message);
            } else {
                callback(GetMessageText('Error')+error.message);
            }
        });
}

function getFeedsURLs(url, tabTitle, callback)
{
    let specifRss = getSpecificRss(url);
    if (specifRss !== false)
    {
        let feeds_urls = [];

        let feed = {
            url: specifRss.url,
            title: specifRss.title,
        };

        feeds_urls.push(feed);
        callback(1, tabTitle, feeds_urls, 2);
    }
    else
    {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/xml',
                'Accept-Charset': 'utf-8'
            },
        }).then(function (response) {
            if (response.ok) {
                var status = response.status;
                response.arrayBuffer().then(function (data) {
                    if ((status >= 200) && (status <= 299)) {
                        let doc = DecodeText(data);

                        if (searchFeed(url, doc, tabTitle, callback)) {
                            return;
                        }
                    }
                    render(GetMessageText('unableFindFeedTryExternal'));
                })
            }
            else {
                render(GetMessageText('unableFindFeedTryExternal'));
            }
        });
    }
}

function externalSearchGetFeedsURLs(url, tabTitle, urlNo, depth, callback)
{
    urlNo--;
    if (typeof _CONFIG_ != 'undefined' && _CONFIG_.length >= urlNo) {
        if (typeof _CONFIG_[urlNo].api_url != '') {
            if (url != 'undefined' && typeof url != 'undefined') {
                var feeds_founded = false;
                let apiurl = _CONFIG_[urlNo].api_url + encodeURIComponent(url);
                if (_CONFIG_[urlNo].api_url2 != '') {
                    const { origin } = new URL(url);
                    if ((origin != url) && ((origin + '/') != url)) {
                        apiurl += _CONFIG_[urlNo].api_url2 + encodeURIComponent(rtrim(origin, "/"));
                    }
                } else {
                    if ((origin == url) && ((origin + '/') == url)) {
                        apiurl = rtrim(apiurl, "/");
                    }
                }
                if (_CONFIG_[urlNo].api_depth != '') {
                    apiurl += _CONFIG_[urlNo].api_depth + depth;
                }
                getJSON(apiurl, (response) =>  {
                    var feeds_urls = [];
                    if (response != null && response.constructor === Array && response.length > 0) {
                        feeds_founded = true;
                        for (let i = 0; i < response.length; i++){
                            let obj = response[i];
                            let feed;

                            if ((obj['url'] != undefined) && (obj['url'] != "")) {
                                feed = {
                                    url: obj['url'],
                                    title: obj['title'] || obj['url']
                                };

                                let testexist = JSON.stringify(feed);
                                if (!feeds_urls.some(e => JSON.stringify(e) === testexist)) {
                                    feeds_urls.push(feed);
                                }
                            }

                            if ((obj['self_url'] != undefined) && (obj['self_url'] != "")) {
                                feed = {
                                    url: obj['self_url'],
                                    title: obj['site_name'] || obj['title']
                                };
                                let testexist = JSON.stringify(feed);
                                if (!feeds_urls.some(e => JSON.stringify(e) === testexist)) {
                                    feeds_urls.push(feed);
                                }
                            }
                        }
                        callback(urlNo + 2, tabTitle, feeds_urls, 0);
                        return;
                    }
                    if (typeof response == 'string') {
                        render(response, "feeds" + (urlNo + 2));
                    } else {
                        render(GetMessageText('noFeedFound'), "feeds" + (urlNo + 2));
                    }
                });
            }
            else {
                render(GetMessageText('unableFindFeed'), "feeds" + (urlNo + 2));
            }
        }
        else {
            render(GetMessageText('unableFindFeed'), "feeds" + (urlNo + 2));
        }
    }
}

function searchFeed(url, data, tabTitle, callback)
{
    if (data != '')
    {
        let feeds_urls = [];
        let types = [
            'application/rss+xml',
            'application/atom+xml',
            'application/rdf+xml',
            'application/rss',
            'application/atom',
            'application/rdf',
            'text/rss+xml',
            'text/atom+xml',
            'text/rdf+xml',
            'text/rss',
            'text/atom',
            'text/rdf'
        ];
        let ProcotolUrl = url.substring(0, 8) == 'https://' ? 'https:' : 'http:';

        let oParser = new DOMParser();
        let oDOM = oParser.parseFromString(data, "text/html");
        for (let i = 0; i < types.length; i++) {
            let links = oDOM.querySelectorAll('[type="' + types[i] + '"]');
            //let links = data; //document.getElementById('rss-feed-url_response').querySelectorAll("#rss-feed-url_response link[type]");
            if (links != undefined) {
                for (let j = 0; j < links.length; j++) {
                    if (links[j].hasAttribute('type') && types.indexOf(links[j].getAttribute('type')) !== -1)
                    {
                        let feed_url = links[j].getAttribute('href');

                        // If feed's url starts with "//"
                        if (feed_url.indexOf("//") === 0)
                            feed_url = ProcotolUrl + feed_url;
                        // If feed's url starts with "/"
                        else if (feed_url.startsWith('/'))
                            feed_url = url.split('/')[0] + '//' + url.split('/')[2] + feed_url;
                        // If feed's url starts with http or https
                        else if (!((feed_url.substring(0, 8) == 'https://') || (feed_url.substring(0, 7) == 'http://')))
                            // If feed's has no slash
                            if (!feed_url.match(/\//))
                                feed_url = url.substring(0, url.lastIndexOf("/")) + '/' + feed_url;
                            else
                                feed_url = url + "/" + feed_url.replace(/^\//g, '');

                        let feed = {
                            url: feed_url,
                            title: links[j].getAttribute('title') || types[i].split('/')[1]
                        };
                        feeds_urls.push(feed);
                    }
                }
            }
        }

        if (feeds_urls.length === 0)
        {
            let links = oDOM.querySelectorAll("a[href*='/feeds']");
            for (let j = 0; j < links.length; j++) {
                let feed = {
                    url: links[j].getAttribute('href'),
                    title: (links[j].getAttribute('title') || links[j].textContent).replace(/(\r\n|\n|\r)/gm, "")
                };
                feeds_urls.push(feed);
            }
        }

        tryToGetFeedURL(url, tabTitle, callback);

        callback(1, tabTitle, feeds_urls, 1);
        return true;
    }
    else
    {
        return false;
    }
}

function getSpecificRss(tabUrl)
{
    let siteList = [
                {
                    "regexselector": "kickstarter",
                    "type" : "/",
                    "extension" : ".atom"
                },
                {
                    "regexselector": "reddit",
                    "type" : "/",
                    "extension" : ".rss"
                },
                {
                    "regexselector": "youtube",
                    "type" : "?",
                    "extension" : ".atom"
                }
            ];
    for (let i = 0; i < siteList.length; i++) {
        let isUrl = false;
        let title;
        let type;
        switch (siteList[i].regexselector) {
            case "kickstarter":
                isUrl = RegExp(/^(http(s)?:\/\/)?((w){3}\.)?kickstarter\.com/gm).test(tabUrl);
                title = "Kickstarter";
                break;
            case "reddit":
                isUrl = RegExp(/^(http(s)?:\/\/)?((w){3}\.)?reddit\.com\/r\/(.+)/gm).test(tabUrl);
                title = "Reddit";
                break;
            case "youtube":
                isUrl = RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu\.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gm).test(tabUrl);
                title = "Youtube";
                break;
        }

        if (isUrl)
        {
            if (siteList[i].extension == ".atom") {
                type = "application/atom+xml";
            }
            else {
                type = "application/rss+xml";
            }

            switch (siteList[i].type) {
                case "/": {
                    // Remove last "/" if presents
                    let feedUrl = tabUrl.replace(/\/$/, '');
                    feedUrl = feedUrl + siteList[i].extension;
                    if (feedUrl != tabUrl)
                        return {"title": title, "url": feedUrl, "type": type};
                    break;
                }
                case "?": {
                    let url = tabUrl.split('?')[0];
                    let channel = '';

                    if (url.split('channel/')[1])
                    {
                        channel = "channel_id=" + (url.split('channel/')[1]).split('/')[0];
                    }
                    else {
                        if (url.split('user/')[1])
                        {
                            channel = "user=" + (url.split('user/')[1]).split('/')[0];
                        }
                    }

                    if (channel != '')
                        return {"title": title, "url": "https://www.youtube.com/feeds/videos.xml?" + channel, "type": type};
                    break;
                }
            }
        }
    }
    return false;
}

function render(content, tag) {
    if (document != undefined) {
        if (tag == undefined || tag == 'feeds') {
            document.getElementById('feeds').innerHTML = content;
        }
        else {
            document.getElementById(tag).innerHTML = content;
        }
    }
}

function copyToClipboard(text, notification) {
    const input = document.createElement('textarea');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
    document.body.removeChild(input);

    chrome.notifications.create('get-rss-feed-url-copy', {
        type: "basic",
        title: notification.title || GetMessageText("popupTitle"),
        message: notification.message,
        iconUrl: "img/notif_"+notification.type+".png"
    });
}

function parseUrl(string) {
    const a = document.createElement('a'); 
    a.setAttribute('href', string);
    const {host, hostname, pathname, port, protocol, search, hash} = a;
    const origin = `${protocol}//${hostname}${port.length ? `:${port}`:''}`;
    return {origin, host, hostname, pathname, port, protocol, search, hash}
}

function truncate(fullStr, strLen, separator) {
    if (fullStr.length <= strLen) return fullStr;
    
    separator = separator || '...';
    
    let sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);
    
    return fullStr.substr(0, frontChars) + 
           separator + 
           fullStr.substr(fullStr.length - backChars);
}

function tryToGetFeedURL(tabUrl, tabTitle, callback) {
    let url_datas = parseUrl(tabUrl);
    let tests = ['/feed', '/rss', '/rss.xml', '/feed.xml', '/feed.atom'];

    for (let t = 0; t < tests.length; t++) {
        let feed_url = url_datas.origin + tests[t];

        fetch(feed_url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/xml',
                'Accept-Charset': 'utf-8'
            },
        }).then(function (response) {
            if (response.ok) {
                if ((response.status >= 200) && (response.status <= 299)) {
                    let promiseRead = response.arrayBuffer().then(function (data) {
                        let doc = DecodeText(data);

                        let oParser = new DOMParser();
                        let oDOM = oParser.parseFromString(doc, "application/xml");

                        let getRssTag = oDOM.getElementsByTagName('rss');
                        if (getRssTag.length > 0) {
                            let getChannelTag = getRssTag['0'].getElementsByTagName('channel')

                            if (getChannelTag.length > 0) {
                                let feeds_urls = [];
                                feeds_urls.push({
                                    url: feed_url,
                                    title: tabTitle
                                });
                                callback(1, tabTitle, feeds_urls, 3)
                            }
                        }
                    })
                }
                else {
                    render(GetMessageText('unableFindFeedTryExternal'));
                }
            }
        });
    }
}

function DecodeText(data) {
    let decoder = new TextDecoder("UTF-8");
    let doc = decoder.decode(data);
    let encodeName = doc.substring(0, 400);
    let textEnc = "encoding=";
    let indexEnc = encodeName.indexOf(textEnc);

    if (indexEnc < 0) {
        textEnc = "charset=";
        indexEnc = encodeName.indexOf(textEnc);
        if (indexEnc < 0) {
            return doc;
        }
    }

    encodeName = encodeName.substring(indexEnc + (textEnc).length);
    encodeName = encodeName.substring(0, encodeName.indexOf(">"));
    encodeName = encodeName.replaceAll('?', '').replaceAll('\"', '').replaceAll('"', '').replaceAll("'", "");
    if (encodeName.indexOf(" ") >= 0) {
        encodeName = encodeName.substring(0, encodeName.indexOf(" "));
    }
    if (encodeName.replaceAll('-', '').toUpperCase() != "UTF8") {
        decoder = new TextDecoder(encodeName);
        doc = decoder.decode(data);
    }
    return doc;
}

function sendToExtension(url, tabTitle) {
    chrome.runtime.sendMessage({type: "sendToSlickRSS", url: url, tabTitle: tabTitle, targetEnv: options.targettype}).then(function () {
    });
}

function sendToExtensionFeedList(feedList) {
    if (feedList.length > 0) {
        chrome.runtime.sendMessage({type: "sendToSlickRSSFeedList", feedList: feedList, targetEnv: options.targettype}).then(function () {
        });
    }
}

function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}