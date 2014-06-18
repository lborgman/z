function descrLength() {
    var f = document.getElementById("description_ifr");
    var cd = f.contentDocument;
    var html = cd.body.innerHTML;
    return html.length;
}
