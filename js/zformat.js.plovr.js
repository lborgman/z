
// See http://www.plovr.com/options.html
{
    "id": "zformat",
    "inputs": [
        "../../banner/oc-mh1.js",
        "zreader.js",
        "edit.js",
        "zformat.js",
    ],
    "paths": ".",
    "externs": [
        "zformat-externs.js"
    ],
    "custom-externs-only": false,
    "mode":"advanced",
    // "mode":"simple",
    // "mode":"whitespace",
    "output-file": "zformat-cld.js",
    "output-wrapper": "/* Copyright 2014 lennart.borgman@gmail.com */ (function(){%output%})();",
    "output-charset": "UTF-8"
}
