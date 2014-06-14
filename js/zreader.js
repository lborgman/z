function ZURLBuilder(isGroup, id) {
    if (!id || !/^[0-9]+$/.exec(id)) throw "Bad id '"+id+"' in ZURLBuilder";
    this.isGroup = isGroup;
    this.id = id;
}
// Fix-me: convert some to static functions and vars etc.
//
// http://stackoverflow.com/questions/1635116/javascript-class-method-vs-class-prototype-method

ZURLBuilder.prototype.apiURL = "https://api.zotero.org/"; // groups/"+grpId+"/items/";
ZURLBuilder.prototype.format = "?format=atom&content=json";
ZURLBuilder.prototype.idURL = function() {
    var type = (this.isGroup ? "groups" : "users");
    var idURL = this.apiURL + type + "/" + this.id + "/";
    console.log("idURL", idURL);
    return idURL;
}
ZURLBuilder.prototype.latestItems = function(howMany) {
    var liURL =
        this.idURL()
        + "items/"
        + this.format
        + "&limit="+howMany
        + "&order=dateModified&itemType=-attachment";
    console.log("liURL", liURL);
    return liURL;
}
ZURLBuilder.prototype.item = function(itemKey) {
    var itemURL =
        this.idURL()
        + "items/"+itemKey
        + this.format
    ;
    console.log("itemURL", itemURL);
    return itemURL;
}
ZURLBuilder.prototype.itemXML = function(itemKey) {
    var itemURL =
        this.idURL()
        + "items/"+itemKey
    ;
    console.log("itemURL", itemURL);
    return itemURL;
}
ZURLBuilder.prototype.citation = function(itemKey) {
    var url =
        this.idURL()
        + "items/"+itemKey
        + "?format=bib&style=apa";
    console.log("url", url);
    return url;
}
ZURLBuilder.prototype.children = function(itemKey) {
    var url =
        this.idURL()
        + "items/"+itemKey
        + "/children"
        + this.format
        + "&order=dateAdded&sort=asc";
    ;
    console.log("url", url);
    return url;
}

/////////////////////////////////////////////
// ZReader with static functions

function ZReader(zURL, outputElt, jsonFun, xmlFun, readyFun) {
    this.zURL = zURL;
    this.outputElt = outputElt;
    this.jsonFun = jsonFun;
    this.xmlFun = xmlFun;
    this.readyFun = readyFun;
}
// Fix-me: clean up!
ZReader.prototype.onload = function() {
    console.log("xhr callback ", this.rq.status);
    if (this.rq.readyState !== 4) {
        console.log("readyState", this.rq.readyState);
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
            this.outputElt.appendChild(ZReader.mkElt("div", null,
                                                     "Couldn't read the requested file,<br />status = "
                                                     + this.rq.status.toString()));
        }
    }
}
ZReader.prototype.request = function() {
    if (!this.rq) {
        this.rq = ZReader.zReaderRequest(this.zURL, this.outputElt, this.jsonFun, this.xmlFun, this.readyFun);
    } else {
        if (this.rq.readyState === 4)
            this.onload();
    }
}

ZReader.zReaderRequest = function(zURL, outputElt, jsonFun, xmlFun, readyFun) {
    console.log("zRR", zURL);
    var status = outputElt ? outputElt.dataset.zReaderStatus : undefined;
    switch (status) {
    case undefined:
        if (outputElt) {
            var infoElt = ZReader.mkElt("div",{"class":"zreader-request-info"},
                                        "Fetching information from Zotero...");
            outputElt.dataset.zReaderStatus = "requested";
            outputElt.classList.remove("zreader-error");
            outputElt.classList.remove("zreader-received");
            outputElt.classList.add("zreader-requested");
            outputElt.appendChild(infoElt);
        }
        var rq = new XMLHttpRequest();
        rq.onload = function() {
            console.log("xhr callback ", rq.status);
            if(rq.status >= 200 && rq.status < 400) {
                if (outputElt) {
                    outputElt.dataset.zReaderStatus = "received";
                    outputElt.classList.remove("zreader-requested");
                    outputElt.classList.add("zreader-received");
                    // outputElt.removeChild(infoElt);
                    while (outputElt.firstChild) outputElt.removeChild(outputElt.firstChild);
                }
                var zXml = rq.responseText;
                console.log("zXml", zXml);
                if (xmlFun) xmlFun(zXml, outputElt);
                if (jsonFun) {
                    var json = ZReader.parseZxml2jsons(zXml);
                    jsonFun(json, outputElt);
                }
                if (readyFun) readyFun();
            } else {
                console.log("Couldn't read the requested file,<br />status = " + rq.status.toString());
                if (outputElt) {
                    outputElt.dataset.zReaderStatus = "failed";
                    outputElt.classList.remove("zreader-requested");
                    outputElt.classList.add("zreader-error");
                    outputElt.appendChild(ZReader.mkElt("div", null,
                                                        "Couldn't read the requested file,<br />status = "
                                                        + rq.status.toString()));
                }
            }
        };
        rq.open("GET", zURL, true);
        rq.setRequestHeader("Zotero-API-Version", "2");
        rq.send();
        return rq;
        break;
    }
}
ZReader.zReaderDump = function(URL) {
    ZReader.zReaderRequest(URL, null, null, function(xml) {console.log("URL recieved", URL, xml); });
}
ZReader.setupToggleForFetch = function(zURL, outputContainer, title, popTitle, displayFun) {
    var fragment = document.createDocumentFragment();
    var leftArrow = String.fromCharCode(0x25b6);
    var downArrow = String.fromCharCode(0x25bc);
    var toggleElt = ZReader.mkElt("span", {"class":"zreader-toggle-fetch"},
                                  [title+" ", ZReader.mkElt("span", null, leftArrow)]);
    if (popTitle)
        toggleElt.setAttribute("title", popTitle);
    var outputInnerElt = ZReader.mkElt("div", {"class":"zreader-toggle-fetch-inner"});
    var outputElt = ZReader.mkElt("div", {"class":"zreader-toggle-fetch-output"}, outputInnerElt);
    fragment.appendChild(toggleElt);
    fragment.appendChild(outputElt);
    outputContainer.appendChild(fragment);
    outputElt.style.display = "none";
    toggleElt.addEventListener("click", function(ev){
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
            ZReader.zReaderRequest(zURL, outputInnerElt, displayFun);
        }
    });
}



ZReader.getZxmlContents = function(zXml) {
    // console.log(zXml);
    var dp = new DOMParser();
    zDom = dp.parseFromString(zXml, "text/html");
    var contents = zDom.querySelectorAll("content");
    return contents;
}
ZReader.parseZxml2jsons = function(zXml) {
    var contents = ZReader.getZxmlContents(zXml);
    var jsons = [];
    for (var i=0; i<contents.length; i++) {
        var content = contents[i];
        var jsonStr = content.firstChild.nodeValue;
        jsons[i] = JSON.parse(jsonStr);
    }
    // console.log(json);
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

