/** @constructor */
function ZURLBuilder(isGroup, id) {
    if (!id) debugger;
    if (!id || !/^[0-9]+$/.exec(id)) throw "Bad id '"+id+"' in ZURLBuilder";
    this.isGroup = isGroup;
    this.id = id;
}
// Fix-me: convert some to static functions and vars etc.
//
// http://stackoverflow.com/questions/1635116/javascript-class-method-vs-class-prototype-method

ZURLBuilder.prototype.apiURL = "https://api.zotero.org/"; // groups/"+grpId+"/items/";
ZURLBuilder.prototype.format = "?format=atom&content=json";
// ZURLBuilder.prototype.format = "?format=json";
ZURLBuilder.prototype.idURL = function() {
    var type = (this.isGroup ? "groups" : "users");
    var idURL = this.apiURL + type + "/" + this.id + "/";
    // console.log("idURL", idURL);
    return idURL;
}
ZURLBuilder.prototype.idInfo = function() {
    var idURL =
        this.idURL();
    // console.log("idURL", idURL);
    return idURL;
}
ZURLBuilder.prototype.latestItems = function(howMany) {
    if (!howMany) debugger;
    var liURL =
        this.idURL()
        + "items/"
        + this.format
        + "&limit="+howMany
        + "&order=dateModified&itemType=-attachment";
    // console.log("liURL", liURL);
    return liURL;
}
ZURLBuilder.prototype.item = function(itemKey) {
    if (!itemKey) debugger;
    var itemURL =
        this.idURL()
        + "items/"+itemKey
        + this.format
    ;
    // console.log("itemURL", itemURL);
    return itemURL;
}
ZURLBuilder.prototype.itemXML = function(itemKey) {
    if (!itemKey) debugger;
    var itemURL =
        this.idURL()
        + "items/"+itemKey
    ;
    // console.log("itemURL", itemURL);
    return itemURL;
}
ZURLBuilder.prototype.citation = function(itemKey) {
    if (!itemKey) debugger;
    var url =
        this.idURL()
        + "items/"+itemKey
        + "?format=bib&style=apa";
    // console.log("url", url);
    return url;
}
ZURLBuilder.prototype.children = function(itemKey) {
    if (!itemKey) debugger;
    var url =
        this.idURL()
        + "items/"+itemKey
        + "/children"
        + this.format
        + "&order=dateAdded&sort=asc";
    ;
    // console.log("url", url);
    return url;
}

/////////////////////////////////////////////
// ZReader with static functions

/** @constructor */
function ZReader(zURL, outputElt, jsonFun, xmlFun, readyFun, failFun) {
    this.zURL = zURL;
    this.outputElt = outputElt;
    this.jsonFun = jsonFun;
    this.xmlFun = xmlFun;
    this.readyFun = readyFun;
    this.failFun = failFun;
    this.status = {};
}
// Fix-me: clean up! Make a function with relevant args for "onload".
// onloadHelper(rq, outputElt, xmlFun, jsoFun, failFun)
// Or,.... - just remove this version...
ZReader.prototype.onload = function() {
    debugger;
    console.log("prototype xhr callback ", this.rq.status, this.rq);
    if (this.rq.readyState !== 4) {
        console.log("readyState", this.rq.readyState);
        alert("wrong zreader onload function called");
        debugger;
    }
    if(this.rq.status >= 200 && this.rq.status < 400) {
        if (this.outputElt) {
            this.outputElt.classList.remove("zreader-requested");
            this.outputElt.classList.add("zreader-received");
            while (this.outputElt.firstChild) this.outputElt.removeChild(this.outputElt.firstChild);
        }
        var zXml = this.rq.responseText;
        if (this.xmlFun) this.xmlFun(zXml, this.outputElt);
        if (this.jsonFun) {
            var json = ZReader.parseZxml2jsons(zXml);
            this.jsonFun(json, this.outputElt);
        }
        if (this.readyFun) this.readyFun();
    } else {
        console.log("Couldn't read the requested file,<br />status = " + this.rq.status.toString());
        if (this.outputElt) {
            this.outputElt.classList.remove("zreader-requested");
            this.outputElt.classList.add("zreader-error");
            this.outputElt.appendChild(
                ZReader.mkElt("div", null,
                              ["Couldn't read the requested file",
                               ZReader.mkElt("br"),
                               "STATUS = " + this.rq.status.toString()
                              ]));
        }
    }
}
ZReader.prototype.request = function() {
    if (!this.rq) {
        this.rq = ZReader.zReaderRequest(
            this.zURL, this.outputElt, this.jsonFun, this.xmlFun, this.readyFun, this.failFun, this.status);
    } else {
        if (this.rq.readyState === 4)
            // this.onload();
            this.rq.onload();
    }
}

// fix-me: add status object arg
ZReader.zReaderRequest = function(zURL, outputElt, jsonFun, xmlFun, readyFun, failFun, statusObj) {
    console.log("zRR", zURL, "statusObj", statusObj); // debugger;
    var status = outputElt ? outputElt.dataset.zReaderStatus : undefined;
    if (statusObj) status = statusObj["status"];
    switch (status) {
    case undefined:
        if (statusObj) statusObj["status"] = "requested";
        if (outputElt) {
            var infoElt = ZReader.mkElt("div",{"class":"zreader-request-info"},
                                        "Fetching information from Zotero..."
                                        +" (this might not work on mobiles due to a bug in Chrome)"
                                       );
            if (!statusObj) {
                outputElt.dataset.zReaderStatus = "requested";
                outputElt.classList.remove("zreader-error");
                outputElt.classList.remove("zreader-received");
                outputElt.classList.add("zreader-requested");
            }
            outputElt.appendChild(infoElt);
        }
        var rq = new XMLHttpRequest();
        rq.onerror = function(xhrProgEv) { logIt(rq.statusText); logIt(xhrProgEv); };
        rq.onload = function() {
            // console.log("rq.onload xhr callback ", rq.status, rq);
            // logIt("rq.onload xhr callback "+rq.status);
            if(rq.status >= 200 && rq.status < 400) {
                if (statusObj) statusObj["status"] = "received";
                if (outputElt) {
                    if (!statusObj) {
                        outputElt.dataset.zReaderStatus = "received";
                        outputElt.classList.remove("zreader-requested");
                        outputElt.classList.add("zreader-received");
                    }
                    // outputElt.removeChild(infoElt);
                    while (outputElt.firstChild) outputElt.removeChild(outputElt.firstChild);
                }
                var zXml = rq.responseText;
                // logIt("rq.responseText.length="+rq.responseText.length);
                // console.log("zXml", zXml);
                if (xmlFun) xmlFun(zXml, outputElt);
                if (jsonFun) {
                    var json = ZReader.parseZxml2jsons(zXml);
                    // jsons[i] = JSON.parse(jsonStr);
                    // var json = JSON.parse(zXml);
                    jsonFun(json, outputElt);
                }
                if (readyFun) readyFun();
            } else {
                console.log("Couldn't read the requested file,<br />status = " + rq.status.toString());
                if (statusObj) statusObj["status"] = "failed";
                if (outputElt) {
                    if (!statusObj) {
                        outputElt.dataset.zReaderStatus = "failed";
                        outputElt.classList.remove("zreader-requested");
                        outputElt.classList.add("zreader-error");
                    }
                    outputElt.appendChild(
                        ZReader.mkElt("div", null,
                                      ["Couldn't read the requested file",
                                       ZReader.mkElt("br"),
                                       "status = " + rq.status.toString()
                                      ]));
                    if (failFun) failFun();
                }
            }
        };
        // readyState seems ok in Chrome on Android, 4 is the last
        // rq.onreadystatechange = function() { logIt("rq.readyState="+rq.readyState); };
        rq.ontimeout = function() { logIt("rq.ontimeout "+zURL); };
        rq.onreadystatechange = function (oEvent) {  
            if (rq.readyState === 4) {  
                if (rq.status === 200) {  
                    // console.log(rq.responseText)  
                } else {  
                    console.log("Error", rq.statusText);  
                }  
            }  
        };  
        rq.open("GET", zURL, true);
        // rq.setRequestHeader("Zotero-API-Version", "2");
        try { rq.send(); } catch(e) { logIt(e); }
        return rq;
        // break;
    }
}
ZReader.zReaderDump = function(URL) {
    ZReader.zReaderRequest(URL, null, null, function(xml) {console.log("URL recieved", URL, xml); });
}
ZReader.setupToggleForFetch = function(zURL, outputContainer, title, popTitle, displayFun, failFun) {
    var fragment = document.createDocumentFragment();
    var leftArrow = String.fromCharCode(0x25b6);
    var downArrow = String.fromCharCode(0x25bc);
    var toggleElt = ZReader.mkElt("span",
                                  {"class":"zreader-toggle-fetch unselectable", "tabindex":"0"},
                                  [title+" ", ZReader.mkElt("span", null, leftArrow)]);
    if (popTitle)
        toggleElt.setAttribute("title", popTitle);
    var outputInnerElt = ZReader.mkElt("div", {"class":"zreader-toggle-fetch-inner"});
    var outputElt = ZReader.mkElt("div", {"class":"zreader-toggle-fetch-output"}, outputInnerElt);
    fragment.appendChild(toggleElt);
    fragment.appendChild(outputElt);
    outputContainer.appendChild(fragment);
    outputElt.style.display = "none";
    function toggleClick(ev){
        // Chrome seems to split text node if you happen to select
        // part of their text. So we have to use lastChild, which I
        // did not know existed. ;-)
        // var arrow = toggleElt.firstChild.nextSibling;
        var arrow = toggleElt.lastChild;
        if (outputElt.style.display != "none") {
            outputElt.style.display = "none";
            arrow.replaceChild(document.createTextNode(leftArrow), arrow.firstChild);
        } else {
            outputElt.style.display = "block";
            arrow.replaceChild(document.createTextNode(downArrow), arrow.firstChild);
            ZReader.zReaderRequest(zURL, outputInnerElt, displayFun, null, null, failFun);
        }
    }
    toggleElt.addEventListener("click", function(ev){ toggleClick(ev); });
    toggleElt.addEventListener("keypress", function(ev){
        switch( ev.keyCode ) {
        case 13: toggleClick(ev); break; // CR
        }
    });
}


// FIX-ME: rewrite. have to get more than the content tags!!!
// ZReader.getZxmlContents = function(zXml) {
//     // console.log(zXml);
//     theJX = zXml;
//     var dp = new DOMParser();
//     zDom = dp.parseFromString(zXml, "text/html");
//     var contents = zDom.querySelectorAll("content");
//     return contents;
// }
ZReader.parseZxml2jsons = function(zXml) {
    // var contents = ZReader.getZxmlContents(zXml);
    theJX = zXml;
    var dp = new DOMParser();
    var zDom = dp.parseFromString(zXml, "text/xml");
    var entries = zDom.querySelectorAll("entry");
    E = entries;
    var jsons = [];
    // for (var i=0; i<contents.length; i++) {
    //     var content = contents[i];
    //     var jsonStr = content.firstChild.nodeValue;
    //     jsons[i] = JSON.parse(jsonStr);
    // }
    // console.log(json);
    for (var i=0; i<entries.length; i++) {
        var entry = entries[i];
        var keyTags = entry.getElementsByTagNameNS("http://zotero.org/ns/api", "key");
        var keyTag = keyTags[0];
        var itemKey = keyTag.textContent;
        var publishedTag = entry.querySelector("published");
        var published = publishedTag.textContent;
        var content = entry.querySelector("content");
        var jsonStr = content.firstChild.nodeValue;
        var json = JSON.parse(jsonStr);
        json["zoteroItemKey"] = itemKey;
        json["zoteroPublished"] = published;
        jsons[i] = json;
    }
    J = jsons;
    return jsons;
}

ZReader.mkElt = function(type, attrib, inner) {
    var elt = document.createElement(type);
    function addInner(inr) {
        if (typeof inr == "string") {
            var txt = document.createTextNode(inr);
            elt.appendChild(txt);
        } else {
            elt.appendChild(inr);
        }
    }
    if (inner) {
        if (inner.length && typeof inner != "string") {
            for (var i=0; i<inner.length; i++)
                if (inner[i])
                    addInner(inner[i]);
        } else
            addInner(inner);
    }
    for (var x in attrib) {
        elt.setAttribute(x, attrib[x]);
    }
    return elt;
}

ZReader.requestLibInfo = function(zLibURL, onloadFun) {
    var xhr = new XMLHttpRequest();
    var url = "http://ourcomments.org/cgi-bin/zlibdesc.php?zlib="+zLibURL;
    // console.log("requestLibInfo url", url);
    xhr.open("get", url, true);
    xhr.onerror = function(xhrProgEv) { logIt(rq.statusText); logIt(xhrProgEv); };
    xhr.onload = function() { onloadFun(xhr); };
    try { xhr.send(); } catch(e) { logIt(e); }
}
ZReader.showLibInfo = function(zLibURL, libName, where) {
    // console.log("showLibInfo zLibURL", zLibURL);
    var here = where;
    while(here.firstChild) here.removeChild(here.firstChild);
    here.appendChild(ZReader.mkElt("span", null, "Fetching info..."));
    here.style.display = "block";
    ZReader.requestLibInfo(zLibURL, function(xhr){
        while(here.firstChild) here.removeChild(here.firstChild);
        var header = ZReader.mkElt("div", {"class":"libinfo-header", "title":"Visit Zotero"},
                           ["Zotero library ",
                            ZReader.mkElt("a", {"href":zLibURL}, libName)]);
        if(xhr.status >= 200 && xhr.status < 400) {
            var zXml = xhr.responseText;
            // console.log(zXml);
            var body = ZReader.mkElt("div");
            body.innerHTML = zXml;
            // Check for relative links:
            var links = body.querySelectorAll("a");
            for (var i=0, lnk; lnk=links[i++]; ) {
                var href = lnk.getAttribute("href");
                if (href.substr(0,1) === "/") {
                    lnk.setAttribute("href", "https://www.zotero.org"+href);
                }
            }
            here.appendChild(header);
            here.appendChild(body);
        } else {
            here.innerHTML = "Could not get info. Please right click on link.";
            console.log("Couldn't read the requested file, status = " + xhr.status.toString());
        }
    });
}

