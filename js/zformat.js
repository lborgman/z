// fix-me: https://api.zotero.org/groups/56508/items/DA3XSXUD?format=atom&content=json
// This is an attachment. Main object:
// <link rel="up" type="application/atom+xml" href="https://api.zotero.org/groups/56508/items/GSKDRZHS?content=json"/>

(function() {

    //// Call parameters
    // https://developer.mozilla.org/en-US/docs/Web/API/Window.location, ex #6
    var params = new (function (sSearch) {
        if (sSearch.length > 1) {
            for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&");
                 nKeyId < aCouples.length; nKeyId++)
            {
                aItKey = aCouples[nKeyId].split("=");
                this[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : "";
            }
        }
    })(window.location.search);
    // params.f = "http://OurComments.org/psych/z"+params.zgi+".html";
    params["f"] = "http://OurComments.org/psych/zfsp.html"; // fix-me
    // console.log("params", params);

    var theUrl;

    var mkElt = ZReader.mkElt;

    function mkSearchMarked(ths) {
        var searchStr = "";
        var selObj = window.getSelection();
        var selText = selObj.toString();
        if (selText.length > 0) searchStr = '"'+selText+'"';
        var tagCont = document.getElementById("tag-container");
        if (tagCont) {
            var selected = tagCont.querySelectorAll(".checked-tag");
            for (var i=0; i<selected.length; i++) {
                // console.log(selected[i].firstChild);
                if (searchStr.length > 0) searchStr += " ";
                searchStr += '"'+selected[i].firstChild.nodeValue+'"';
            }
        }
        // console.log(searchStr);
        ths.setAttribute("href",
                         params["f"]
                         +"?q="
                         +encodeURIComponent(searchStr));
    }
    // var groupIds = {
    //     "from_some_psychologists":56508,
    //     "minding_my_mitochondria_terry_wahls":136570
    // };
    // function getGrpTextIdFromId(id) {
    //     for (var key in groupIds)
    //         if (id == groupIds[key]) return key;
    // }

    function mkDt(title) {
        return mkElt("span", { "class":"dt" }, title);
    }
    function mkDd(desc) {
        return mkElt("span", { "class":"dd" }, desc);
    }
    function mkRow(dt, dd) {
        return mkElt("div", { "class":"drow" }, [mkDt(dt),mkDd(dd)]);
    }
    var relations = null;
    function parseAndOutputMain(jsons, nodeOutput) {
        var json = jsons[0];
        // console.log("json", json);

        var frag = document.createDocumentFragment();
        var url = json["url"];
        // console.log("json", json);
        // for (var key in json) { console.log(key, json[key]); }
        // console.log("json url", url);
        if (!url) {
            var doi = json["DOI"];
            if (doi) url = "http://dx.doi.org/"+doi;
        }
        if (!url) {
            url = "javascript:alert('Sorry, I do not know the link. It might be in the attachments below!'); void(0)";
        } else {
            theUrl = url;
        }
        var title = json["title"];
        // var twitterTitle = title;
        frag.appendChild(mkRow("Title",
                               mkElt("h1", {"class":"h1-title", "id":"ref-title"},
                                     mkElt("a",
                                           { "href":url,
                                             // "id":"ref-title",
                                             "xtarget":"_blank",
                                             "title":"Visit source",
                                             "itemprop":"name"
                                           },
                                           title))));
        document.head.appendChild(mkElt("title", null, "Z: "+title));

        var authorsFrag = document.createDocumentFragment();
        var creators = json["creators"];
        var twitterFullTitle = "";
        if (creators) {
            for (var i=0; i<creators.length; i++) {
                var fN = creators[i]["firstName"];
                var lN = creators[i]["lastName"];
                if (lN || fN) {
                    lN = lN.trim();
                    fN = fN.trim();
                    if (lN.length > 0 || fN.length > 0) {
                        // if (authors.length>0) authors += ", ";
                        if (authorsFrag.length > 0) authorsFrag.appendChild(document.createTextNode(", "));
                        // authors += fN+" "+lN;
                        authorsFrag.appendChild(mkElt("span", {"itemprop":"author"},  fN+" "+lN));
                    }
                }
                if (0===i) twitterFullTitle = fN+" "+lN; // authors;
            }
            // authors = authors.trim();
            if (authorsFrag.childElementCount > 0) frag.appendChild(mkRow("Authors", authorsFrag));
        }

        var abstractNote = json["abstractNote"];
        if (abstractNote) {
            abstractNote = abstractNote.trim();
            if (abstractNote.length > 0) {
                document.querySelector("head meta[name='twitter:description']")
                    .setAttribute("content", abstractNote.substr(0,200));
                // Preserve new lines
                var noteLines = abstractNote.split("\n");
                // console.log("abs length", abstractNote.length);
                var classes = "sixteen columns";
                if (abstractNote.length > 500) // 3-4 rows
                    classes += " newspaper-cols";
                var fragAbstract = mkElt("div", {"class":classes});
                for (var i=0; i<noteLines.length; i++) {
                    if (fragAbstract.childNodes.length > 0) fragAbstract.appendChild(mkElt("div", {"class":"br"}));
                    // fragAbstract.appendChild(document.createTextNode(noteLines[i]));
                    var n = mkElt("span", null);
                    n.innerHTML = noteLines[i];
                    fragAbstract.appendChild(n);
                }
                frag.appendChild(mkRow("Abstract", fragAbstract));
            }
        }
        var date = json["date"];
        if (date) {
            date = date.trim();
            var m = new RegExp("[0-9]{4}").exec(date);
            if (m[0]) {
                if (twitterFullTitle.length > 0) twitterFullTitle += " ";
                twitterFullTitle += "("+m[0]+")";
            }
        }
        if (twitterFullTitle.length > 0) twitterFullTitle += ". ";
        twitterFullTitle += title;
        document.querySelector("head meta[name='twitter:title']")
            .setAttribute("content", twitterFullTitle);

        if (!date || 0==date.length) date = json["accessDate"]+" (accessed)";
        // console.log("date",date);
        if (date) date = ", "+date;

        var itemType = getItemType(json["itemType"]);

        var genPublisher = json["publicationTitle"] || json["websiteTitle"] || json["publisher"];
        if (!genPublisher) {
            var url = json["url"];
            if (url) {
                var m = new RegExp("https?://[^/]*").exec(url);
                // genPublisher = mkElt("a", {"href":m[0], "xtarget":"_blank"}, m[0]);
                genPublisher = mkElt("a", {"href":url, "xtarget":"_blank"}, m[0]);
            }
            if (!genPublisher) genPublisher = "Unknown source";
        }
        frag.appendChild(mkRow(itemType, [genPublisher,date]));

        var tags = json["tags"];
        if (tags.length>0) {
            var tagFrag = mkElt("div", {"id":"tag-container"}); //document.createDocumentFragment();
            var eltTag = [];
            var chkBox = [];
            for (var i=0; i<tags.length; i++) {
                var tag = tags[i];
                // console.log("tag", tag);
                chkBox[i] = mkElt("input",{ "type":"checkbox", "style":"display:none"});
                chkBox[i].addEventListener("click", function(ev){
                    ev.stopPropagation();
                    if (!this.checked) {
                        this.style.display = "none";
                        this.parentNode.classList.remove("checked-tag");
                    } else {
                        this.parentNode.classList.add("checked-tag");
                        this.style.display = "inline-block";
                    }
                    var selected = document.getElementById("tag-container").querySelectorAll(".checked-tag");
                    // console.log("checked tags", selected);
                    var searchElt = document.getElementById("search-tags-div");
                    var searchGlass = document.getElementById("glass-cont");
                    if (selected.length > 0) {
                        // searchElt.style.display = "block";
                        searchGlass.style.opacity = 1;
                    } else {
                        // searchElt.style.display = "none";
                        searchGlass.style.opacity = null;
                    }    
                });
                eltTag[i] = mkElt("label", {"class":"tag"}, [tag.tag, chkBox[i]]);
                tagFrag.appendChild(eltTag[i]);
            }
            var searchTags = mkElt("a", {"id":"search-tags", "xtarget":"_blank"}, "Search for tags");
            searchTags.addEventListener("click", function(){
                var selected = document.getElementById("tag-container").querySelectorAll(".checked-tag");
                var searchStr = "";
                for (var i=0; i<selected.length; i++) {
                    // console.log(selected[i].firstChild);
                    if (searchStr.length > 0) searchStr += " ";
                    searchStr += '"'+selected[i].firstChild.nodeValue+'"';
                }
                // console.log(searchStr);
                this.setAttribute("href",
                                  // Fix-me: How to choose search form??? Fix this in rewrite.
                                  // "http://ourcomments.org/psych/zfsp.html?q="
                                  params["f"]
                                  +"?q="
                                  +encodeURIComponent(searchStr));
            });
            var searchDiv = mkElt("div", {"id":"search-tags-div","style":"display:none"}, searchTags);
            frag.appendChild(mkRow("Tags", [tagFrag,searchDiv]));
        }
        var btnCite = mkElt("span", {"id":"cite-div", "title":"Show citation"}, "\u25BA"); // big arrow??
        btnCite.addEventListener("click", function(){
            requestCitation();
        });
        // frag.appendChild(mkRow("How to Cite", btnCite));
        var newBtnCite = mkElt("a", {"id":"copy-ref", "href":"#"}, "Copy reference etc");
        newBtnCite.addEventListener("click", function(ev) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
            doCopyRef(grpId, itemKey);
        });
        frag.appendChild(mkRow("Cite", newBtnCite));

        while(nodeOutput.firstChild) nodeOutput.removeChild(nodeOutput.firstChild);
        nodeOutput.appendChild(frag);

        // Collect related, but put them under links.
        relations = json["relations"];
        // console.log(json);
        // console.log("relations 1", relations);
        // for (var r in relations) console.log("relations r=", r, relations[r]);
        // for (var k in json) console.log("json k=", k);
        requestChildren();
    }
    function getItemType(jsonItemType) {
        return myItemTypes[jsonItemType] || jsonItemType;
    }
    var myItemTypes = {
        "book":"Book",
        "journalArticle":"Journal Article",
        "newspaperArticle":"News Article",
        "webpage":"Web Page"
    }
    function parseAndOutputChildren(jsons, nodeOutput) {
        var myHref = window.location.href;
        var m = new RegExp("[^?]*").exec(myHref);
        var myFormatter = m[0];

        var imgLoader = function() {
            var emptyImg = document.getElementById("output-attachments").querySelectorAll("img");
            // console.log("emptyImg", emptyImg.length, emptyImg);
            var siteRe = new RegExp("https?://[^/]+/");
            for (var i=0, len=emptyImg.length; i<len; i++) {
                var img = emptyImg[i];
                // console.log(emptyImg[i], emptyImg[i].parentNode);
                var href = img.parentNode.getAttribute("href");
                // console.log(href);
                var m = siteRe.exec(href);
                // console.log(m[0]);
                var favIcon = m[0]+"favicon.ico"; // Just guess.... ;P
                var text = img.parentNode.textContent;
                if (new RegExp(/^Full ?text$/).test(text)) {
                    favIcon = "https://dl.dropboxusercontent.com/u/848981/it/z/img/fulltext.svg";
                } else if (new RegExp("nih\.gov/").test(favIcon)) {
                    favIcon = 'http://www.ncbi.nlm.nih.gov/favicon.ico';
                } else if (new RegExp("dropboxusercontent").test(favIcon)) {
                    favIcon = 'http://www.zotero.org/favicon.ico';
                } else if (href.substr(0, myFormatter.length) === myFormatter) {
                    // favIcon = 'http://www.zotero.org/favicon.ico';
                    favIcon = "http://dl.dropboxusercontent.com/u/848981/it/z/favicon.ico";
                }
                emptyImg[i].setAttribute("src", favIcon);
            }
        }
        if ("complete" == document.readyState) {
            setTimeout(imgLoader, 1);
        } else {
            window.onload = imgLoader;
        }
        function mkFavPH(fav) {
            // fix-me
            return mkElt("img",
                         {"width":"16", "height":"16"});
        }

        var divParent = mkElt("div", { "class":"inner-container" });
        var divLinks = mkElt("div", { "class":"inner-container" });
        var divNotes = mkElt("div", { "class":"inner-container" });
        var divRelated = mkElt("div", { "class":"inner-container" });

        function setTheUrl(url) {
            theUrl = url;
            var aRefTitle = document.querySelector("#ref-title a");
            aRefTitle.setAttribute("href", url);
        }
        for (var i=0; i<jsons.length; i++) {
            var json = jsons[i];
            // console.log(json);
            for (var k in json) {
                // console.log(k, json[k]);
            }
            var itemType = json["itemType"];
            switch(itemType) {
            case "attachment":
                // console.log("attachment", json);
                var linkMode = json["linkMode"];
                switch(linkMode) {
                case "linked_url":
                    var url = json["url"];
                    var title = json["title"];
                    // console.log(title, url);
                    var colorClass = "color-other";
                    if (new RegExp("facebook.com", "i").test(url)) { colorClass = "color-facebook"; }
                    else if (new RegExp("full", "i").test(title)) { colorClass = "color-full"; }
                    else if (new RegExp("annot", "i").test(title)) { colorClass = "color-annotation"; }
                    else if (new RegExp("diigo", "i").test(title)) { colorClass = "color-annotation"; }
                    // else if (new RegExp("pubmed", "i").test(title)) { colorClass = "color-pubmed"; }
                    else if (new RegExp("nih\.gov", "i").test(url)) {
                        colorClass = "color-pubmed";
                        if (!theUrl) setTheUrl(url);
                    }
                    else if (new RegExp("books\.google\.", "i").test(url)) {
                        colorClass = "color-book";
                        if (!theUrl) setTheUrl(url);
                        // var aRefTitle = document.querySelector("#ref-title a");
                        // aRefTitle.setAttribute("href", url);
                    }
                    
                    divLinks.appendChild(
                        mkElt("a", {"class":"attachment linked-url "+colorClass,
                                    "href":url,
                                    "xtarget":"_blank"
                                   },
                              [mkFavPH(),
                               // Wrap title in span for vertical align-ment with icon:
                               mkElt("span", null, title)]));
                    break;
                case "imported_url":
                    var url = json["url"];
                    var title = json["title"];
                    // console.log(title, url);
                    // Not useful AFAICS
                    divLinks.appendChild(
                        mkElt("div", { "class":"attachment linked-url" }, 
                              [mkElt("i", null, title), 
                               ", imported web page, can be accessed from desktop Zotero."]));
                    break;
                case "imported_file":
                    var url = json["url"];
                    var title = json["title"];
                    // console.log(title, url);
                    divLinks.appendChild(
                        mkElt("div", { "class":"imported-file attachment" },
                              [mkElt("i", null, title), 
                               ", attached file, can be accessed from desktop Zotero."]));
                    break;
                default:
                    console.log("unhandled linkMode:", json);
                }
                break;
            case "note":
                var note = json["note"];
                var noteDiv = mkElt("div", { "class":"note attachment" }, null);
                noteDiv.innerHTML = note;
                divNotes.appendChild(noteDiv);
                // console.log(note);
                break;
            default:
                console.log("unhandled child:", json);
            }
        }

        // console.log("relations 2", relations);
        // for (var k in relations) console.log(k, relations[k]);
        if (typeof php_parent_zid !== "undefined") {
            var parentOrigHref = "http://zotero.org/groups/"+php_parent_zgrp+"/items/"+php_parent_zid;
            var key = php_parent_zid;
            var grpId = php_parent_zgrp;
            var formatHref = myFormatter
                +"?zgi="+grpId
                +"&zk="+key
            // +"&f="+params.f
            ;
            var zURL = myURLBuilder.itemXML(key);
            var title = key;
            // wrap it to give the callback a variable:
            (function() {
                var spanTitle = mkElt("span", null, title);
                var relLink = mkElt("a",{"href":formatHref,
                                         "class":"related-item attachment color-related"},
                                    [mkFavPH(), spanTitle]
                                   );
                divParent.appendChild(relLink);
                var outputFun = function(zXml, dummyElt) {
                    // console.log(zXml, dummyElt);
                    var dp = new DOMParser();
                    var zDom = dp.parseFromString(zXml, "text/html");
                    var eltTitle = zDom.querySelector("title");
                    var title = eltTitle.firstChild.nodeValue;
                    spanTitle.replaceChild(document.createTextNode(title),
                                           spanTitle.firstChild);
                };
                // console.log("zURL=", zURL);
                ZReader.zReaderRequest(zURL, null, null, outputFun);
            })();
        }
        if (relations && Object.keys(relations).length > 0) {
            // fix-me: move formatter finding code.
            var relLink = [];
            // http://zotero.org/groups/56508/items/QEZ9XJQB
            var origHrefRe = new RegExp("^https?://zotero.org/groups/([0-9]+)/items/(.*)$");
            // console.log("-------------------relations", relations);
            var relatedContainer = mkElt("div", { "class":"related-container" });


            // console.log("relations", relations);
            for (var prop in relations) {
                // Looks strange, but prop seems to be "dc:relations"
                // and we get the link directly? This link has group
                // id numeric. Didn't I see yesterday that did not
                // work???
                // var relatedOrigHrefs = relations[prop];
                var relatedOrigHrefs = relations["dc:relation"];
                // console.log("relatedOrigHrefs", relatedOrigHrefs);
                // relatedOrigHrefs = relatedOrigHrefs || [];
                // console.log("   +prop:"+prop+", href="+relatedOrigHrefs);
                // for (var h in relatedOrigHrefs) { console.log("h="+h, relatedOrigHrefs[h]); }
                // It is an array (is it always an array?). No, it is just a string sometimes!
                // var hrefs = relatedOrigHrefs.split(",");
                if (typeof relatedOrigHrefs == "string") { relatedOrigHrefs = [relatedOrigHrefs]; }
                for (var i=0, len=relatedOrigHrefs.length; i<len; i++) {
                    // var m = origHrefRe.exec(relatedOrigHref);
                    var m = origHrefRe.exec(relatedOrigHrefs[i]);
                    var grpId = m[1];
                    var key = m[2];
                    var formatHref = myFormatter
                        +"?zgi="+grpId
                        +"&zk="+key
                        // +"&f="+params.f
                    ;
                    var zURL = myURLBuilder.itemXML(key);
                    var title = key;
                    // wrap it to give the callback a variable:
                    (function() {
                        var spanTitle = mkElt("span", null, title);
                        var relLink = mkElt("a",{"href":formatHref,
                                                 "class":"related-item attachment color-related"},
                                            [mkFavPH(), spanTitle]
                                           );
                        divRelated.appendChild(relLink);
                        var outputFun = function(zXml, dummyElt) {
                            // console.log(zXml, dummyElt);
                            var dp = new DOMParser();
                            var zDom = dp.parseFromString(zXml, "text/html");
                            var eltTitle = zDom.querySelector("title");
                            var title = eltTitle.firstChild.nodeValue;
                            spanTitle.replaceChild(document.createTextNode(title),
                                                    spanTitle.firstChild);
                        };
                        // console.log("zURL=", zURL);
                        ZReader.zReaderRequest(zURL, null, null, outputFun);
                    })();

                }
            }
            // console.log("<<<<<<<<<<< end relations");
        }
        if (divParent.children.length
            +divLinks.children.length
            +divNotes.children.length
            +divRelated.children.length
            > 0)
        {
            var outerContainer;
            if (divParent.children.length > 0) {
                outerContainer = mkElt("div", {"class":"outer-container", "id":"links-container"});
                outerContainer.appendChild(mkElt("div", {"class":"etc-label-div"},
                                                 mkElt("span", {"class":"etc-label"}, "Owner parent")));
                outerContainer.appendChild(divParent);
                nodeOutput.appendChild(outerContainer);
            }
            if (divLinks.children.length > 0) {
                outerContainer = mkElt("div", {"class":"outer-container", "id":"links-container"});
                outerContainer.appendChild(mkElt("div", {"class":"etc-label-div"},
                                                 mkElt("span", {"class":"etc-label"}, "Links")));
                outerContainer.appendChild(divLinks);
                nodeOutput.appendChild(outerContainer);
            }
            if (divNotes.children.length > 0) {
                outerContainer = mkElt("div", {"class":"outer-container", "id":"notes-container"});
                outerContainer.appendChild(mkElt("div", {"class":"etc-label-div"},
                                                 mkElt("span", {"class":"etc-label"}, "Notes")));
                outerContainer.appendChild(divNotes);
                nodeOutput.appendChild(outerContainer);
            }
            if (divRelated.children.length > 0) {
                outerContainer = mkElt("div", {"class":"outer-container", "id":"related-container"});
                var summaryElt = mkElt("summary", null, "note");
                var descElt = mkElt("span", {"style":"display:none"},
                                    "Due to a bug in Zotero relations are not"
                                    +" displayed both ways."
                                    +" So the relation you see here may not be"
                                    +" seen on related documents below."
                                    +" (Hm, it might be gone now. No, it is not!)")
                summaryElt.addEventListener("click", function() {
                    if (descElt.style.display == "none")
                        descElt.style.display = "inline-block";
                    else
                        descElt.style.display = "none";
                });
                outerContainer.appendChild(mkElt("div", {"class":"etc-label-div"},
                                                 [mkElt("span", {"class":"etc-label"}, "Related"),
                                                  // This currently works only in Chrome. Replace it?
                                                  mkElt("details", {"id":"zot-rel-problems"},
                                                        [summaryElt, descElt])
                                                 ]));
                outerContainer.appendChild(divRelated);
                nodeOutput.appendChild(outerContainer);
            }
        }
    }
    function parseAndOutputCitation(zXml, divCite2) {
        // console.log(zXml);
        var dp = new DOMParser();
        zDom = dp.parseFromString(zXml, "text/html");
        var divCite = zDom.querySelector("div.csl-entry");
        // console.log(divCite);
        function walkTheDOM(node, func) {
            func(node);
            var child = node.firstChild;
            while (child) {
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
                    frag.appendChild(mkElt("a",{"href":"http://dx.doi.org/"+m[2], "xtarget":"_blank"},m[2]));
                    if (m[3].length > 0)
                        frag.appendChild(document.createTextNode(m[3]));
                    // console.log(frag);
                    node.parentNode.replaceChild(frag, node);
                }
            }
        });
        divCite2.parentNode.replaceChild(divCite, divCite2);
    }

    function requestMain() {
        console.log("requestMain -----------------------------");
        var outputElt = document.getElementById("output");
        outputElt.replaceChild(mkElt("div",null,
                                      mkElt("span",null,"Waiting for main content from Zotero...")),
                                outputElt.firstChild);
        var zURL = myURLBuilder.item(itemKey);
        ZReader.zReaderRequest(zURL, outputElt, parseAndOutputMain, getLibFromXml);
    }
    function getLibFromXml(zXml) {
        console.log("getLibFromXml -----------------------------");
        // fix-me!
        // console.log(zXml);
        var libTitElt = document.getElementById("lib-title");
        if (libTitElt.childNodes.length > 0) return;
        var dp = new DOMParser();
        var zDom = dp.parseFromString(zXml, "text/html");
        // Did not work, since it gave me the numeric id there when called from here. ;-)
        // Maybe fscheslack and I a working on this at the same time?
        // 
        // var idElt = zDom.querySelector("id");
        // console.log(idElt);
        // var altElt = zDom.querySelector("link[rel=alternate]");
        var altElt = zDom.querySelector("entry link[rel=alternate]"); // check?
        // console.log("altElt", altElt);
        // fix-me: Sometimes we get a hit here, sometimes not. The xml
        // http://ourcomments.org/cgi-bin/zformat.php?zgi=56508&zk=NTFREEPH does not work.
        if (!altElt) {
            var zURL = myURLBuilder.idURL();
            ZReader.zReaderRequest(zURL, null, null, getLibFromXml);
        } else {
            // console.log(zXml);
            // format from Zotero is not well defined yet!
            var href = altElt.getAttribute("href");
            // console.log("href", href);
            // xtemp = href;
            // m = new RegExp("^https?://zotero.org/groups/([^/]*)").exec(href);
            m = new RegExp("^https?://.*?zotero\.org/groups/([^/]*)").exec(href);
            console.log("m", m);
            grpTextId = m[1];
            var zLibURL = "http://zotero.org/groups/"+grpTextId;
            console.log("grpTextId", grpTextId);
            // Was it the group number id?
            if (new RegExp(/^\d+$/).exec(grpTextId)) {
                var titleTag = zDom.querySelector("title");
                grpTextId = titleTag.textContent;
            }
            // Update group
            var libName = grpTextId.split("_").join(" ");
            console.log("libName", libName);
            var zotHref = zLibURL;
            // libTitElt.appendChild(mkElt("a",
            //                             {"href":zotHref,
            //                              "title":"Visit this Zotero library"},
            //                             libName));
            libTitElt.appendChild(document.createTextNode(libName));
            var zotLink = document.getElementById("zotlink");
            zotHref += "/items/itemKey/"+itemKey;
            zotLink.setAttribute("href", zotHref);
            zotLink.style.opacity = 1.0;
            // var copyRef = document.getElementById("copy-ref-old");
            // copyRef.addEventListener("click", function() { doCopyRef(grpId, itemKey); });
            var zotInfoTag = document.getElementById("libinfolink");
            // function capitalizeEachWord(str) {
            //     return str.replace(/\w\S*/g, function(txt) {
            //         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            //     });
            // }
            // libName = capitalizeEachWord(libName);
            zotInfoTag.addEventListener("click", function(ev){
                ev.preventDefault();
                ev.stopPropagation();
                console.log("clicked");
                var libinfoDiv = document.querySelector("#libinfo");
                if (libinfoDiv.style.display === "block") {
                    libinfoDiv.style.display = "none";
                } else if (libinfoDiv.style.display === "none") {
                        libinfoDiv.style.display = "block";
                } else {
                    ZReader.showLibInfo(zLibURL, libName, libinfoDiv);
                }
            });
        }
    }
    function doCopyRef(grpId, itemKey) {
        var showForm = function() { ZReaderRefCopier.showForm(grpId, itemKey); };
        if (typeof ZReaderRefCopier === "undefined") {
            var baseHref;
            if (new RegExp(/\.php\?/).exec(location.href)) {
                //// .php case

                // fix-me: Probably can't use baseElt because of ref
                // copy, but save it just in case.
                var baseElt = document.querySelector("base");
                if (baseElt) {
                    baseHref = baseElt.href;
                } else {
                    // fix-me: give it an id attribute?
                    (function() {
                        // var firstSrcipt = document.querySelector("script[src]");
                        var firstSrcipt = document.querySelector("#zformat-js");
                        // var pathPattern = new RegExp(/(.*?)[^\/]*$/);
                        var pathPattern = new RegExp(/(.*?\/)js\/[^\/]*$/);
                        var matches = pathPattern.exec(firstSrcipt.src);
                        baseHref = matches[1];
                    })();
                }
            } else {
                baseHref = location.protocol+"//"+location.host+location.pathname;
                baseHref = baseHref.replace(new RegExp("/zformat\.html.*$"), "/");
            }


            var jsId = "ourcomments-edit-js";
            var editJsElt = mkElt("script", {"id":jsId});
            document.head.appendChild(editJsElt);
            editJsElt.onload = function() { showForm(); };
            var urlJs = baseHref+"js/edit.js";
            editJsElt.src = urlJs;
        } else {
            showForm();
        }
        return null;
    }
    
    function requestChildren() {
        console.log("requestChildren ----------------------------");
        var nodeOutput = document.getElementById("output-attachments");
        if (typeof php_parent_zid === "undefined") {
            var zURL = myURLBuilder.children(itemKey);
            ZReader.zReaderRequest(zURL, nodeOutput, parseAndOutputChildren, getLibFromXml);
        } else {
            parseAndOutputChildren([], nodeOutput);
        }
    }
    function requestCitation() {
        var zURL = myURLBuilder.citation(itemKey);
        // console.log("zURL", zURL);
        var divCite2 = document.getElementById("cite-div");
        divCite2.appendChild(document.createTextNode("Waiting for citation from Zotero ..."));
        ZReader.zReaderRequest(zURL, divCite2, null, parseAndOutputCitation);
    }
    var myURLBuilder;
    var grpId     = params["zgi"];
    var itemKey   = params["zk"];
    var grpTextId = params["zit"];
    var z = params["z"];
    (function(){
        function initOnLoad() {
            var nodeOutput = document.getElementById("output");
            if (z) {
                var match = new RegExp("https?://www\.zotero\.org/groups/(.*?)/items/itemKey/([^/]*)").exec(z);
                grpTextId = grpTextId || match[1];
                itemKey = itemKey || match[2];
                // console.log(grpTextId, itemKey, grpId);
            }
            // grpId = grpId || groupIds[grpTextId];
            // console.log(grpId, groupIds);
            myURLBuilder = new ZURLBuilder(true, grpId);
            // grpTextId = grpTextId || getGrpTextIdFromId(grpId);
            // var libName = grpTextId.split("_").join(" ");
            // document.getElementById("lib-title")
            //     .appendChild(document.createTextNode(libName));
            document.getElementById("output").style.display = "block";
            document.getElementById("glass2").addEventListener("mousedown", function(){
                mkSearchMarked(this);
            });
            document.getElementById("glass2").addEventListener("touchstart", function(ev){
                ev.target.mousedown();
            });
            document.body.addEventListener("mouseup", function(){
                var glass = document.getElementById("glass-cont");
                if (window.getSelection().toString().length > 0)
                    glass.style.opacity = 1;
                else
                    glass.style.opacity = null;
            });
            
            
            if (typeof php_json !== "undefined") {
                // console.log("php_json", php_json);
                var outputElt = document.getElementById("output");
                parseAndOutputMain([php_json], outputElt);
            } else {
                requestMain();
            }
        }
        switch (document.readyState) {
        case "loading":
            document.addEventListener("DOMContentLoaded", function() {
                initOnLoad();
            });
            break;
        case "interactive":
        case "complete":
            initOnLoad();
        break;
    default:
        debugger;
    }
    })();
})();
