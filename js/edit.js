function ZreaderWP() {
}

ZreaderWP.insertIt = function(html) {
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

ZreaderWP.prototype.getParams = function(html) {
}

ZreaderWP.showForm = function(zGrpId, zItemKey) {
    console.log("showForm", zGrpId, zItemKey);
    var styleId = "zreaderwp-zreader-css";
    var eStyle = document.getElementById(styleId);
    if (!eStyle) {
        eStyle = document.createElement("link");
        document.head.appendChild(eStyle);
        eStyle.setAttribute("id", styleId);
        eStyle.setAttribute("rel", "stylesheet");
        eStyle.setAttribute("type", "text/css");
        eStyle.setAttribute("href", "http://dl.dropboxusercontent.com/u/848981/it/z/css/edit.css");
        // Fix-me: Too much trouble, is it worth fixing now? Load sync, is that possible?
        // Or, do I need an XMLHTTPRequest here?
        // eStyle.onload = function() { formDiv.style.display = null; };
    }
    var scriptId = "zreaderwp-zreader-js";
    var eScript = document.getElementById(scriptId);
    if (eScript) {
        eScript.onload();
        return;
    } 
    eScript = document.createElement("script");
    document.head.appendChild(eScript);
    eScript.setAttribute("id", scriptId);
    eScript.onload = function() {
        console.log("loaded zreader");
        zrwp = new ZreaderWP();
        var zr = new ZReader();
        var bgDiv = document.getElementById("zreaderwp-bg");
        if (bgDiv) {
            bgDiv.style.display = "block";
        } else {

            /////////////////////////////////////////////
            //// Build form and display it

            var mkElt = ZReader.mkElt;

            bgDiv = mkElt("div", {"id":"zreaderwp-bg"});
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

            var closeDiv = mkElt("div", {"id":"zreaderwp-close-div"}, 
                                 mkElt("a", {"title":"Close"}, String.fromCharCode(10006)));
            var headDiv = mkElt("div", {"id":"zreaderwp-header"},
                                ["From here you can copy and paste to a Wordpress blog,"
                                 +" a LibreOffice document etc. "
                                 // +" The base for formatting will be copied,"
                                 // +" but you may have to adjust it, of course, for your needs. ",
                                 , mkElt("a", {"href":"javascript:alert('more info is coming soon')"},
                                       "More info")]);
            var urlInp;
            var urlLabel;
            if (!zItemKey) {
                urlInp = mkElt("input", {"id":"zreaderwp-url", "type":"text"});
                urlLabel = mkElt("label", null, ["Enter URL of reference in Zotero", urlInp]);
            }
            var optInfoDiv = mkElt("div", null, "Choose output parts and then click 'Copy' below:");
            var optOutDiv = mkElt("div");
            var viewDiv = mkElt("div", {"id":"zreaderwp-view"});
            var optInDiv = mkElt("div", {"id":"zreaderwp-inner-controls"});
            var insertBtn = mkElt("button", {"title":"Insert in edited post/page"}, "Insert");
            var copyBtn = mkElt("button", {"title":"Copy to clipboard"}, "Copy");
            var optOuterDiv = mkElt("div", {"id":"zreaderwp-outer-controls"},
                                    [optInDiv, insertBtn, copyBtn]);
            var copyDiv = mkElt("div", {"id":"zreaderwp-copy"},
                                "Now press Control-C to copy to clipboard");
            var formDiv = mkElt("div", {"id":"zreaderwp-form"},
                                [closeDiv, headDiv, urlLabel, optInfoDiv, optOuterDiv, viewDiv,
                                 copyDiv]);
            // formDiv.style.display = "none";
            // bgDiv = mkElt("div", {"id":"zreaderwp-bg"}, formDiv);
            // document.body.appendChild(bgDiv);
            formDiv.style.maxHeight = (window.innerHeight - 200)+"px";
            bgDiv.appendChild(formDiv);
            bgs.cursor = null;

            if (urlInp) urlInp.focus();

            closeDiv.addEventListener("click", hideBgDiv);



            var grpId = zGrpId;
            var itemKey = "TI6C7MH6";
            var itemKey = "EZBTRX9P";
            var itemKey = zItemKey;
            var myURLBuilder;
            if (grpId) myURLBuilder = new ZURLBuilder(true, grpId);

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

            var absChk = mkElt("input", {"id":"zreaderwp-abs-chk", "type":"checkbox"});
            var absIn = mkElt("label", {"title":""}, [absChk, "Abstract"]);
            optInDiv.appendChild(absIn);
            var absOutDiv = mkElt("div", {"id":"zreaderwp-abs-out"});
            absChk.addEventListener("click", function() { updateOutput("abstract", this.checked); });

            var citChk = mkElt("input", {"id":"zreaderwp-cit-chk", "type":"checkbox", "checked":"checked"});
            // outputList.push("citation");
            var citIn = mkElt("label", {"title":""}, [citChk, "Citation"]);
            optInDiv.appendChild(citIn);
            var citOutDiv = mkElt("div", {"id":"zreaderwp-cit-out"});
            citChk.addEventListener("click", function() { updateOutput("citation", this.checked); });
            updateOutput("citation", true);

            absChk.focus();


            var urlChange = (function() {
                var lastURL = null;
                return function() {
                    var newURL = urlInp.value;
                    console.log(newURL, lastURL);
                    if (newURL == lastURL) return;
                    lastURL = newURL;
                    clearOutput();

                    var match = new RegExp("\.zotero\.org/groups/(.*?)/items/itemKey/([^/]*)").exec(newURL);
                    match = true;
                    if (match) {
                        var grpTextId;
                        grpTextId = grpTextId || match[1];
                        itemKey = itemKey || match[2];
                        console.log(grpTextId, itemKey, grpId);
                        if (!grpId) grpId = "56508";
                        myURLBuilder = new ZURLBuilder(true, grpId);
                        updateOutput();
                    }
                }
            })();





            ///////////////////////////////////////////////////
            //// Output updating

            function clearOutput() {
                delete citOutDiv.dataset.zReaderStatus;
                while(citOutDiv.firstChild) citOutDiv.removeChild(citOutDiv.firstChild);
                delete absOutDiv.dataset.zReaderStatus;
                while(absOutDiv.firstChild) absOutDiv.removeChild(absOutDiv.firstChild);
            }
            function updateOutput(what, checked) {
                // console.log("updateOutput", what, checked);
                if (what) {
                    if (checked) {
                        outputList.push(what);
                        if (outputList.length > 2) outputList.length = 2;
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
                    while (viewDiv.firstChild) viewDiv.removeChild(viewDiv.firstChild);
                    for (var i=0; i<outputList.length; i++) {
                        switch (outputList[i]) {
                        case "citation":
                            viewDiv.appendChild(citOutDiv);
                            requestCitation();
                            break;
                        case "abstract":
                            viewDiv.appendChild(absOutDiv);
                            requestAbstract();
                            break;
                        default:
                            console.log("bad value in outputList", outputList);
                        }
                    }
                }
            }

            if (urlInp) {
                urlInp.addEventListener("change", urlChange);
                urlInp.addEventListener("keyup", urlChange);
            }

            insertBtn.addEventListener("click", function(){
                var outNode = viewDiv.cloneNode(true);
                var html = outNode.innerHTML;
                ZreaderWP.insertIt(html);
                bgDiv.style.display = "none";
            });

            copyBtn.addEventListener("click", function(){
                console.log("copyBtn click");
                var range = document.createRange();
                range.selectNode(viewDiv);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                var r = viewDiv.getBoundingClientRect();
                var s = copyDiv.style;
                s.position = "fixed";
                s.left = (r.left-20)+"px";
                s.top = (r.top-10)+"px";
                s.display = "inline-block";
            });

            bgDiv.addEventListener("click", function(ev) { ev.stopPropagation(); });

            function hideBgDivOnESC(ev){
                // console.log("hideBgDivOnESC");
                ev.stopPropagation();
                copyDiv.style.display = "none";
                // console.log("ev.keyCode", ev.keyCode);
                if (27 == ev.keyCode) {
                    console.log("was 27");
                    hideBgDiv();
                }
            }
            function hideBgDiv() {
                bgDiv.style.display = "none";
                document.removeEventListener("keydown", hideBgDivOnESC);
            }
            bgDiv.addEventListener("keydown", hideBgDivOnESC);
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
                console.log("bg got focusout, to", to, "from", from);
                var inBg = false;
                n = 0;
                while (!inBg && to && n++ < 30) {
                    to = to.parentNode;
                    // console.log("to", to);
                    inBg = to === bgDiv;
                }
                if (!inBg) {
                    if (from) {
                        console.log("trying to keep focus");
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
            var zURL = myURLBuilder.item(itemKey);
            // ZReader.zReaderRequest(zURL, absOutDiv, parseAndOutputAbstract);
            if (!abstractReader)
                abstractReader = new ZReader(zURL, absOutDiv, parseAndOutputAbstract);
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

        ////// Citation
        var citationReader;
        function requestCitation() {
            // console.log("requestCitation", itemKey);
            while (citOutDiv.firstChild) citOutDiv.removeChild(citOutDiv.firstChild);
            var zURL = myURLBuilder.citation(itemKey);
            // ZReader.zReaderRequest(zURL, citOutDiv, null, parseAndOutputCitation);
            if (!citationReader) {
                // citOutDiv.appendChild(document.createTextNode("Waiting for citation from Zotero ..."));
                citationReader = new ZReader(zURL, citOutDiv, null, parseAndOutputCitation);
            }
            citationReader.request();
        }
        function parseAndOutputCitation(zXml, outputNode) {
            // console.log(zXml);
            var dp = new DOMParser();
            zDom = dp.parseFromString(zXml, "text/html");
            // console.log("zXml", zXml);
            var divCite = zDom.querySelector("div.csl-entry");
            // console.log("divCite", divCite);
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
            outputNode.appendChild(divCite);
        }

    } // end eScript onload

    eScript.src = "http://dl.dropboxusercontent.com/u/848981/it/z/js/zreader.js";
    console.log(eScript.src);
    console.log("waiting for zreader.js ...");

}
