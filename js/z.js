function searchMoreNow(ths) {
    var ta = document.getElementById("gsc-i-id1").value;
    var btn = ths || document.getElementById("search-more");
    var hr = btn.href;
    if (ta) hr += "?q="+ta;
    btn.href = hr;
}
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    var notabLinks = document.querySelectorAll(".no-underline");
    for (var i=0; i<notabLinks.length; i++) {
        notabLinks[i].setAttribute("tabindex", "-1");
    }
});

window.onload = function(){
    var zLatest = document.getElementById("zlatest");
    if (zLatest) {
        var urlBuilder = new ZURLBuilder(true, grpId);
        var zURL = urlBuilder.latestItems(20);
        ZReader.setupToggleForFetch(zURL, zLatest,
                                    "Latest updates (last week, probably not yet in search below)",
                                    "Displays the latest updates which might not have been found by Google yet",
                                    displayLatestList);
    }
}

// var myHref = window.location.href;
// var m = new RegExp("[^?]*").exec(myHref);
// var searchURL = m[0];
// var searchURL = "http://ourcomments.org/psych/zfsp.html";
var formatterURL = "http://dl.dropboxusercontent.com/u/848981/it/cw/zformat.html";
var formatterURL = "http://ourcomments.org/cgi-bin/zformat.php";

function displayLatestList(jsons, outputElt) {
    var fragment = document.createDocumentFragment();
    var afterDate = new Date();
    afterDate.setDate(afterDate.getDate()-7);
    var mkElt = ZReader.mkElt;
    for (var i=0; i<jsons.length; i++) {
        var json = jsons[i]
        // var itemType = json["itemType"];
        // console.log("itemType", itemType);
        // Unfortunately we do not have the date
        // of adding or modification. We have the
        // accessDate, however, which - if it is
        // there - might be the date of adding.
        var accessDate = json["accessDate"];
        console.log("accessDate", accessDate);
        if (accessDate) {
            accessDate = accessDate.replace(/ .*$/, "");
            if (0 == accessDate.length) accessDate = undefined;
        }
        if (accessDate) {
            accessDateObj = new Date(accessDate);
            if (isNaN(accessDateObj.getMilliseconds())) accessDate = undefined;
        }
        console.log("accessDateObj", accessDateObj);
        if (!accessDate || accessDateObj > afterDate) {
            accessDate = accessDate || "(no date found)";
            var dateSpan = mkElt("span", {"class":"myNew-date"}, accessDate);
            var abstr = json["abstractNote"];
            if (abstr) { // Skipping notes etc
                if (abstr.length > 300) abstr = abstr.substring(0, 300)+" ...";
                var itemKey = json["itemKey"];
                var href = "http://www.zotero.org/groups/from_some_psychologists/items/itemKey/"+itemKey;
                href = formatterURL + "?"
                    + [
                        // "f="+searchURL,
                        "zgi="+grpId,
                        "zk="+itemKey
                    ].join("&")
                ;
                var title = json["title"];
                var linkElt = mkElt("a", {"href":href, "target":"_blank", "class":"myNew-link"}, title);
                var abstrDiv = mkElt("div", {"class":"myNew-abs-div"}, abstr);
                url = json["url"];
                var urlDiv = mkElt("div", {"class":"myNew-url-div"}, url);
                var itemElt = mkElt("div", {"class":"myNew-div"},
                                    [dateSpan, " ", linkElt, urlDiv, abstrDiv]);
                fragment.appendChild(itemElt);
            }
        }
    }
    outputElt.appendChild(fragment);
}
