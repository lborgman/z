/** constructor */
ZReaderRefCopier = {};

/**
 * @type {function}
 * @param {string}
 */
ZReaderRefCopier.insertIt = function(html) {
    var ta = (typeof tinymce != "undefined" ?
              // Normal action in WP
              tinymce.activeEditor.getElement()
              // If no tinyMCE use first textarea
              : document.getElementsByTagName("textarea")[0]);
    if ("none" == ta.style.display) {
        console.log("insert into tinymce");
        tinymce.activeEditor.execCommand('mceInsertContent', false, "some text");
    } else {
        console.log("insert into textarea at caret pos");
        if (ta.selectionStart || ta.selectionStart === 0) {
            var startPos = ta.selectionStart;
            var endPos = ta.selectionEnd;
            var scrollTop = ta.scrollTop;
            ta.value = ta.value.substring(0, startPos)
                + html
                + ta.value.substring(endPos, ta.value.length);
            ta.focus();
            ta.selectionStart = startPos + html.length;
            ta.selectionEnd = startPos + html.length;
            ta.scrollTop = scrollTop;
        } else {
            console.log("no browser support, IE?");
            alert("Please switch to Visual editing mode first");
        }
    }
}

// ZReaderRefCopier.prototype.getParams = function(html) {
// }

/**
 * @function
 * @param {string}
 * @param {string}
 */
ZReaderRefCopier.showForm = function(zGrpId, zItemKey) {
    function doShowForm() {
        var zr = new ZReader();
        var bgDiv = document.getElementById("zrefcopier-bg");
        if (bgDiv) {
            bgDiv.style.display = "flex";
        } else {

            ///////////////////////////////////////////////////
            //// Output updating

            function clearOutput() {
                delete citOutDiv.dataset.zReaderStatus;
                while(citOutDiv.firstChild) citOutDiv.removeChild(citOutDiv.firstChild);

                delete absOutDiv.dataset.zReaderStatus;
                while(absOutDiv.firstChild) absOutDiv.removeChild(absOutDiv.firstChild);

                delete lnkOutDiv.dataset.zReaderStatus;
                while(lnkOutDiv.firstChild) lnkOutDiv.removeChild(lnkOutDiv.firstChild);
            }
            function updateOutput(what, checked) {
                console.log("updateOutput", what, checked);
                if (what) {
                    if (checked) {
                        outputList.push(what);
                        // if (outputList.length > 2) outputList.length = 2;
                    } else {
                        for (var i=0; i<outputList.length; i++) {
                            if (outputList[i] === what) {
                                outputList.splice(i, 1);
                                // break;
                            }
                        }
                    }
                }
                // console.log(outputList, myURLBuilder);
                if (myURLBuilder) {
                    function addEmptyRows() {
                        ////// Try making it easier after paste in Wordpress etc
                        // viewDiv.appendChild(mkElt("br"));
                        // viewDiv.appendChild(mkElt("br"));
                        viewDiv.appendChild(mkElt("hr"));
                    }
                    while (viewDiv.firstChild) viewDiv.removeChild(viewDiv.firstChild);
                    for (var i=0; i<outputList.length; i++) {
                        addEmptyRows();
                        switch (outputList[i]) {
                        case "citation":
                            viewDiv.appendChild(citOutDiv);
                            requestCitation();
                            break;
                        case "abstract":
                            viewDiv.appendChild(absOutDiv);
                            requestAbstract();
                            break;
                        case "short":
                            viewDiv.appendChild(lnkOutDiv);
                            requestShort();
                            break;
                        default:
                            console.log("bad value in outputList", outputList);
                        }
                    }
                    addEmptyRows();
                }
            }



            /////////////////////////////////////////////
            //// Build form and display it

            var mkElt = ZReader.mkElt;

            bgDiv = mkElt("div", {"id":"zrefcopier-bg"});
            document.body.appendChild(bgDiv);
            var bgs = bgDiv.style;
            bgs.position = "fixed";
            bgs.top = "0";
            bgs.left = "0";
            bgs.width = "100%";
            bgs.height = "100%";
            bgs.background = "rgba(30, 30, 30, 0.7)";
            bgs.zIndex = "100";
            bgs.cursor = "wait";

            var closeBtn = mkElt("a", {"id":"zrefcopier-closeform", "title":"Close"},
                                 String.fromCharCode(10006)
                                 // "CLOSE"
                                );
            // var btnDiv = mkElt("div", {"id":"zrefcopier-button-div"}, closeBtn);

            var headDiv = mkElt(
                "div", {"id":"zrefcopier-header"},
                [
                    mkElt("span", null,
                          "From here you can copy and paste with formatting to Wordpress,"
                          +" LibreOffice etc. "),
                    mkElt("a", {"href":"javascript:alert('more info is coming soon')"},
                          "More info")
                ]);
            var urlInp;
            var urlLabel;
            if (!zItemKey) {
                urlInp = mkElt("input", {"id":"zrefcopier-url", "type":"text"});
                urlLabel = mkElt("label", null, ["Enter URL of reference in Zotero", urlInp]);
            }
            //var optInfoDiv = mkElt("div", null, "Choose output parts and then click 'Copy' below:");
            var optOutDiv = mkElt("div");

            var viewDiv = mkElt("div", {"id":"zrefcopier-view", "contenteditable":"false"});
            var viewContainer = mkElt("div", {"id":"zrefcopier-view-container"},
                                      // [viewDiv, copyBtn]);
                                      [viewDiv]);
            // viewContainer.appendChild(viewDiv);

            var oldViewDiv;
            // viewDiv.addEventListener("copy", function(e, t) {
            //     return;
            //     console.log("copy event", e, t);
            //     setTimeout(function(){
            //         while (viewDiv.firstChild) viewDiv.removeChild(viewDiv.firstChild);
            //         for (var c=oldViewDiv.firstChild; c && oldViewDiv.removeChild(c); c=oldViewDiv.firstChild) {
            //             viewDiv.appendChild(c);
            //         }}, 500);
            // })
            // viewDiv.addEventListener("beforecopy", function(e, t) {
            //     return;
            //     console.log("beforecopy event", e, t);
            //     // console.log("path", e.path);
            //     // console.log("clipboardData", e.clipboardData);
            //     cd = e.clipboardData;
            //     console.log("cd", cd);
            //     cdItems = cd.items;
            //     for (var i=0, item; item=cdItems[i++]; ){
            //         console.log(i, "item=", item);
            //     }
            //     cd.items[0] = { "type":"text/plain", "value":"hej" };
            //     // console.log("clipboardData.getData text/plain", e.clipboardData.getData("text/plain"));
            //     // console.log("clipboardData.items", e.clipboardData.items);
            //     // var selObj = window.getSelection();
            //     // var selRange = selObj.getRangeAt(0);
            //     // console.log("selRange", selRange);
            //     oldViewDiv = document.importNode(viewDiv, true);
            //     var allA = viewDiv.querySelectorAll("a[href]");
            //     for (var i=0, item; item=allA[i++];) {
            //         var href = item.getAttribute("href");
            //         if (href.substring(0,1) === "#") {
            //             item.setAttribute("Zhref", href);
            //             item.removeAttribute("href");
            //         }
            //     }
            //     var childs = viewDiv.querySelector("*");
            //     for (var i=0, item; item=childs[i++];) {
            //         item.removeAttribute("id");
            //     }
            // })
            
            var optInDiv = mkElt("div", {"id":"zrefcopier-inner-controls"});
            var insertBtn = mkElt("button", {"title":"Insert in edited post/page"}, "Insert");
            var copyBtn = mkElt("div", {"id":"zrefcopier-selectall",
                                        "xtitle":"Select all text"}, "Select all text");
            viewContainer.appendChild(copyBtn);
            var optOuterDiv = mkElt("div", {"id":"zrefcopier-outer-controls"},
                                    // [optInDiv, insertBtn, copyBtn]);
                                    [optInDiv, insertBtn]);
            var copyDiv = mkElt("div", {"id":"zrefcopier-copy"},
                                "Now press Control-C to copy to clipboard");

            var formDiv = mkElt("div", {"id":"zrefcopier-form"},
                                // [btnDiv, headDiv, urlLabel, optInfoDiv, optOuterDiv, viewContainer,
                                [headDiv, urlLabel, optOuterDiv, viewContainer, closeBtn,
                                 copyDiv]);
            var formContainer = mkElt("div", {"id":"zrefcopier-form-container"}, formDiv);

            // formDiv.style.display = "none";
            // bgDiv = mkElt("div", {"id":"zrefcopier-bg"}, formDiv);
            // document.body.appendChild(bgDiv);
            // formDiv.style.maxHeight = (window.innerHeight - 200)+"px";
            bgDiv.appendChild(formContainer);
            bgs.cursor = null;

            if (urlInp) urlInp.focus();

            closeBtn.addEventListener("click", function(){ hideBgDiv(); });



            var grpId = zGrpId;
            var itemKey = "TI6C7MH6";
            var itemKey = "EZBTRX9P";
            var itemKey = zItemKey;
            var myURLBuilder;
            if (grpId) myURLBuilder = new ZURLBuilder(true, grpId);
            // Fix-me: If !grpId????

            if (grpId) {
                copyBtn.style.display = "inline-block";
                insertBtn.style.display = "none";
            } else {
                copyBtn.style.display = "none";
                insertBtn.style.display = "inline-block";
            }


            /////////////////////////////////////////////////////////////
            // User Selection

            var outputList = [];

            var lnkChk = mkElt("input", {"id":"zrefcopier-lnk-chk", "type":"checkbox", "checked":"checked"});
            var lnkIn = mkElt("label", {"title":""}, [lnkChk, "Short referens"]);
            optInDiv.appendChild(lnkIn);
            // var lnkOutDiv = mkElt("p", {"class":"zrefcopier-short-ref"});
            var lnkOutDiv = mkElt("p");
            lnkChk.addEventListener("click", function() { updateOutput("short", this.checked); });

            var citChk = mkElt("input", {"id":"zrefcopier-cit-chk", "type":"checkbox", "checked":"checked"});
            var citIn = mkElt("label", {"title":""}, [citChk, "Referens"]);
            optInDiv.appendChild(citIn);
            var citOutDiv = mkElt("blockquote", {
                "class":"zrefcopier-referens",
                "id":mkCiteAnchor()
            });
            citChk.addEventListener("click", function() { updateOutput("citation", this.checked); });

            var absChk = mkElt("input", {"id":"zrefcopier-abs-chk", "type":"checkbox"});
            var absIn = mkElt("label", {"title":""}, [absChk, "Abstract"]);
            optInDiv.appendChild(absIn);
            var absOutDiv = mkElt("blockquote", {"id":"zrefcopier-abstract"});
            absChk.addEventListener("click", function() { updateOutput("abstract", this.checked); });

            updateOutput("short", true);
            updateOutput("citation", true);

            absChk.focus();


            var urlChange = (function() {
                var lastURL = null;
                return function() {
                    var newURL = urlInp.value;
                    // console.log(newURL, lastURL);
                    if (newURL == lastURL) return;
                    lastURL = newURL;
                    clearOutput();

                    var match = new RegExp("\.zotero\.org/groups/(.*?)/items/itemKey/([^/]*)").exec(newURL);
                    match = true;
                    if (match) {
                        var grpTextId;
                        grpTextId = grpTextId || match[1];
                        itemKey = itemKey || match[2];
                        // console.log(grpTextId, itemKey, grpId);
                        if (!grpId) grpId = "56508";
                        myURLBuilder = new ZURLBuilder(true, grpId);
                        updateOutput();
                    }
                }
            })();





            if (urlInp) {
                urlInp.addEventListener("change", urlChange);
                urlInp.addEventListener("keyup", urlChange);
            }

            insertBtn.addEventListener("click", function(){
                var outNode = viewDiv.cloneNode(true);
                var html = outNode.innerHTML;
                ZReaderRefCopier.insertIt(html);
                bgDiv.style.display = "none";
            });

            copyBtn.addEventListener("click", function(){
                // console.log("copyBtn click");
                var range = document.createRange();
                // range.selectNode(viewDiv);
                range.selectNodeContents(viewDiv);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                return;
                // var r = viewDiv.getBoundingClientRect();
                // var s = copyDiv.style;
                // s.position = "fixed";
                // s.left = (r.left-20)+"px";
                // s.top = (r.top-10)+"px";
                // s.display = "inline-block";
            });
            viewDiv.addEventListener("focus", function(){
                // console.log("focus");
                var range = document.createRange();
                range.selectNode(viewDiv);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            });

            function hideBgDivOnESC(ev){
                // console.log("hideBgDivOnESC");
                ev.stopPropagation();
                copyDiv.style.display = "none";
                // console.log("ev.keyCode", ev.keyCode);
                if (27 == ev.keyCode) {
                    // console.log("was 27");
                    hideBgDiv();
                }
            }
            function hideBgDiv() {
                bgDiv.style.display = "none";
                // document.removeEventListener("keydown", hideBgDivOnESC);
            }
            document.addEventListener("keydown", hideBgDivOnESC);
            bgDiv.addEventListener("click", function(ev) {
                ev.stopPropagation();
                hideBgDiv();
            });
            formDiv.addEventListener("click", function(ev) {
                ev.stopPropagation();
                ev.stopImmediatePropagation();
            });

            // console.log("ESC listener added");

            // bgDiv.addEventListener("keypress", function(ev){ console.log("keypress", ev.keyCode); });

            bgDiv.addEventListener("focusout", function(ev){
                // Fix-me: Won't currently work in FF, but it is not
                // really essential and FF will probably support this
                // later.
                ev.stopPropagation();
                var to = ev.relatedTarget;
                if (!to) return;
                var from = ev.target;
                // console.log("bg got focusout, to", to, "from", from);
                var inBg = false;
                n = 0;
                while (!inBg && to && n++ < 30) {
                    to = to.parentNode;
                    // console.log("to", to);
                    inBg = to === bgDiv;
                }
                if (!inBg) {
                    if (from) {
                        // console.log("trying to keep focus");
                        from.focus();
                    }
                }
            });

        }


        ///////////////////////////////////////////////////////////////////////////
        //// Zotero access

        ////// Abstract
        var abstractReader;
        function requestAbstract() {
            while (absOutDiv.firstChild) absOutDiv.removeChild(absOutDiv.firstChild);
            if (!abstractReader) {
                var zItemURL = myURLBuilder.item(itemKey);
                abstractReader = new ZReader(zItemURL, absOutDiv, parseAndOutputAbstract);
            }
            abstractReader.request();
        }
        function parseAndOutputAbstract(jsons, nodeOutput) {
            var json = jsons[0];
            var frag = document.createDocumentFragment();
            var url = json["url"];
            if (!url) {
                var doi = json["DOI"];
                if (doi) url = "http://dx.doi.org/"+doi;
            }
            var title = json["title"];
            frag.appendChild(mkElt("h3", null, title));
            var abstractNote = json["abstractNote"];
            if (abstractNote) {
                abstractNote = abstractNote.trim();
                if (abstractNote.length > 0) {
                    // document.querySelector("head meta[name='twitter:description']").setAttribute("content", abstractNote.substr(0,200));
                    // Preserve new lines
                    var noteLines = abstractNote.split("\n");
                    // console.log("abs length", abstractNote.length);
                    var classes = "sixteen columns";
                    if (abstractNote.length > 500) // 3-4 rows
                        classes += " newspaper-cols";
                    var absContentDiv = ZReader.mkElt("div", {"class":classes});
                    for (var i=0; i<noteLines.length; i++) {
                        if (absContentDiv.childNodes.length > 0) absContentDiv.appendChild(ZReader.mkElt("div", {"class":"br"}));
                        absContentDiv.appendChild(document.createTextNode(noteLines[i]));
                    }
                    frag.appendChild(absContentDiv);
                    nodeOutput.appendChild(frag);
                }
            }
        }

        ////// Short citation (link)
        var citationReader;
        var shortReader;
        // console.log("itemKey", itemKey); debugger;
        // fix-me: closure problem in zReader
        function requestShort() {
            // console.log("requestShort");
            while (lnkOutDiv.firstChild) lnkOutDiv.removeChild(lnkOutDiv.firstChild);
            // fix-me: this will be the same call to Zotero as for
            // citation, just a new parsing function! Or just modify
            // the existing parsing function.
            if (!shortReader) {
                var zShortURL = myURLBuilder.itemXML(itemKey);
                // console.log("zShortURL", zShortURL);
                shortReader = new ZReader(zShortURL, lnkOutDiv, null, parseShort);
            }
            shortReader.request();
        }

        ////// Citation
        function requestCitation() {
            // console.log("requestCitation", itemKey);
            while (citOutDiv.firstChild) citOutDiv.removeChild(citOutDiv.firstChild);
            if (!citationReader) {
                // console.log("zCiteURL", zCiteURL); // debugger;
                var zCiteURL = myURLBuilder.citation(itemKey);
                citationReader = new ZReader(zCiteURL, citOutDiv, null, parseAndOutputCitation);
            }
            citationReader.request();
        }
        function parseShort(zXml, elt) {
            // console.log("short ------------------------- zXml", zXml);
            var dp = new DOMParser();
            zDom = dp.parseFromString(zXml, "application/xml");
            // namespaceURI=http://zotero.org/ns/api
            // http://stackoverflow.com/questions/16616983/unable-to-read-xml-with-namespace-prefix-using-dom-parser
            var ys = zDom.getElementsByTagNameNS("http://zotero.org/ns/api", "year");
            var y0 = ys[0];
            var year = y0 ? y0.firstChild : "20xx";
            // console.log("year", year);

            var cs = zDom.getElementsByTagNameNS("http://zotero.org/ns/api", "creatorSummary");
            var c0 = cs[0];
            var creator = c0 ? c0.firstChild : "(unknown author)";
            // console.log("creator", creator);
            var temp = mkElt("div", null,
                             ["(",
                              mkElt("a",
                                    {
                                        "data-href":"#"+mkCiteAnchor(),
                                        "class":"zrefcopier-short-ref"
                                    },
                                    [creator," ",year]),
                              ")"]);
            // console.log("temp", temp);
            while (temp.firstChild) {
                elt.appendChild(temp.firstChild);
            }
            // console.log("elt", elt);
        }
        // function parseAndOutputShort(zXml, outputNode) { }
        function mkCiteAnchor() { return "z"+zGrpId+"-"+zItemKey; }
        // var anchorElt = mkElt("blockquote", {"id": "z"+zGrpId+"-"+zItemKey});
        function parseAndOutputCitation(zXml, outputNode) {
            // console.log(zXml);
            var dp = new DOMParser();
            var zDom = dp.parseFromString(zXml, "text/html");
            // console.log("zXml", zXml);
            var divCite = zDom.querySelector("div.csl-entry");
            // console.log("divCite", divCite);
            
            // Fix an anchor. For APA-style this can be added to the
            // first <i>. Will this survive to WP?
            var firstIapa = divCite ? divCite.firstChild : "(citation unavailable)";
            // ZReaderRefCopier.showForm = function(zGrpId, zItemKey) {
            // Fix-me: add the div and option for short ref
            // var anchorElt = mkElt("blockquote", {"id": "z"+zGrpId+"-"+zItemKey});

            var anchorElt = mkElt("a",
                                  {
                                      // "id": "z"+zGrpId+"-"+zItemKey,
                                      "id": mkCiteAnchor(),
                                      // "style":"background:yellow; margin-right:10px;",
                                      "class":"zreader-anchor"
                                  },
                                  mkElt("span", {"class":"zreader-hidden-anchor"}, "*"));
            // fix-me: http://www.tinymce.com/develop/bugtracker_view.php?id=7153

            // firstIapa.setAttribute("id", "z"+zGrpId+"-"+zItemKey);
            // anchorElt.appendChild(divCite);
            // divCite.insertBefore(anchorElt, firstIapa);
            // divCite.insertBefore(anchorElt, undefined);
            // console.log(firstIapa);

            function walkTheDOM(node, func) {
                func(node);
                var child = node.firstChild;
                while (child) {
                    // console.log("child", child);
                    var nextChild = child.nextSibling;
                    walkTheDOM(child, func);
                    child = nextChild;
                }
            }
            walkTheDOM(divCite, function(node){
                if ("#text" == node.nodeName) {
                    // console.log(node.nodeValue);
                    var v = node.nodeValue;
                    var m = new RegExp("(.*?doi:)(\\S+)(.*)").exec(v);
                    // console.log(m);
                    if (m) {
                        var frag = document.createDocumentFragment();
                        frag.appendChild(document.createTextNode(m[1]));
                        frag.appendChild(ZReader.mkElt("a",{"href":"http://dx.doi.org/"+m[2], "xtarget":"_blank"},m[2]));
                        if (m[3].length > 0)
                            frag.appendChild(document.createTextNode(m[3]));
                        // console.log(frag);
                        node.parentNode.replaceChild(frag, node);
                    }
                    m = new RegExp("(.*?)(https?://\\S+)(.*)").exec(v);
                    if (m) {
                        var frag = document.createDocumentFragment();
                        frag.appendChild(document.createTextNode(m[1]));
                        frag.appendChild(ZReader.mkElt("a",{"href":m[2], "xtarget":"_blank"},m[2]));
                        if (m[3].length > 0)
                            frag.appendChild(document.createTextNode(m[3]));
                        // console.log(frag);
                        node.parentNode.replaceChild(frag, node);
                    }
                }
            });
            var searchFormURL = "http://ourcomments.org/psych/zfsp.html";
            var urlZot = "http://ourcomments.org/cgi-bin/zformat.php?"
                +["zk="+itemKey, "zgi="+grpId, "f="+searchFormURL].join("&");
            var aZot = mkElt("a", {"href":urlZot}, "in"+String.fromCharCode(160)+"Zotero");
            var spanZot = mkElt("span", null, [" (", aZot, ")"]);
            divCite.appendChild(spanZot);
            while(outputNode.firstChild) outputNode.removeChild(outputNode.firstChild);

            // outputNode.appendChild(divCite);
            var importCite = document.importNode(divCite, true);
            // divCite.insertBefore(anchorElt, undefined);

            // outputNode.appendChild(anchorElt); // Moved anchor to blockquote
            while(importCite.firstChild) {
                var child = importCite.firstChild;
                outputNode.appendChild(child);
                // importCite.removeChild(child);
            }

            // outputNode.appendChild(anchorElt);
        }

    }
    // console.log("showForm", zGrpId, zItemKey);
    var styleId = "zrefcopier-css";
    var eStyle = document.getElementById(styleId);
    if (!eStyle) {
        eStyle = document.createElement("link");
        document.head.appendChild(eStyle);
        eStyle.setAttribute("id", styleId);
        eStyle.setAttribute("rel", "stylesheet");
        eStyle.setAttribute("type", "text/css");
        eStyle.setAttribute("href", "http://dl.dropboxusercontent.com/u/848981/it/z/css/edit.css");
        eStyle.onload = function() {
            // Avoids flickering (if onload event is fired...)
            if (ZReader && ZReader.mkElt) {
                doShowForm();
            }
        }
        if (ZReader && ZReader.mkElt) { return; }
    } else {
        if (ZReader && ZReader.mkElt) {
            doShowForm();
            return;
        }
    }

    var scriptId = "zrefcopier-js";
    var eScript = document.createElement("script");
    document.head.appendChild(eScript);
    eScript.setAttribute("id", scriptId);
    eScript.onload = function() {
        doShowForm();
    } // end eScript onload

    eScript.src = "http://dl.dropboxusercontent.com/u/848981/it/z/js/zreader.js";
    console.log("waiting for zreader.js ...");
}
