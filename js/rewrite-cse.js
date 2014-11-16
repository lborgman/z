// document.querySelector("#___gcse_0 .gsc-results-wrapper-nooverlay .gsc-results-wrapper-visible")
// document.querySelector("#___gcse_0 .gsc-wrapper")

// https://api.zotero.org/users/475425/items/X42A7DEE?format=atom&content=json,bib,html

// https://api.zotero.org/groups/475425/items/X42A7DEE
// ?format=atom&content=json,bib,html
// https://www.zotero.org/groups/from_some_psychologists/items/itemKey/5HC7ATCU

// http://dl.dropboxusercontent.com/u/848981/it/z/js/zformat.html?z=http://www.zotero.org/groups/from_some_psychologists/items/itemKey/KZMETK6R

// 2014-06-25 Added "?" to itemKey reg exp because entries with "?fullsite" started to appear. This also means doubled entries. Exclude those in CSE?



// fix-me: do not loop if no query

// fix-me: div.gsq_a click (popup choices)
//
// - Does not exist until starting typing

// Fix-me: Check all vars declared!!! Rename to the*.

(function() {
    // console.log("no rewriting, exiting instead!"); return;

    console.log("rewrite anon function");
    // External, called on search form:
    window["rewriteCseStart"] = function() {
        var inp = document.getElementById("gsc-i-id1");
        if (!inp) return;
        addKeyboardAndClickEvents();
        var ta = inp.value;
        console.log("rewriteCseStart, ta=", ta, ta.length);
        if (ta.length === 0) return;
        startRewriters();
    };
    function startRewriters() {
        console.log("startRewriters");
        if (!document.querySelector("input.gsc-search-button")) return;
        startRewriterWithNodeCheck();
        addCursorPageRewriters();
    }

    // fix-me: look for compCont in a timer!
    var foundCompCont = false;
    var timerCompCont;
    var loopCompCont = 0;
    function tryAddEventsToCompCont() {
        clearTimeout(timerCompCont);
        if (loopCompCont++ > 20) return;
        var compConts = document.querySelectorAll(".gsc-completion-container");
        if (compConts) {
            var len = compConts.length;
            if (len !== 0) {
                if (len === 1) {
                    console.log("found compCont");
                    foundCompCont = true;
                    var compCont = compConts[0];
                    compCont.addEventListener("click", function() {
                                startRewriterWithNodeCheck();
                    });
                } else {
                    console.log("There where "+len+" completion containers");
                    logIt("There where "+len+" completion containers");
                }
            }
        } else {
            timerCompCont = setTimeout(tryAddEventsToCompCont, 10);
        }
    }
    function addKeyboardAndClickEvents() {
        console.log("addKeyboardAndClickEvents");
        document.querySelector("input.gsc-search-button").addEventListener("click", function() {
            startRewriterWithNodeCheck();
        });
        document.querySelector("#gsc-i-id1").addEventListener("keyup", function(ev) {
            // console.log("keyCode", ev.keyCode);
            if (!foundCompCont) {
                tryAddEventsToCompCont();
            }
            if(ev.keyCode==13) {
                // console.log("start keyCode", ev.keyCode);
                startRewriterWithNodeCheck();
            }
        });
        document.addEventListener("keyup", function(ev) {
            // console.log("doc keyCode", ev.keyCode);
            if(ev.keyCode==13) {
                // console.log("doc start keyCode", ev.keyCode);
                startRewriterWithNodeCheck();
            }
        });
    }
    function addCursorPageRewriters() {
        var cp = document.querySelectorAll("div.gsc-cursor-page")
        // console.log("addCursorPageRewriters", "cp", cp);
        for (var i=0; i<cp.length; i++) {
            var cpi = cp[i];
            cpi.addEventListener("click", function my() {
                // console.log("cp listener here", this);
                startRewriterWithNodeCheck();
                addCursorPageRewriters();
            });
            // cpi.dataset.mycheck = "been here";
        }
    }

    // That it is done twice is because the link appears twice. Cache it!!!
    var cachedJsons = {};
    // nodesToUpdate = {};
    function addNodeToCacheOrUpdate(url, elt) {
        // console.log("addNode", url);
        var json = cachedJsons[url];
        if (json) {
            // console.log("had json");
            updateNode(elt, json);
        } else {
            // console.log("no json", url);
            var old = nodesToUpdate[url];
            var val;
            if (!old) {
                // console.log("request json");
                requestJson(url);
                val = [elt];
            } else {
                val = old;
                val.push(elt);
            }
            nodesToUpdate[url] = val;
        }
    }
    var rewriteTimer;
    var theLoopCheck;
    var theOldCountDown;
    var rewriteCountDown;
    var nodesToUpdate;
    function startRewriterWithNodeCheck() {
        console.log("startRewriterWithNodeCheck");
        function startRewriteTimer() {
            if (rewriteTimer) clearInterval(rewriteTimer);
            rewriteTimer = setInterval(rewriteLinks, 500);
        }
        theLoopCheck = 10; // Looping? Check my clumsiness.
        theOldCountDown = 10; // Wait for the results to be refreshed
        // theTempUpdateCount = 0; // For manual checking number of updated nodes
        rewriteCountDown = 2; // Check if some more results arrive
        nodesToUpdate = {};
        startRewriteTimer();
    }

    function rewriteLinks() {
        if (theLoopCheck-- < 0) {
            console.log("-- looped");
            clearInterval(rewriteTimer); rewriteTimer = null; return;
        }

        // See if the results have been refreshed.
        var mycheckLnks = document.querySelectorAll('#___gcse_0 .gsc-wrapper .gsc-result div.gs-title a.gs-title.mycheck');
        var noMycheckLnks = document.querySelectorAll('#___gcse_0 .gsc-wrapper .gsc-result div.gs-title a.gs-title:not([class~="mycheck"])');
        // console.log("rewriteLinks noMycheckLnks.length", noMycheckLnks.length, mycheckLnks.length);
        if (noMycheckLnks.length === mycheckLnks.length) { if (theOldCountDown-- > 0) return; }

        // Wait to see if all results are there. Fix-me: necessary?
        if (0 === noMycheckLnks.length) {
            // console.log("noMycheckLnksLnks.length === 0");
            var no = document.querySelectorAll('#___gcse_0 .gs-no-results-result');
            // console.log("no", no);
            var no0 = no[0];
            // console.log("no0", no0);
            if (no0) {
                no0.parentNode.style.opacity = 1
            }
            if (rewriteCountDown-- < 0) {
                clearInterval(rewriteTimer); rewriteTimer = null;
                addCursorPageRewriters();
            }
            return;
        }

        for (var i=0, len=noMycheckLnks.length; i<len; i++) {
            var lnk = noMycheckLnks[i];
            lnk.classList.add("mycheck");
            var origURL = lnk.dataset.ctorig;
            // console.log("origURL", origURL);
            var match = new RegExp("https?://www\.zotero\.org/groups/(.*?)/items/itemKey/([^/?]*)")
                .exec(origURL);
            if (!match) {
                console.log("no zotero match", origURL);
                continue;
            }
            var grp = match[1];
            var key = match[2];
            var grpId = zoteroGroupPath2id[grp];
            // noMycheckLnks[i].href = "http://dl.dropboxusercontent.com/u/848981/it/z/zformat.html"
            lnk.href = "http://ourcomments.org/cgi-bin/zformat.php"
            // Do I need to encodeURIComponent here? I can't see I need it.
            // +"?z="+origURL
                +"?zk="+key
                +"&zgi="+grpId
            // +"&f="+formURL
            ;
            // If cturl is not removed Google will open the
            // orig URL. This could look a bit troublesome since
            // Google is supposed to depend on this. However what
            // Google really should be interested in is rather the
            // rewritten links!
            //
            // http://stackoverflow.com/questions/11616183/google-custom-search-results-display-wrong-through-a-proxy
            // delete lnk.dataset.cturl;
            lnk.dataset.cturl = lnk.href;
            lnk.dataset.ctorig = lnk.href;
            // var children = lnk.childNodes;
            // first[i] = lnk.firstChild;
            // var currentTitle = lnk.textContent;
            // var firstChar = currentTitle.substr(0,1);
            if (
                origURL.match(/zotero.org\//) // fix-me: is not this enough???
                // || currentTitle.match(/Zotero/)
                // || currentTitle.match(/^Groups /)
                // || (firstChar != firstChar.toUpperCase())
               )
            {
                addNodeToCacheOrUpdate(origURL, lnk);
                // requestTitleUpdate(lnk);
            }
        }
        addCursorPageRewriters();
    }
    // Fix-me:
    function requestJson(origURL) {
        // console.log("requestJson", origURL);
        var match = new RegExp("https?://www\.zotero\.org/groups/(.*?)/items/itemKey/([^/?]*)")
            .exec(origURL);
        var grp = match[1];
        var key = match[2];
        var grpId = zoteroGroupPath2id[grp];
        var urlBuilder = new ZURLBuilder(true, grpId);
        var zURL = urlBuilder.item(key);
        // console.log("requestJson, zURL", zURL);
        var rq = new XMLHttpRequest();
        rq.onerror = function(xhrProgEv) { logIt(rq.statusText); logIt(xhrProgEv); };
        rq.onload = function() {
            // console.log("new xhr callback ", rq.status);
            if(rq.status >= 200 && rq.status < 400) {
                var zXml = rq.responseText;
                // var json = parseZxml2json(zXml);
                var jsons = ZReader.parseZxml2jsons(zXml);
                var json = jsons[0];
                cachedJsons[origURL] = json;
                // fix-me: updateNode(json);
                var nodes = nodesToUpdate[origURL];
                // for (var i=0, node; node=nodes[i++];) {
                var node;
                while ( node = nodes.pop() ) {
                    updateNode(node, json);
                }
            } else {
                cachedJsons[origURL] = null;
                logIt("Couldn't read the requested file, status = " + rq.status.toString());
            }
        };
        rq.open("GET", zURL, true);
        // rq.setRequestHeader("Zotero-API-Version", "2");
        try { rq.send(); } catch(e) { logIt(e); }
    }
    // Fix-me: use ZReader
    // theUpdatedNodes = [];
    function updateNode(node, json) {
        myx = node;
        // console.log("updateNode", node);
        // if (theUpdatedNodes[node]) { console.log("already updated", theTempUpdateCount, node); }
        // theUpdatedNodes.push(node);
        // theTempUpdateCount++;
        // console.log("updateNode", theTempUpdateCount, node);
        var title = json["title"];
        // console.log("title", title);
        if (title) {
            // var parsedDate = json["parsedDate"];
            // console.log("parsedDate", parsedDate);
            var date = json["date"];
            // console.log("date", date);
            if (date) {
                var m = /[0-9]{4}/.exec(date);
                var yyyy = m ? m[0] : date;
                title += " ("+yyyy+")";
            }
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
                if (!url) {
                    var extra = json["extra"];
                    if (extra) {
                        var m = new RegExp(/\bPMID: (\d+)/).exec(extra);
                        var pmid = m[1];
                        if (pmid) { url = "http://www.ncbi.nlm.nih.gov/pubmed/"+pmid }
                    }
                }
                if (!url) {
                    var isbn = json["ISBN"];
                    // This works today, 2014-10-08
                    // https://www.google.com/search?tbm=bks&q=isbn:9780393707465
                    if (isbn) { url = "https://www.google.com/search?tbm=bks&q=isbn:"+isbn; }
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
                    // shortDisplayer.innerText = shortUrl;
                    shortDisplayer.textContent = shortUrl;
                    // longDisplayer.innerText = url;
                    longDisplayer.textContent = url;
                } else {
                    shortDisplayer.textContent = "(Unknown URL)";
                    longDisplayer.textContent = "(Unknown URL)";
                    console.log("unknown url, json", json);
                }
            }
            // node.parentNode.parentNode.parentNode.parentNode.style.visibility = "visible";
            node.parentNode.parentNode.parentNode.parentNode.style.opacity = "1.0";
        } else {
            // was deleted from Zotero
            node.parentNode.parentNode.parentNode.parentNode.style.display = "none";
        }
    }
    // startRewriters();
})();
