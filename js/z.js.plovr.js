
// See http://www.plovr.com/options.html
{
    "id": "z",
    "inputs": [
        "../../bc/log-it.js",
        "../../banner/oc-mh1.js",
        "rewrite-cse.js",
        "zreader.js",
        "z-select-id.js",
        "z.js"
    ],
    "paths": ".",
    "externs": [
        "z-externs.js"
    ],
    "custom-externs-only": false,
    "mode":"advanced",
    // "mode":"whitespace",
    "output-file": "z-cld.js",
    "output-wrapper": "/* Copyright 2014 lennart.borgman@gmail.com */ (function(){%output%})();",
    "output-charset": "UTF-8"
}
