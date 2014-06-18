var grpId;
var myCseCallback = function() {
    console.log("my call back");
    if (typeof rewriteCseStart != "undefined")
        rewriteCseStart();
    else
        console.log("no rewriteCseStart yet");
    var focusAndBind = function() {
        var firstForm = document.forms[0][0];
        firstForm.focus();
        document.addEventListener('keydown',function(e){
            switch( e.keyCode )
            {
            case 8: break; // BS
            case 9: break; // Tab
            case 13: break; // CR
            case 16: break; // Shift
            case 16: break; // Ctrl
            case 27: closeabout(); // Esc
            default:
                // firstForm.focus();
                // $(document).unbind('keydown'); // Just one form here!
            }
        });
    }
    if (document.readyState == 'complete') {
        // Document is ready when CSE element is initialized.
        focusAndBind();
    } else {
        // Document is not ready yet, when CSE element is initialized.
        google.setOnLoadCallback(
            function() {
                focusAndBind();
            },
            true);
    }
};

function selectAll() {
    grpId = 56508; // fix-me

    // Insert it before the CSE code snippet so that cse.js can take the script
    // parameters, like parsetags, callbacks.
    window.__gcse = {
        callback: myCseCallback
    };

    (function() {
        var cx = '008189935189648121880:ma7nn38e5nq';
        var gcse = document.createElement('script'); gcse.type = 'text/javascript'; gcse.async = true;
        gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
            '//www.google.com/cse/cse.js?cx=' + cx;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gcse, s);
    })();
}

function selectPsychCSE() {
    grpId = 56508;

    // Insert it before the CSE code snippet so that cse.js can take the script
    // parameters, like parsetags, callbacks.
    window.__gcse = {
        callback: myCseCallback
    };

    (function() {
        var cx = '008189935189648121880:c-91zelm5n8';
        var gcse = document.createElement('script'); gcse.type = 'text/javascript'; gcse.async = true;
        gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
            '//www.google.com/cse/cse.js?cx=' + cx;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gcse, s);
    })();
}


function selectFoodCSE() {
    grpId = 136570;

    // Insert it before the CSE code snippet so that cse.js can take the script
    // parameters, like parsetags, callbacks.
    window.__gcse = {
        callback: myCseCallback
    };

    (function() {
        var cx = '008189935189648121880:u_oojlxeeau';
        var gcse = document.createElement('script'); gcse.type = 'text/javascript'; gcse.async = true;
        gcse.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') +
            '//www.google.com/cse/cse.js?cx=' + cx;
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(gcse, s);
    })();
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

var mkElt = ZReader.mkElt;

window.addEventListener("load", function() {

    var menuContainer = document.getElementById("menu-div");
    var menu = mkElt("ul", null);
    var menuPsy = mkElt("li",
                           {"title":"Search our Zotero library for psychology",
                            "data-what":"psych"
                           },
                           "Psychology");
    menu.appendChild(menuPsy);
    var menuFood = mkElt("li",
                           {"title":"Search our Zotero libraries for food and health",
                            "data-what":"food"
                           },
                           "Food & Health");
    menu.appendChild(menuFood);
    var menuAll = mkElt("li",
                           {"title":"Search all our Zotero libraries,\ni.e. both psychology and food & health",
                            "data-what":"all"
                           },
                           "All");
    menu.appendChild(menuAll);
    menuContainer.appendChild(menu);

    function addMenuEventlisteners() {
        var menuItems = menu.childNodes;
        console.log("menuItems", menuItems);
        for (var i=0, len=menuItems.length; i<len; i++) {
            var mi = menuItems[i];
            mi.addEventListener("click", function menuClick() {
                var ta = document.getElementById("gsc-i-id1").value;
                var what = this.dataset.what;
                var url = location.protocol+"//"+location.host+location.pathname + "?what="+what;
                if (ta && ta.length > 0) url += "&q="+ta;
                // console.log("url", url);
                window.location.href = url;
            });
        }
    }
    addMenuEventlisteners();

    var libLinkMitoconrdia = 
        mkElt("a",
              {
                  "href":"https://www.zotero.org/groups/minding_my_mitochondria_terry_wahls",
                  "title":"Visit Zotero",
                  "class":"no-underline",
                  "tabindex":"-1"},
              "Minding My Mitochondria");
    var libLinkWahlsProtocol = 
        mkElt("a",
              {
                  "href":"https://www.zotero.org/groups/the_wahls_protocol",
                  "title":"Visit Zotero",
                  "class":"no-underline",
                  "tabindex":"-1"},
              "The Wahls Protocol");
    var libLinkPsychology = 
        mkElt("a",
              {
                  "href":"https://www.zotero.org/groups/from_some_psychologists",
                  "title":"Visit Zotero",
                  "class":"no-underline",
                  "tabindex":"-1"},
              "From Some Psychologists");

    switch(params.what) {
    case "food":
        menuFood.classList.add("menu-selected");
        selectFoodCSE();
        var title = document.createTextNode("Food & Health");
        var desc = mkElt("p", null,
                         ["Search Zotero libraries ",
                          libLinkMitoconrdia,
                          " and ",
                          libLinkWahlsProtocol,
                          "."
                          ,mkElt("span", {"style":"color:red"}, " NOTE: The last library is not indexed yet!!")
                         ]);
        break;
    case "psych":
        menuPsy.classList.add("menu-selected");
        var title = document.createTextNode("Psychology");
        var desc = mkElt("p", null,
                         ["Search Zotero library ",
                          libLinkPsychology,
                          "."]);
        selectPsychCSE();
        break;
    default:
        menuAll.classList.add("menu-selected");
        var title = document.createTextNode("All our Zotero libraries");
        var desc = mkElt("p", null,
                         ["Search all our Zotero libraries, i.e. ",
                          libLinkPsychology,
                          ", ",
                          libLinkMitoconrdia,
                          " and ",
                          libLinkWahlsProtocol,
                          "."
                          ,mkElt("span", {"style":"color:red"}, " NOTE: The last library is not indexed yet!!")
                         ]);
        selectAll();
    }

    var t = document.getElementById("title");
    t.appendChild(title);
    var d = document.getElementById("desc");
    d.appendChild(desc);
});
