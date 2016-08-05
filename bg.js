var queues = {};
var debugDetailUrls = {}; // used as a set

function send(tabId, debugData) {
    console.log('Sending debugData to tab ' + tabId);
    chrome.tabs.sendMessage(tabId, debugData, function(response) {
        if (!response || response.status !== 'ok') {
            console.log("Sending debugData from background script to tab failed; re-enqueueing.");
            if (!queues[tabId]) {
                queues[tabId] = [];
            }
            queues[tabId].push(debugData);
        }
    });
}

function sendQueued() {
    var tabIds = Object.getOwnPropertyNames(queues);
    for (var i = 0; i < tabIds.length; i++) {
        var tabId = tabIds[i];
        console.log("There are " + queues[tabId].length + " debugDatas queued up for tab " + tabId + ".");
        for (var j = 0; j < queues[tabId].length; j++) {
            send(parseInt(tabId), queues[tabId].shift());
        }
        delete queues[tabId]
    }
}
var sender = setInterval(sendQueued, 500);

function respHandler(details) {
    console.log("Got response for " + details.url + " in background script.");

    if (debugDetailUrls[details.url]) {
        console.log("Ignoring response from a debug detail load: " + details.url);
        return;
    }

    details.responseHeaders.forEach(function(header) {
        if (header.name.toLowerCase() !== 'x-debug-data') {
            return;
        }
        console.log("It has an x-debug-data header. Sweet.");

        var debugData = JSON.parse(header.value);
        // TODO add timestamp and show it in the panel content
        debugData.reqUrl = details.url;

        debugData.panels.forEach(function(reqPanel) {
            debugDetailUrls[reqPanel.detailsUrl] = true;
        });

        send(details.tabId, debugData);
    });
}
chrome.webRequest.onCompleted.addListener(respHandler, {urls: ["*://localhost/*"]}, ["responseHeaders"]);
