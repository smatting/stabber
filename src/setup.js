(function() {
  window.addEventListener('load', (event) => {
    browser.windows.getCurrent().then(function(windowInfo) {
        const myWindowId = windowInfo.id;

        var app = Elm.Main.init({
          node: document.getElementById('elm'),
          flags: "bla"
        });

        app.ports.highlight.subscribe(function(highlightInfo) {
          chrome.tabs.highlight(highlightInfo);
        });

        const queryTabs = function() {
          chrome.runtime.sendMessage(null, {stabberMsgType: "queryTabs", windowId: myWindowId});
        }

        window.onfocus = function () {
            queryTabs();
        };

        app.ports.queryTabs.subscribe(function() {
            queryTabs();
        });

        app.ports.doCloseTab.subscribe(function(msg) {
            chrome.tabs.remove(msg.tabId, function() {});

        });

        chrome.runtime.onMessage.addListener(function(message, sender) {
            document.getElementById("tab-search").focus(); 

            // console.log('Got message', message);
            // console.log('WINDOW_ID_CURRENT', browser.windows.WINDOW_ID_CURRENT);
            // console.log('message.windowId', message.windowId);
            if (message.windowId !== myWindowId) {
                return;
            }
            
            if (message.stabberMsgType == "tabs") {
                console.log('message.tabs', message.tabs);

                console.log('size', _.size(message.tabs));


                const tabs = _.map(message.tabs, function(tab) {
                    var favIconUrl = null;
                    if (tab.favIconUrl) {
                        favIconUrl = tab.favIconUrl.toString();
                    }
                    return { id: tab.id
                           , windowId: tab.windowId
                           , index: tab.index
                           , title: tab.title
                           , favIconUrl: favIconUrl
                           , lastAccessed: tab.lastAccessed
                           , url: tab.url
                           };
                });

                // console.log('Got tabs', tabs);

                app.ports.tabs.send(tabs);
            }
        });
    });
  });
})();
