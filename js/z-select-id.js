// var zoteroGrpIds;


/////////////////////////////////////////////////
// Zotero group id table
var zIdTable = {};
var idPsych = "56508";
zIdTable[idPsych] = ["from_some_psychologists", "Psychology"];
var idMito = "136570";
zIdTable[idMito] = ["minding_my_mitochondria_terry_wahls", "Minding My Mitochondria"];
var idWahls = "268753";
zIdTable[idWahls] = ["the_wahls_protocol", "The Wahls Protocol"];

var zoteroGroupPath2id = (function(){
    var ret = {};
    for (var key in zIdTable) {
        var item = zIdTable[key];
        var path = item[0];
        ret[path] = key;
    }
    return ret;
})();

function zoteroId2GroupPath(id) {
    for (var key in zoteroGroupPath2id)
        if (id == zoteroGroupPath2id[key]) return key;
}


//////////////////////////////////////////////////////////////////
// Menus = cx + group ids (and labels etc)
var menus = {};
var menusOrder = [];
function addMenuDef(urlParam, cx, zGrps, menuLabel, title, descFun) {
    menusOrder.push(urlParam);
    var menu = {"urlParam":urlParam,
                "cx":cx,
                "zGrps":zGrps,
                "menuLabel":menuLabel,
                "title":title,
                "desc":descFun,
                "menuElt":null // Reminder!
               };
    menus[urlParam] = menu;
}
addMenuDef("psych",
           '008189935189648121880:c-91zelm5n8',
           [idPsych],
           "Psychology",
           "Search our Zotero library for psychology",
           (function() {
               var desc = mkElt("p", null,
                                ["Search Zotero library ",
                                 mkGrpLibInfoTag(idPsych),
                                 "."]);
               return desc;
           }),
           null
          );
addMenuDef("food",
           '008189935189648121880:u_oojlxeeau',
           [idMito, idWahls],
           "Food & Health",
           "Search our Zotero libraries for food and health",
           (function() {
               var desc = mkElt("p", null,
                                ["Search Zotero libraries ",
                                 mkGrpLibInfoTag(idMito),
                                 " and ",
                                 mkGrpLibInfoTag(idWahls),
                                 "."
                                ]);
               return desc;
           }),
           null
          );
addMenuDef("all",
           '008189935189648121880:ma7nn38e5nq',
           [idPsych, idMito, idWahls],
           "All our Zotero libraries",
           "Search all our Zotero libraries,\ni.e. both psychology and food & health",
           (function() {
               var desc = mkElt("p", null,
                                ["Search all our Zotero libraries, i.e. ",
                                 mkGrpLibInfoTag(idPsych),
                                 ", ",
                                 mkGrpLibInfoTag(idMito),
                                 " and ",
                                 mkGrpLibInfoTag(idWahls),
                                 "."
                                ]);
               return desc;
           }),
           null
          );
// console.log("menus", menus); exit;



///////////////////////////////////////////////
// Google CSE
var myCseCallback = function() {
    console.log("my call back");
    var zlatest = document.getElementById("zlatest");
    var g2 = document.querySelectorAll(".gsc-control-cse");
    // console.log("g2", g2);
    if (g2.length > 0) {
        var s2 = window.getComputedStyle(g2[0]);
        zlatest.style.backgroundColor = s2.backgroundColor;
    }
    var sb = document.querySelector("input.gsc-search-button");
    if (sb) {
        var sbs = window.getComputedStyle(sb);
        zlatest.style.color = sbs.backgroundColor;
    }

    if (typeof rewriteCseStart != "undefined")
        rewriteCseStart();
    else
        console.log("no rewriteCseStart yet");
    var focusAndBind = function() {
        var firstForm = document.forms[0][0];
        firstForm.focus();
        // document.addEventListener('keydown',function(e){
        //     switch( e.keyCode )
        //     {
        //     case 8: break; // BS
        //     case 9: break; // Tab
        //     case 13: break; // CR
        //     case 16: break; // Shift
        //     case 16: break; // Ctrl
        //     case 27: closeabout(); // Esc
        //     default:
        //         // firstForm.focus();
        //         // $(document).unbind('keydown'); // Just one form here!
        //     }
        // });
    }
    if (document.readyState == 'complete') {
        // Document is ready when CSE element is initialized.
        focusAndBind();
        // console.log("CSE onload 1 here");
    } else {
        // Document is not ready yet, when CSE element is initialized.
        google.setOnLoadCallback(
            function() {
                focusAndBind();
                // console.log("CSE onload here");
            },
            true);
    }
};

// Insert it before the CSE code snippet so that cse.js can take the script
// parameters, like parsetags, callbacks.
window["__gcse"] = {
    "callback": myCseCallback
};

function loadGcse(cx) {
    // var gcse = document.getElementById(cx);
    // The page is reloaded all the time so the element is never found. Wonder what happens if it was??
    // if (gcse) return;
    var gcse = document.createElement('script');
    gcse.id = cx;
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
        '//www.google.com/cse/cse.js?cx=' + cx;
    // var s = document.getElementsByTagName('script')[0];
    // s.parentNode.insertBefore(gcse, s);
    document.head.appendChild(gcse);
}
// function selectAll() {
//     // CSE: Zotero - Psychology, Food & Health
//     zoteroGrpIds = [idPsych, idMito, idWahls];
//     var cx = '008189935189648121880:ma7nn38e5nq';
//     loadGcse(cx);
// }
// function selectPsychCSE() {
//     // CSE: Zotero - From Some Psychologists
//     zoteroGrpIds = [idPsych];
//     var cx = '008189935189648121880:c-91zelm5n8';
//     loadGcse(cx);
// }
// function selectFoodCSE() {
//     // CSE: Zotero - Food & Health, Terry Wahls
//     zoteroGrpIds = [idMito, idWahls];
//     var cx = '008189935189648121880:u_oojlxeeau';
//     loadGcse(cx);
// }


var mkElt = ZReader.mkElt;

function mkLibInfoTag(zLibURL, zLibName, libName) {
    var elt = mkElt("a",
                    {
                        "href":zLibURL,
                        "title":"Show Zotero library info",
                        "class":"no-underline",
                        "tabindex":"0"},
                    libName);
    elt.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        // console.log("clicked");
        // ZReader.showLibInfo(zLibURL, libName, document.querySelector("#libinfo") );
        var libinfoDiv = document.querySelector("#libinfo");
        if (libinfoDiv.style.display === "block"
            && libinfoDiv.dataset.libName === zLibName)
        {
            libinfoDiv.style.display = "none";
        } else if (libinfoDiv.style.display === "none"
                   && libinfoDiv.dataset.libName === zLibName)
        {
            libinfoDiv.style.display = "block";
        } else {
            libinfoDiv.dataset.libName = zLibName;
            ZReader.showLibInfo(zLibURL, zLibName, libinfoDiv);
        }
    });
    return elt;
}
function mkGrpLibInfoTag(zGrpId) {
    var rec = zIdTable[zGrpId]
    var zLibURL = "https://www.zotero.org/groups/"+rec[0];
    var zLibName = rec[0].split("_").join(" ");
    var libName = rec[1];
    return mkLibInfoTag(zLibURL, zLibName, libName);
}
function mkLatestToggle(zGrpId) {
    // fix-me: Chrome on android can't fetch 4, but can fetch
    // 3 items. The length of the rq.responseText is 20175
    // resp 23867 in my tests.
    var zGrpName = zIdTable[zGrpId][1];
    var divLatest = mkElt("div");
    var urlBuilder = new ZURLBuilder(true, zGrpId);
    var zURL = urlBuilder.latestItems(50);
    // console.log("theAfterDays", theAfterDays);
    ZReader.setupToggleForFetch(zURL, divLatest,
                                "Latest updates in "+zGrpName,
                                "Displays the latest updates (last "+theAfterDays+" days)\n"
                                +"which might not have been found by Google yet."
                                +"\n\n(Note: All entries from those days are displayed!)"
                                // +"\n\n(Bug: Does not display update from all lib currently!)"
                                ,
                                displayLatestList);
    return divLatest;
}
function mkAltSearch(zGrpId) {
    var rec = zIdTable[zGrpId];
    var path = rec[0];
    var name = rec[1];
    var site = "www.zotero.org/groups/"+path+"/items/itemKey/";
    var sitePatt = encodeURIComponent("site:"+site);
    // https://www.google.com/search?q=site%3Awww.zotero.org+wahls
    var googleBase = "https://www.google.com/search?q=";
    var hrefBase = googleBase+sitePatt;
    var elt = mkElt("a",
                    {"class":"alt-search", "href":hrefBase, "target":"_blank"}, name);
    elt.addEventListener("click", function(ev){
        var currentQ = currentQuery();
        if (currentQ.length > 0) {
            var href = hrefBase+"+"+encodeURIComponent(currentQ);
            elt.setAttribute("href", href);
        }
    });
    return elt;
}



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

function currentQuery() {
    return document.getElementById("gsc-i-id1").value;
}


function initOnLoad() {

    var problemsElt = document.getElementById("problems");
    var fewToggle = mkElt("a", {"id":"few-hits-toggle", "class":"top-btn"}, "Few or wrong hits?");
    problemsElt.appendChild(fewToggle);
    fewToggle.addEventListener("click", function(ev){
        ev.preventDefault(); // prev only normal click!
        if (fewDiv.style.display === "") {
            fewDiv.style.display = "block";
        } else {
            fewDiv.style.display = null;
        }
    });
    var fewDiv = mkElt("div", {"id":"few-hits"});
    problemsElt.appendChild(fewDiv);
    fewDiv.appendChild(
        mkElt("p", null,
              ["Note 1: ",
               mkElt("a",
                     {"href":"https://productforums.google.com/forum/#!category-topic/customsearch/troubleshooting-and-bugs/ZXwDTG-1Wuc",
                      "target":"_blank"},
                     "All hits are not always shown"),
               "! (It sometimes help to click the search button several times.)"
              ]));
    fewDiv.appendChild(
        mkElt("p", null,
              ["Note 2: ",
               mkElt("a",
                     {"href":"https://forums.zotero.org/discussion/33988/google-indexing-and-the-look-of-the-items-pages/",
                      "target":"_blank"},
                     "Zotero gives a bit wrong data to Google"),
               "! This means search sometimes may give very weird results.",
               " Try ",
               mkElt("a",{"href":
                          (function(){
                              var l = window.location;
                              return l.protocol+"//"+l.host+l.pathname
                                  +"?q=adhd+mta";
                          })(),
                          "target":"_blank"},
                     "this search"),
               ". When I try this today the last hit looks like it is about MTA, ",
               "but it is actually about something quite different."
              ]));
    fewDiv.appendChild(
        mkElt("h3", null,
              "What can we do about this??"));
    fewDiv.appendChild(
        mkElt("p", null,
              "I am trying to get Google and Zotero to fix this. It will take some time."));
    fewDiv.appendChild(
        mkElt("p", null,
              "In the meantime you have at least three options:"));
    fewDiv.appendChild(
        mkElt("ol", null,
              [mkElt("li", null,
                     "You can still try this search page, but be aware of the problems."),
               mkElt("li", null,
                     ["You can ",
                      mkElt("a",
                            {"href":"https://www.zotero.org/download/",
                             "target":"_blank"}, "install Zotero on your computer"),
                      " and link it to the group libraries above."]),
               mkElt("li", null,
                     "You can also search on Zotero's website in the libraries above.")
              ]));
    

    var menuContainer = document.getElementById("menu-div");
    (function mkMenus() {
        function menuClick(elt) {
            // var ta = document.getElementById("gsc-i-id1").value;
            var ta = currentQuery();
            var what = elt.dataset.what;
            var url = location.protocol+"//"+location.host+location.pathname + "?what="+what;
            if (ta && ta.length > 0) url += "&q="+ta;
            // console.log("url", url);
            window.location.href = url;
        }
        var menuUl = mkElt("ul", null);
        for (var i=0, what; what=menusOrder[i++];) {
            var menuDef = menus[what];
            var title = menuDef["title"];
            var label = menuDef["menuLabel"];
            var menuLi = mkElt("li",
                               {"title":title,
                                "tabindex":"0",
                                "data-what":what
                               },
                               label);
            menuDef["menuElt"] = menuLi;
            menuUl.appendChild(menuLi);
            menuLi.addEventListener("click", function () { menuClick(this); });
            menuLi.addEventListener("keypress", function (ev) {
                switch( ev.keyCode ) {
                case 13: menuClick(this); break; // CR
                }
            });
        }
        menuContainer.appendChild(menuUl);
    })();
    // var menuPsy = mkElt("li",
    //                        {"title":"Search our Zotero library for psychology",
    //                         "tabindex":"0",
    //                         "data-what":"psych"
    //                        },
    //                        "Psychology");
    // menu.appendChild(menuPsy);
    // var menuFood = mkElt("li",
    //                        {"title":"Search our Zotero libraries for food and health",
    //                         "tabindex":"0",
    //                         "data-what":"food"
    //                        },
    //                        "Food & Health");
    // menu.appendChild(menuFood);
    // var menuAll = mkElt("li",
    //                        {"title":"Search all our Zotero libraries,\ni.e. both psychology and food & health",
    //                         "tabindex":"0",
    //                         "data-what":"all"
    //                        },
    //                        "All");
    // menu.appendChild(menuAll);

    // function addMenuEventlisteners() {
    //     var menuItems = menu.childNodes;
    //     // console.log("menuItems", menuItems);
    //     for (var i=0, len=menuItems.length; i<len; i++) {
    //         var mi = menuItems[i];
    //         function menuClick(elt) {
    //             // var ta = document.getElementById("gsc-i-id1").value;
    //             var ta = currentQuery();
    //             var what = elt.dataset.what;
    //             var url = location.protocol+"//"+location.host+location.pathname + "?what="+what;
    //             if (ta && ta.length > 0) url += "&q="+ta;
    //             // console.log("url", url);
    //             window.location.href = url;
    //         }
    //         mi.addEventListener("click", function () { menuClick(this); });
    //         mi.addEventListener("keypress", function (ev) {
    //             switch( ev.keyCode ) {
    //             case 13: menuClick(this); break; // CR
    //             }
    //         });
    //     }
    // }
    // addMenuEventlisteners();

    // switch(params.what) {
    // case "food":
    //     menuFood.classList.add("menu-selected");
    //     selectFoodCSE();
    //     var title = document.createTextNode("Food & Health");
    //     var desc = mkElt("p", null,
    //                      ["Search Zotero libraries ",
    //                       mkGrpLibInfoTag(idMito),
    //                       " and ",
    //                       mkGrpLibInfoTag(idWahls),
    //                       "."
    //                      ]);
    //     break;
    // case "all":
    //     menuAll.classList.add("menu-selected");
    //     var title = document.createTextNode("All our Zotero libraries");
    //     var desc = mkElt("p", null,
    //                      ["Search all our Zotero libraries, i.e. ",
    //                       mkGrpLibInfoTag(idPsych),
    //                       ", ",
    //                       mkGrpLibInfoTag(idMito),
    //                       " and ",
    //                       mkGrpLibInfoTag(idWahls),
    //                       "."
    //                      ]);
    //     selectAll();
    //     break;
    // case "psych":
    // default:
    //     var problemDiv = document.querySelector("#problems");
    //     // if (problemDiv) { problemDiv.style.display = "none"; }
    //     menuPsy.classList.add("menu-selected");
    //     var title = document.createTextNode("Psychology");
    //     var desc = mkElt("p", null,
    //                      ["Search Zotero library ",
    //                       mkGrpLibInfoTag(idPsych),
    //                       "."]);
    //     selectPsychCSE();
    //     break;
    // }

    var which = params.what || "psych";
    var whichMenu = menus[which];
    var menuElt      = whichMenu["menuElt"];
    menuElt.classList.add("menu-selected");
    var title        = whichMenu["title"];
    title = document.createTextNode(title);
    var desc         = whichMenu["desc"]();
    var zoteroGrpIds = whichMenu["zGrps"];
    var cx           = whichMenu["cx"];
    loadGcse(cx);
    var problemDiv = document.querySelector("#problems");



    var t = document.getElementById("title");
    t.appendChild(title);
    var d = document.getElementById("desc");
    d.appendChild(desc);
    var l = document.getElementById("zlatest");
    while (l.firstChild) l.removeChild(l.firstChild);
    var a = document.getElementById("alt-searches");
    if (a) while (a.firstChild) a.removeChild(a.firstChild);
    (function(){
        var btnShowL = mkElt("div",
                             {"id":"zlatest-show", "class":"unselectable", "tabindex":"0"},
                             "Check the latest "+theAfterDays+" days additions to libraries");
        function showAlts(){
            // console.log("show alts");
            btnShowL.style.display = "none";
            divL.style.display = "block";
            setTimeout(function(){
                var toFocus = divL.querySelector("[tabindex]");
                if (toFocus) toFocus.focus();
            }, 10);
        }
        btnShowL.addEventListener("click", showAlts);
        btnShowL.addEventListener("keypress", function(ev){
            // console.log("btnShow keypress", ev.keyCode);
            switch( ev.keyCode ) {
            case 13: showAlts(); break; // CR
            }
        });
        l.appendChild(btnShowL);
        var divL = mkElt("div");
        divL.style.display = "none";
        l.appendChild(divL);
        for (var i=0, grp; grp=zoteroGrpIds[i++]; ) {
            var latestToggle = mkLatestToggle(grp);
            divL.appendChild(latestToggle);
            if (a) {
                var altSearch = mkAltSearch(grp);
                a.appendChild(altSearch);
            }
        }
    })();
    // });
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
