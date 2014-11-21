
// See http://www.plovr.com/options.html
{
    "id": "zformat2",
    "inputs": [
        // "../../banner/oc-mh1.js",
        "zreader.js",
        "edit.js",
        "zformat2.js",
    ],
    "paths": ".",
    "externs": [
        "zformat-externs.js",
    ],
    "custom-externs-only": false,
    "mode":"advanced",
    // "mode":"whitespace",
    "output-file": "zformat2-cld.js",
    "output-wrapper": "/* Copyright 2014 lennart.borgman@gmail.com */ (function(){%output%})();",
    "output-charset": "UTF-8"
}
