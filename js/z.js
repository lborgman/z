// function searchMoreNow(ths) {
//     var ta = document.getElementById("gsc-i-id1").value;
//     var btn = ths || document.getElementById("search-more");
//     var hr = btn.href;
//     if (ta) hr += "?q="+ta;
//     btn.href = hr;
// }

// document.addEventListener("DOMContentLoaded", function(event) {
//     console.log("DOM fully loaded and parsed");
//     var notabLinks = document.querySelectorAll(".no-underline");
//     for (var i=0; i<notabLinks.length; i++) {
//         notabLinks[i].setAttribute("tabindex", "-1");
//     }
// });

// Fix-me: I do not know the reindexing interval for http://zotero.org/.
// It looks like they currently are around 3 weeks. Keep a table:
// 
// 2014-10-13: Newest indexed is 2014-09-23
var theAfterDays = 25;

// window.onload = function(){
//     var zLatest = document.getElementById("zlatest");
//     if (zLatest) {
//         console.log("z.js zoteroGrpIds", zoteroGrpIds);
//         for (var i=0, len=zoteroGrpIds.length; i<len; i++) {
//             var grpPath = zoteroId2GroupPath(zoteroGrpIds[i]);
//             grpPath = grpPath.replace(/_/g, " ");
//             var urlBuilder = new ZURLBuilder(true, zoteroGrpIds[i]);
//             // fix-me: Chrome on android can't fetch 4, but can fetch
//             // 3 items. The length of the rq.responseText is 20175
//             // resp 23867 in my tests.
//             var zURL = urlBuilder.latestItems(50);
//             console.log("zURL", zURL); // debugger;
//             var divLatest = mkElt("div");
//             zLatest.appendChild(divLatest);
//             ZReader.setupToggleForFetch(zURL, divLatest,
//                                         "Latest updates",
//                                         grpPath
//                                         +"\n\n"
//                                         +"Displays the latest updates (last "+theAfterDays+" days)\n"
//                                         +"which might not have been found by Google yet."
//                                         +"\n\n(Note: All entries from those days are displayed!)"
//                                         // +"\n\n(Bug: Does not display update from all lib currently!)"
//                                         ,
//                                         displayLatestList);
//         }
//     }
// }



function displayLatestList(jsons, outputElt) {
    // var formatterURL = "http://dl.dropboxusercontent.com/u/848981/it/z/js/zformat.html";
    var formatterURL = "http://ourcomments.org/cgi-bin/zformat.php";
    // console.log(jsons); debugger;
    var fragment = document.createDocumentFragment();
    var afterDate = new Date();
    var accessDateObj;
    afterDate.setDate(afterDate.getDate()-theAfterDays);
    var mkElt = ZReader.mkElt;
    // console.log("jsons.length", jsons.length);
    // console.log("jsons[0]", jsons[0]);
    // console.log("jsons[1]", jsons[1]);
    var nShown = 0;
    for (var i=0; i<jsons.length; i++) {
        var json = jsons[i]
        // console.log(json); // debugger;
        // var itemType = json["itemType"];
        // console.log("itemType", itemType);
        // Unfortunately we do not have the date
        // of adding or modification. We have the
        // accessDate, however, which - if it is
        // there - might be the date of adding.
        var accessDate = json["accessDate"];
        // console.log("accessDate", accessDate);
        if (accessDate) {
            accessDate = accessDate.replace(/ .*$/, "");
            if (0 == accessDate.length) accessDate = undefined;
        }
        // if (accessDate) {
        //     accessDateObj = new Date(accessDate);
        //     if (isNaN(accessDateObj.getMilliseconds())) accessDate = undefined;
        // }
        // console.log("accessDateObj", accessDateObj);
        // if (!accessDate || accessDateObj > afterDate) {
        var published = json["zoteroPublished"];
        var publishedObj = new Date(published);
        // console.log("publishedObj", publishedObj);
        if (publishedObj > afterDate) {
            var date = json["date"];
            accessDate = accessDate || date || "(no date found)";
            var dateSpan = mkElt("span", {"class":"myNew-date"}, accessDate);
            var abstr = json["abstractNote"];
            if (abstr) { // Skipping notes etc
                if (abstr.length > 300) abstr = abstr.substring(0, 300)+" ...";
                var itemKey = json["zoteroItemKey"];
                var href = "http://www.zotero.org/groups/from_some_psychologists/items/itemKey/"+itemKey;
                href = formatterURL + "?"
                    + [
                        // "f="+searchURL,
                        "zgi="+zoteroGrpIds,
                        "zk="+itemKey
                    ].join("&")
                ;
                var title = json["title"];
                var linkElt = mkElt("a", {"href":href, "target":"_blank", "class":"myNew-link"}, title);
                var abstrDiv = mkElt("div", {"class":"myNew-abs-div"}, abstr);
                published = published.substr(0,10);
                nShown++;
                var publishedDiv = mkElt("div", {"class":"myNew-url-div", "title":"no:"+nShown},
                                         "(Added to Zotero "+published+")");
                url = json["url"];
                var urlDiv = mkElt("div", {"class":"myNew-url-div"}, url);
                var itemElt = mkElt("div", {"class":"myNew-div"},
                                    [dateSpan, " ", linkElt, urlDiv, abstrDiv, publishedDiv]);
                fragment.appendChild(itemElt);
            }
        }
    }
    if (nShown === 0) {
        var itemNo = mkElt("div", {"class":"myNew-div"}, "No new additions the latest "+theAfterDays+" days.");
        fragment.appendChild(itemNo);
    }
    outputElt.appendChild(fragment);
}
