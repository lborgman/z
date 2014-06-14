// document.querySelector("#___gcse_0 .gsc-results-wrapper-nooverlay .gsc-results-wrapper-visible")
// document.querySelector("#___gcse_0 .gsc-wrapper")

// https://api.zotero.org/users/475425/items/X42A7DEE?format=atom&content=json,bib,html

// https://api.zotero.org/groups/475425/items/X42A7DEE
// ?format=atom&content=json,bib,html
// https://www.zotero.org/groups/from_some_psychologists/items/itemKey/5HC7ATCU

// http://dl.dropboxusercontent.com/u/848981/it/cw/zformat.html?z=http://www.zotero.org/groups/from_some_psychologists/items/itemKey/KZMETK6R

(function() {
    // External, called on search form:
    window["rewriteCseStart"] = function() { startRewriters(); };
    function startRewriters() {
        if (!document.querySelector("input.gsc-search-button")) return;
        startRewriterWithNodeCheck();
        addCursorPageRewriters();
    }

    function addCursorPageRewriters() {
        document.querySelector("input.gsc-search-button").addEventListener("click", function() {
            startRewriterWithNodeCheck();
        });
        document.querySelector("#gsc-i-id1").addEventListener("keyup", function(ev) {
            console.log("keyCode", ev.keyCode);
            if(ev.keyCode==13) {
                console.log("start keyCode", ev.keyCode);
                startRewriterWithNodeCheck();
            }
        });
        document.addEventListener("keyup", function(ev) {
            console.log("doc keyCode", ev.keyCode);
            if(ev.keyCode==13) {
                console.log("doc start keyCode", ev.keyCode);
                startRewriterWithNodeCheck();
            }
        });
        var cp = document.querySelectorAll("div.gsc-cursor-page")
        for (var i=1; i<cp.length; i++) {
            cp[i].addEventListener("click", function() {
                startRewriterWithNodeCheck();
                addCursorPageRewriters();
            });
        }
    }

    var rewriteTimer;
    function startRewriterWithNodeCheck() {
        function startRewriteTimer() {
            if (rewriteTimer) clearInterval(rewriteTimer);
            rewriteTimer = setInterval(rewriteLinks, 500);
        }
        var lnks = document.querySelector("#___gcse_0 .gsc-wrapper .gsc-result div.gs-title a.gs-title");
        if (lnks) {
            lnks.dataset.mycheck = "started";
        }
        startRewriteTimer();
    }
    function rewriteLinks() {
        var lnks = document.querySelectorAll("#___gcse_0 .gsc-wrapper .gsc-result div.gs-title a.gs-title");
        if (0==lnks.length) return;
        var mycheck = lnks[0].dataset.mycheck;
        if (mycheck) return;
        clearInterval(rewriteTimer);
        rewriteTimer = null;
        var first = [];
        var rq = [];
        for (var i=0; i<lnks.length; i++) {
            var origURL = lnks[i].dataset.ctorig;
            var match = new RegExp("https?://www\.zotero\.org/groups/(.*?)/items/itemKey/([^/]*)")
                .exec(origURL);
            var grp = match[1];
            var key = match[2];
            var grpId = groupIds[grp];
            // console.log(origURL);
            // lnks[i].href = "http://dl.dropboxusercontent.com/u/848981/it/cw/zformat.html"
            lnks[i].href = "http://ourcomments.org/cgi-bin/zformat.php"
            // Do I need to encodeURIComponent here? I can't see I need it.
                // +"?z="+origURL
                +"?zk="+key
                +"&zgi="+grpId
                // +"&f="+formURL
            ;
            // If cturl is not removed Google will open the orig URL. This
            // is a bit troublesome since Google might depend on this.
            // lnks[i].dataset.cturl = null;
            delete lnks[i].dataset.cturl;
            var children = lnks[i].childNodes;
            // console.log(children, children.length);
            txten = lnks[i];
            // console.log(txten);
            first[i] = lnks[i].firstChild;
            var currentTitle = lnks[i].innerText;
            var firstChar = currentTitle.substr(0,1);
            if (currentTitle.match(/Zotero/)
                || currentTitle.match(/^Groups /)
                || (firstChar != firstChar.toUpperCase())
               )
            {
                // console.log("bad", currentTitle);
                requestTitleUpdate(lnks[i]);
            }
        }
        addCursorPageRewriters();
    }
    function requestTitleUpdate(node) {
        var origURL = node.dataset.ctorig;
        var match = new RegExp("https?://www\.zotero\.org/groups/(.*?)/items/itemKey/([^/]*)")
            .exec(origURL);
        var grp = match[1];
        var key = match[2];
        var grpId = groupIds[grp];
        // console.log(grp, grpId);
        // https://api.zotero.org/groups/56508/items/RAKVQ4W8?format=atom&content=json
        var zBaseURL = "https://api.zotero.org/groups/"+grpId+"/items/"+key;
        var zURL = zBaseURL+"?format=atom&content=json";
        // console.log(zURL);
        var rq = new XMLHttpRequest();
        rq.onload = function() {
            // console.log("xhr callback ", rq.status);
            if(rq.status >= 200 && rq.status < 400) {
                var zXml = rq.responseText;
                var json = parseZxml2json(zXml);
                var title = json["title"];
                // console.log("title", title);
                if (title) {
                    node.replaceChild(document.createTextNode(title), node.firstChild);
                    while(node.firstChild) node.removeChild(node.firstChild);
                    node.appendChild(document.createTextNode(title));
                    var urlDisplayer = node.parentNode.parentNode.nextSibling;
                    // console.log("urlDisplayer", urlDisplayer);
                    if (urlDisplayer) {
                        var shortDisplayer = urlDisplayer.querySelector(".gs-visibleUrl-short");
                        var longDisplayer = urlDisplayer.querySelector(".gs-visibleUrl-long");
                        var url = json["url"];
                        if (!url) {
                            var doi = json["DOI"];
                            if (doi) url = "http://dx.doi.org/"+doi;
                        }
                        if (url) {
                            // console.log("url", url);
                            var getLocation = function(href) {
                                var l = document.createElement("a");
                                l.href = href;
                                return l;
                            };
                            var loc = getLocation(url);
                            // var shortUrl = loc.protocol + "//" + loc.hostname + "/";
                            var shortUrl = loc.hostname;
                            // console.log("shortUrl", shortUrl);
                            // console.log(shortDisplayer, longDisplayer);
                            shortDisplayer.innerText = shortUrl;
                            longDisplayer.innerText = url;
                        } else {
                            shortDisplayer.innerText = "(Unknown URL)";
                            longDisplayer.innerText = "(Unknown URL)";
                        }
                    }
                } else {
                    // was deleted from Zotero
                    node.parentNode.parentNode.parentNode.parentNode.style.display = "none";
                }
            } else {
                console.log("Couldn't read the requested file,<br />status = " + rq.status.toString());
            }
        };
        rq.open("GET", zURL, true);
        rq.setRequestHeader("Zotero-API-Version", "2");
        rq.send();
    }
    function getZxmlContents(zXml) {
        var dp = new DOMParser();
        zDom = dp.parseFromString(zXml, "text/html");
        // var jsonStr = zDom.querySelectorAll("content").firstChild.nodeValue;
        var contents = zDom.querySelectorAll("content");
        return contents;
    }
    function parseZxml2json(zXml) {
        var contents = getZxmlContents(zXml);
        var content = contents[0];
        var jsonStr = content.firstChild.nodeValue;
        var json = JSON.parse(jsonStr);
        x = json;
        // console.log(json);
        return json;
    }
    // Fix-me: move. Should this be in calling html page?
    var groupIds = {
        "from_some_psychologists":56508,
        "minding_my_mitochondria_terry_wahls":136570
    };
    // var formURL = window.location.href;
    // formURL = formURL.replace(/\?.*/, "");
    // console.log("hi, i am here! /rewrite-cse", formURL);
    startRewriters();
})();
