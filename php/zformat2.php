<?php
namespace ZFormat;

///// Test URL
// http://ourcomments.org/cgi-bin/zformat2.php
// http://ourcomments.org/zformat/g/56508/i/WQG7QNXW

////// Zotero Web API
// https://www.zotero.org/support/dev/web_api/v3/basics

ini_set('display_errors', 1); 
error_reporting(E_ALL);

// http://pear.php.net/manual/en/package.http.http-request2.request.php
// http://pear.php.net/manual/en/package.http.http-request2.response.php
require_once 'HTTP/Request2.php';


// fake args for command line test
$zgi = "56508";
$zk  = "GU936VHD";
$zk  = "3B6TR25A";
$zk  = "T9UKVMIX";
$zk="NH6N7CP9"; $zgi="136570";
$zk="WQG7QNXW"; $zgi="56508";
if (array_key_exists("zgi", $_GET)) { $zgi = htmlspecialchars($_GET["zgi"]); }
if (array_key_exists("zk", $_GET)) { $zk = htmlspecialchars($_GET["zk"]); }
// echo $zk; exit;

//$zurl = "https://api.zotero.org/groups/56508/items/3B6TR25A?format=atom&content=json";
$zurl = "https://api.zotero.org/groups/"
        . $zgi
        . "/items/"
        . $zk
        . "?format=atom&content=json";
// echo $zurl; exit;

$userUrl = "https://zotero.org/groups/"
        . $zgi
        . "/items/"
        . $zk;

$r = new \HTTP_Request2($zurl, \HTTP_Request2::METHOD_GET);
// $r = new HTTP_Request2($zurl, HTTP_Request2::METHOD_GET);

$r->setHeader('Zotero-API-Version', '3');
// var_dump($r); exit;

// http://stackoverflow.com/questions/10064362/how-to-make-https-request-using-php-http-request2
$r->setConfig(array(
    'ssl_verify_peer'   => FALSE,
    'ssl_verify_host'   => FALSE
));



//// from ZReader.js
function mkElt($type, $attrib, $inner) {
        $elt = "<" . $type;
        if (isset($attrib)) {
                foreach($attrib as $x => $x_val) {
                        $elt .= " " . $x . '="' . $x_val . '"';
                }
        }
        $elt .= ">";
        if (isset($inner)) {
                if (gettype($inner) == "string") { $elt .= $inner; } else { $elt .= join("", $inner); }
                $elt .= "</" . $type . ">";
        }
        return $elt;
}
function mkDt($title) {
        return mkElt("span", array( "class" => "dt" ), $title . " ");
}
function mkDd($desc) {
        return mkElt("span", array( "class" => "dd" ), $desc);
}
function mkRow($dt, $dd) {
        return mkElt("span", array( "class" => "drow" ), array(mkDt($dt),mkDd($dd)));
}

function mkDetail($zfield, $label) {
        global $json;
        if (array_key_exists($zfield, $json)) {
                return mkRow($label, $json[$zfield]);
        } else {
                return "";
        }
}
function mkDetailGoogleDefine($zfield, $label) {
        global $json;
        if (array_key_exists($zfield, $json)) {
                return mkRow($label, mkGoogleDefine($json[$zfield]));
        } else {
                return "";
        }
}

//// Helpers

// http://stackoverflow.com/questions/1734250/what-is-the-equivalent-of-javascripts-encodeuricomponent-in-php
function encodeURIComponent($str) {
    $revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
    return strtr(rawurlencode($str), $revert);
}

function mkGoogleDefine($what) {
        $href = "https://www.google.com/search?q=define:"
                . encodeURIComponent($what);
        return mkElt("a", array("href"=>$href), $what);
}

//// Avoiding indexing parts of the page
// http://en.wikipedia.org/wiki/Noindex
// http://webmasters.stackexchange.com/questions/16390/preventing-robots-from-crawling-specific-part-of-a-page

//// The markup specs etc
// http://www.internetmarketingninjas.com/blog/search-engine-optimization/schema-org-guide-beginners-cheatsheet/
// http://schema.org/
// http://ogp.me/
// https://dev.twitter.com/cards/overview
// https://api.zotero.org/itemTypes

////// Tests
// http://www.google.com/webmasters/tools/richsnippets
// http://opengraphcheck.com/
// https://cards-dev.twitter.com/validator

try {
        $response = $r->send();
        if ($response->getStatus() == 200) {
                $body = $response->getBody();

                $xml = new \SimpleXMLElement($body);
                // $xml = new SimpleXMLElement($body);

                $xml->registerXPathNamespace('d', 'http://www.w3.org/2005/Atom');
                $up = $xml->xpath("//d:link[@rel='up']");
                // https://eval.in/private/fb3abc512f3678
                if (sizeof($up) > 0) {
                        $up0 = $up[0];
                        $up_href = $up0["href"];
                        if (preg_match("#^https?://api.zotero.org/groups/(.*?)/items/(.*?)\?#",
                                       $up_href, $match)
                            === 1)
                                {
                                        $parent_zgrp = $match[1];
                                        $parent_zid  = $match[2];
                                } else
                                {
                                        echo "ERROR:Can't match parent item";
                                }
                        // echo $parent_lib, " ", $parent_id; exit;
                }


                $content = $xml->content;
                $json = json_decode($content, true);
                // var_dump($json); exit;
                
                $frag = "";

                //////// url - the real main field
                $zotlink = $xml->link[1]['href'];
                // echo $zotlink; exit;
                $url = $zotlink; // fallback, fix-me: need a better one, error reporting etc.
                if (array_key_exists("url", $json)) {
                        // $url = $json->url;
                        $url = $json["url"];
                } else {
                        if (array_key_exists("doi", $json)) {
                                // $doi = $json->doi;
                                $doi = $json["doi"];
                                $url = "http://dx.doi.org/" . $doi;
                        }
                }
               

                //// title - always there!
                // Zotero - "field": "title", "localized": "Title"
                // $title = $json->title;
                $title = $json["title"];
                $fragTitle = mkElt("h1",
                                     array("class"=>"h1-title",
                                           "id"=>"ref-title"),
                                     mkElt("a",
                                           array( "href"=>$url,
                                                  "title"=>"Visit source",
                                                  "itemprop"=>"url"
                                                  ),
                                           mkElt("span", array( "itemprop"=>"name"), $title)));

                //// creators - always there?
                $fragAuthors = "";
                if (array_key_exists("creators", $json)) {
                        // $creators = $json->creators;
                        $creators = $json["creators"];
                        // var_dump($creators); exit;
                        $creatorFrags = array();
                        $arrlen = count($creators);
                        for ($i=0; $i<$arrlen; $i++) {
                                $ci = $creators[$i];
                                $name = null;
                                if (array_key_exists("name", $ci)) {
                                        // echo "name key exists\n";
                                        // $name = $ci->name;
                                        $name = $ci["name"];
                                }
                                // var_dump($ci); exit;
                                // $creatorType = $ci->creatorType;
                                $creatorType = $ci["creatorType"];
                                switch($creatorType) {
                                case "author":
                                        $creatorItemprop = "author";
                                        break;
                                case "contributor":
                                        $creatorItemprop = "contributor";
                                        break;
                                case "editor":
                                        $creatorItemprop = "editor";
                                        break;
                                case "seriesEditor":
                                        $creatorItemprop = "editor";
                                        break;
                                case "translator":
                                        $creatorItemprop = "editor"; // fix-me: not in schema.org yet
                                        break;
                                default:
                                        $creatorItemprop = "author";
                                }
                                if (!$name) {
                                        // $fN = $ci->firstName;
                                        $fN = $ci["firstName"];
                                        // $lN = $ci->lastName;
                                        $lN = $ci["lastName"];
                                        $name = $fN . " " . $lN;
                                }
                                if ($name) {
                                        if (array_key_exists($creatorItemprop, $creatorFrags)) {
                                                $creatorFrags[$creatorItemprop] .= ", ";
                                        } else {
                                                $creatorFrags[$creatorItemprop] = "";
                                        }
                                        $creatorFrags[$creatorItemprop] .= 
                                                mkElt("span", array("itemprop"=>$creatorItemprop), $name);
                                        if ($i === 0) { $twitterFullTitle = $name; }
                                }
                        }
                        foreach($creatorFrags as $a => $a_val) {
                                $fragAuthors .= mkRow($a, $a_val);
                        }
                        // echo $frag; exit;
                }

                $fragDetails = "";

                //////// Zotero API returned item types and fields as comments, with English pretty names.
                // https://api.zotero.org/itemTypes
                //
                // Map these to microdata itemtype and a visible label name.

                $microdataItemtype = null; // http://schema.org/$microdataItemtype
                $visibleItemtypeLabel = null;

                // $zf2itemprop = array(); // zotero field => schema.org itemprop
                // $zf2itemName = array(); // zotero field => visible name
                // $zf2itemprop["abstractNote"] = "description"; $zf2itemName["abstractNote"] = "Description");
                // echo $zfield2itemprop["abstractNote"][0]; exit;
                // switch ($json->itemType) {
                switch ($json["itemType"]) {

                        //// Zotero - "itemType": "artwork", "localized": "Artwork"
                        //// Zotero - "itemType": "audioRecording", "localized": "Audio Recording"
                        //// Zotero - "itemType": "bill", "localized": "Bill"
                        //// Zotero - "itemType": "blogPost", "localized": "Blog Post"

                case "book":
                        //// Zotero - "itemType": "book", "localized": "Book"
                        $microdataItemtype = "Book";   $visibleItemtypeLabel = "Book";
                        // https://api.zotero.org/itemTypeFields?itemType=book
                        // Zotero - "field": "ISBN", "localized": "ISBN"
                        // Zotero - "field": "abstractNote", "localized": "Abstract"
                        // Zotero - "field": "accessDate", "localized": "Accessed"
                        // Zotero - "field": "archive", "localized": "Archive"
                        // Zotero - "field": "archiveLocation", "localized": "Loc. in Archive"
                        // Zotero - "field": "callNumber", "localized": "Call Number"
                        // Zotero - "field": "date", "localized": "Date"
                        // Zotero - "field": "edition", "localized": "Edition"
                        // Zotero - "field": "extra", "localized": "Extra"
                        // Zotero - "field": "language", "localized": "Language"
                        // Zotero - "field": "libraryCatalog", "localized": "Library Catalog"
                        // Zotero - "field": "numPages", "localized": "# of Pages"
                        // Zotero - "field": "numberOfVolumes", "localized": "# of Volumes"
                        // Zotero - "field": "place", "localized": "Place"
                        // Zotero - "field": "publisher", "localized": "Publisher"
                        // Zotero - "field": "rights", "localized": "Rights"
                        // Zotero - "field": "series", "localized": "Series"
                        // Zotero - "field": "seriesNumber", "localized": "Series Number"
                        // Zotero - "field": "shortTitle", "localized": "Short Title"
                        // Zotero - "field": "title", "localized": "Title"
                        // Zotero - "field": "url", "localized": "URL"
                        // Zotero - "field": "volume", "localized": "Volume"

                        break;

                        //// Zotero - "itemType": "bookSection", "localized": "Book Section"
                        //// Zotero - "itemType": "case", "localized": "Case"
                        //// Zotero - "itemType": "computerProgram", "localized": "Computer Program"
                        //// Zotero - "itemType": "conferencePaper", "localized": "Conference Paper"
                        //// Zotero - "itemType": "dictionaryEntry", "localized": "Dictionary Entry"
                        //// Zotero - "itemType": "document", "localized": "Document"
                        //// Zotero - "itemType": "email", "localized": "E-mail"
                        //// Zotero - "itemType": "encyclopediaArticle", "localized": "Encyclopedia Article"
                        //// Zotero - "itemType": "film", "localized": "Film"
                        //// Zotero - "itemType": "forumPost", "localized": "Forum Post"
                        //// Zotero - "itemType": "hearing", "localized": "Hearing"
                        //// Zotero - "itemType": "instantMessage", "localized": "Instant Message"
                        //// Zotero - "itemType": "interview", "localized": "Interview"

                case "journalArticle":
                        //// Zotero - "itemType": "journalArticle", "localized": "Journal Article"
                        $microdataItemtype = "ScholarlyArticle";   $visibleItemtypeLabel = "Journal Article";
                        // https://api.zotero.org/itemTypeFields?itemType=journalArticle
                        // Zotero - "field": "title", "localized": "Title"
                        // Zotero - "field": "abstractNote", "localized": "Abstract"
                        // Zotero - "field": "publicationTitle", "localized": "Publication"
                        // Zotero - "field": "volume", "localized": "Volume"
                        // Zotero - "field": "issue", "localized": "Issue"
                        // Zotero - "field": "pages", "localized": "Pages"
                        // Zotero - "field": "date", "localized": "Date"
                        // Zotero - "field": "series", "localized": "Series"
                        // Zotero - "field": "seriesTitle", "localized": "Series Title"
                        // Zotero - "field": "seriesText", "localized": "Series Text"
                        // Zotero - "field": "journalAbbreviation", "localized": "Journal Abbr"
                        // Zotero - "field": "language", "localized": "Language"
                        // Zotero - "field": "DOI", "localized": "DOI"
                        // Zotero - "field": "ISSN", "localized": "ISSN"
                        // Zotero - "field": "shortTitle", "localized": "Short Title"
                        // Zotero - "field": "url", "localized": "URL"
                        // Zotero - "field": "accessDate", "localized": "Accessed"
                        // Zotero - "field": "archive", "localized": "Archive"
                        // Zotero - "field": "archiveLocation", "localized": "Loc. in Archive"
                        // Zotero - "field": "libraryCatalog", "localized": "Library Catalog"
                        // Zotero - "field": "callNumber", "localized": "Call Number"
                        // Zotero - "field": - "field": "rights", "localized": "Rights" 
                        break;

                        //// Zotero - "itemType": "letter", "localized": "Letter"
                        //// Zotero - "itemType": "magazineArticle", "localized": "Magazine Article"
                        //// Zotero - "itemType": "manuscript", "localized": "Manuscript"
                        //// Zotero - "itemType": "map", "localized": "Map"

                case "newspaperArticle":
                        //// Zotero - "itemType": "newspaperArticle", "localized": "Newspaper Article"
                        $microdataItemtype = "NewsArticle";   $visibleItemtypeLabel = "Newspaper Article";
                        break;

                        //// Zotero - "itemType": "note", "localized": "Note"
                        //// Zotero - "itemType": "patent", "localized": "Patent"
                        //// Zotero - "itemType": "podcast", "localized": "Podcast"
                        //// Zotero - "itemType": "presentation", "localized": "Presentation"
                        //// Zotero - "itemType": "radioBroadcast", "localized": "Radio Broadcast"
                        //// Zotero - "itemType": "report", "localized": "Report"
                        //// Zotero - "itemType": "statute", "localized": "Statute"
                        //// Zotero - "itemType": "tvBroadcast", "localized": "TV Broadcast"
                        //// Zotero - "itemType": "thesis", "localized": "Thesis"

                case "videoRecording":
                        //// Zotero - "itemType": "videoRecording", "localized": "Video Recording"
                        $microdataItemtype = "VideoObject";   $visibleItemtypeLabel = "Video";
                        break;

                case "webpage":
                        //// Zotero - "itemType": "webpage", "localized": "Web Page"
                        $microdataItemtype = "WebPage";   $visibleItemtypeLabel = "Web Page";
                        break;

                default:
                        $microdataItemtype = "CreativeWork";   $visibleItemtypeLabel = "Unhandled Zotero type";
                }
                // echo $json->itemType; echo "\n";
                // echo $visibleItemtypeLabel; echo "\n";
                // echo $microdataItemtype; echo "\n";
                // exit;



                // $twitterTitle = $title;
                $twitterFullTitle = "";


                if (array_key_exists("abstractNote", $json)) {
                        // $abstractNote = $json->abstractNote;
                        $abstractNote = $json["abstractNote"];
                        $abstractNote = rtrim($abstractNote);
                        $abstractNote = ltrim($abstractNote);
                        if (strlen($abstractNote) > 0) {
                                $twitterDescription = substr($abstractNote, 0, 200);
                                // echo $twitterDescription; exit;
                                $token = strtok($abstractNote, "\n");
                                $abstrInner = "";
                                while ($token !== false) {
                                        if (isset($abstrInner)) {
                                                $abstrInner .= mkElt("div", array("class"=>"br"),"");
                                        } else {
                                                $abstrInner = "";
                                        }
                                        $abstrInner .= mkElt("span", null, $token);
                                        $token = strtok("\n");
                                }
                                // var_dump($abstrInner); exit;
                                $classes = "sixteen xcolumns";
                                // echo strlen($abstractNote); exit;
                                if (strlen($abstractNote) > 500) { // 3-4 rows
                                        $classes .=" newspaper-cols";
                                }
                                $fragAbstractNote = mkElt("div", array("class"=>$classes), $abstrInner);
                                // var_dump($fragAbstract); exit;
                                // $frag .= mkRow("Abstract", $fragAbstractNote);
                                // $frag .= mkDd($fragAbstractNote);
                                $frag .= mkElt("div",
                                               array(// "class"=>"drow",
                                                     "itemprop"=>"description"),
                                               $fragAbstractNote);
                                // echo $frag; exit;
                        }
                }
                $ogDescription = substr($abstractNote, 0, 400);

                // date
                if (array_key_exists("date", $json)) {
                        // $date = $json->date;
                        $date = $json["date"];
                        $date = rtrim($date);
                        if (strlen($date) === 0) { $date = null; }
                        if ($date) {
                                if (preg_match("#[0-9]{4}#", $date, $match) === 1) {
                                        if (strlen($twitterFullTitle) > 0) { $twitterFullTitle .= " "; }
                                        $twitterFullTitle .= "(".$match[0].")";
                                }
                        }
                } else {
                        // echo "no date"; exit;
                }
                $accessDateNotice = "";
                if (!$date) {
                        // $date = substr($json->accessDate, 0, 10);
                        $date = substr($json["accessDate"], 0, 10);
                        $isAccessDate = true;
                        $accessDateNotice = " (accessed)";
                }
                // fix me: date type
                $date = mkElt("span", array("itemprop"=>"datePublished", "style"=>"display:inline-block"), $date);
                $date .= $accessDateNotice;
                // echo "Date:".$date; exit;
                $fragAuthors .= mkRow("Date", $date); // fix-me

                if (array_key_exists("publicationTitle", $json)) {
                        $genPublisher =
                                mkGoogleDefine(
                                               // $json->publicationTitle);
                                               $json["publicationTitle"]);
                } elseif (array_key_exists("websiteTitle", $json)) {
                        $genPublisher =
                                mkGoogleDefine(
                                               // $json->websiteTitle);
                                               $json["websiteTitle"]);
                } elseif (array_key_exists("publisher", $json)) {
                        $genPublisher =
                                mkGoogleDefine(
                                               // $json->publisher);
                                               $json["publisher"]);
                }
                if (isset($genPublisher)) {
                        $genPublisher = rtrim($genPublisher);
                        if (strlen($genPublisher) === 0) { $genPublisher = null; }
                }
                if (!isset($genPublisher)) {
                        // $genPublisher = "dummy";
                        if (array_key_exists("url", $json)) {
                                // $url = $json->url;
                                $url = $json["url"];
                                // var m = new RegExp("https?://[^/]*").exec(url);
                                if (preg_match("#^https?://[^/]*#", $url, $match) === 1) {
                                        $genPublisher = mkElt("a",
                                                              array("href"=>$url),
                                                              $match[0]);
                                }
                        }
                }
                // echo $genPublisher; exit;
                if (isset($genPublisher)) {
                        // $fragDetails .= mkRow($visibleItemtypeLabel, array($genPublisher, ", ", $date));
                        $fragDetails .= mkRow($visibleItemtypeLabel, array($genPublisher));
                }
                // echo $frag; exit;


                if (strlen($twitterFullTitle) > 0) { $twitterFullTitle .= ". "; }
                $twitterFullTitle .= $title;


                // Get group name
                if (preg_match("#^https?://(?:www.)zotero.org/groups/(.*?)/#", $zotlink, $match) === 1)
                    {
                            $zgrp = $match[1];
                            $zgrp = str_replace("_", " ", $zgrp);
                            // echo $zgrp; exit;
                    }
                else
                        {
                                $zgrp = "(Can't find group name)";
                        }
                // echo $zotlink; exit;

                //// All Zotero field names, but the most interesting ones in "Details".
                // Zotero - "field": "numPages", "localized": "# of Pages"
                // Zotero - "field": "numberOfVolumes", "localized": "# of Volumes"
                // Used Zotero - "field": "abstractNote", "localized": "Abstract"
                // Zotero - "field": "accessDate", "localized": "Accessed"
                // Zotero - "field": "applicationNumber", "localized": "Application Number"
                // Zotero - "field": "archive", "localized": "Archive"
                // Zotero - "field": "artworkSize", "localized": "Artwork Size"
                // Zotero - "field": "assignee", "localized": "Assignee"
                // Zotero - "field": "billNumber", "localized": "Bill Number"
                // Zotero - "field": "blogTitle", "localized": "Blog Title"
                // Zotero - "field": "bookTitle", "localized": "Book Title"
                // Zotero - "field": "callNumber", "localized": "Call Number"
                // Zotero - "field": "caseName", "localized": "Case Name"
                // Zotero - "field": "code", "localized": "Code"
                // Zotero - "field": "codeNumber", "localized": "Code Number"
                // Zotero - "field": "codePages", "localized": "Code Pages"
                // Zotero - "field": "codeVolume", "localized": "Code Volume"
                // Zotero - "field": "committee", "localized": "Committee"
                // Zotero - "field": "company", "localized": "Company"
                $fragDetails .= mkDetailGoogleDefine("company", "Company");
                // Zotero - "field": "conferenceName", "localized": "Conference Name"
                // Zotero - "field": "country", "localized": "Country"
                $fragDetails .= mkDetailGoogleDefine("country", "Country");
                // Zotero - "field": "court", "localized": "Court"
                // Zotero - "field": "DOI", "localized": "DOI"
                if (array_key_exists("DOI", $json)) {
                        $fragDetails .= mkRow("DOI",
                                              mkElt("a",
                                                    array("href"=>"http://dx.doi.org/"+$json["DOI"]),
                                                    $json["DOI"]));
                }
                // Zotero - "field": "date", "localized": "Date"
                // Zotero - "field": "dateDecided", "localized": "Date Decided"
                // Zotero - "field": "dateEnacted", "localized": "Date Enacted"
                // Zotero - "field": "dictionaryTitle", "localized": "Dictionary Title"
                // Zotero - "field": "distributor", "localized": "Distributor"
                // Zotero - "field": "docketNumber", "localized": "Docket Number"
                // Zotero - "field": "documentNumber", "localized": "Document Number"
                // Zotero - "field": "edition", "localized": "Edition"
                // Zotero - "field": "encyclopediaTitle", "localized": "Encyclopedia Title"
                // Zotero - "field": "episodeNumber", "localized": "Episode Number"
                // Zotero - "field": "extra", "localized": "Extra"
                // Zotero - "field": "audioFileType", "localized": "File Type"
                // Zotero - "field": "filingDate", "localized": "Filing Date"
                // Zotero - "field": "firstPage", "localized": "First Page"
                // Zotero - "field": "audioRecordingFormat", "localized": "Format"
                // Zotero - "field": "videoRecordingFormat", "localized": "Format"
                // Zotero - "field": "forumTitle", "localized": "Forum/Listserv Title"
                // Zotero - "field": "genre", "localized": "Genre"
                // Zotero - "field": "history", "localized": "History"
                // Zotero - "field": "ISBN", "localized": "ISBN"
                if (array_key_exists("ISBN", $json)) {
                        $fragDetails
                                .= mkRow("ISBN",
                                         mkElt("a",
                                               array("href"=>
                                                     "https://www.google.com/search?tbm=bks&q=isbn:"
                                                     +$json["ISBN"]),
                                               $json["ISBN"]));
                }
                // Zotero - "field": "ISSN", "localized": "ISSN"
                // $fragDetails .= mkDetail("ISSN", "ISSN");
                // Zotero - "field": "institution", "localized": "Institution"
                // Zotero - "field": "issue", "localized": "Issue"
                // Zotero - "field": "issueDate", "localized": "Issue Date"
                // Zotero - "field": "issuingAuthority", "localized": "Issuing Authority"
                // Zotero - "field": "journalAbbreviation", "localized": "Journal Abbr"
                // Zotero - "field": "label", "localized": "Label"
                // Zotero - "field": "language", "localized": "Language"
                // Zotero - "field": "programmingLanguage", "localized": "Language"
                // Zotero - "field": "legalStatus", "localized": "Legal Status"
                // Zotero - "field": "legislativeBody", "localized": "Legislative Body"
                // Zotero - "field": "libraryCatalog", "localized": "Library Catalog"
                // Zotero - "field": "archiveLocation", "localized": "Loc. in Archive"
                // Zotero - "field": "interviewMedium", "localized": "Medium"
                // Zotero - "field": "artworkMedium", "localized": "Medium"
                // Zotero - "field": "meetingName", "localized": "Meeting Name"
                // Zotero - "field": "nameOfAct", "localized": "Name of Act"
                // Zotero - "field": "network", "localized": "Network"
                // Zotero - "field": "pages", "localized": "Pages"
                // Zotero - "field": "patentNumber", "localized": "Patent Number"
                // Zotero - "field": "place", "localized": "Place"
                // Zotero - "field": "postType", "localized": "Post Type"
                // Zotero - "field": "priorityNumbers", "localized": "Priority Numbers"
                // Zotero - "field": "proceedingsTitle", "localized": "Proceedings Title"
                // Zotero - "field": "programTitle", "localized": "Program Title"
                // Zotero - "field": "publicLawNumber", "localized": "Public Law Number"
                // Zotero - "field": "publicationTitle", "localized": "Publication"
                // Used Zotero - "field": "publisher", "localized": "Publisher"
                // Zotero - "field": "references", "localized": "References"
                // Zotero - "field": "reportNumber", "localized": "Report Number"
                // Zotero - "field": "reportType", "localized": "Report Type"
                // Zotero - "field": "reporter", "localized": "Reporter"
                // Zotero - "field": "reporterVolume", "localized": "Reporter Volume"
                // Zotero - "field": "rights", "localized": "Rights"
                // Zotero - "field": "runningTime", "localized": "Running Time"
                // Zotero - "field": "scale", "localized": "Scale"
                // Zotero - "field": "section", "localized": "Section"
                // Zotero - "field": "series", "localized": "Series"
                // Zotero - "field": "seriesNumber", "localized": "Series Number"
                // Zotero - "field": "seriesText", "localized": "Series Text"
                // Zotero - "field": "seriesTitle", "localized": "Series Title"
                // Zotero - "field": "session", "localized": "Session"
                // Zotero - "field": "shortTitle", "localized": "Short Title"
                // Zotero - "field": "studio", "localized": "Studio"
                // Zotero - "field": "subject", "localized": "Subject"
                // Zotero - "field": "system", "localized": "System"
                // Used Zotero - "field": "title", "localized": "Title"
                // Zotero - "field": "thesisType", "localized": "Type"
                $fragDetails .= mkDetail("thesisType", "Type");
                // Zotero - "field": "mapType", "localized": "Type"
                // Zotero - "field": "manuscriptType", "localized": "Type"
                // Zotero - "field": "letterType", "localized": "Type"
                // Zotero - "field": "presentationType", "localized": "Type"
                // Used Zotero - "field": "url", "localized": "URL"
                // Zotero - "field": "university", "localized": "University"
                $fragDetails .= mkDetailGoogleDefine("university", "University");
                // Zotero - "field": "version", "localized": "Version"
                // Zotero - "field": "volume", "localized": "Volume"
                // Zotero - "field": "websiteTitle", "localized": "Website Title"
                $fragDetails .= mkDetailGoogleDefine("websiteTitle", "Website");
                // Zotero - "field": - "field": "websiteType", "localized": "Website Type" 

                // fix-me
                // $frag .= $fragDetails;

                //// Tags
                if (!array_key_exists("tags", $json)) {
                        $tagFrag = null;
                } else {
                        $tagFrag = "";
                        $tags = $json["tags"];
                        $tlength = count($tags);
                        if ($tlength > 0) {
                                for ($t=0; $t < $tlength; $t++) {
                                        $tag = $tags[$t];
                                        $tagTag = $tag["tag"];
                                        // echo $tagTag . " ";
                                        $chkBox = mkElt("input",
                                                        array("type"=>"checkbox", "style"=>"display:none"),
                                                        null);
                                        $tagFrag .= mkElt("label",
                                                          array("class"=>"tag"),
                                                          array($tagTag, $chkBox));
                                        // echo $tagFrag; exit;
                                }
                        }
                        // exit;
                        $fragDetails .= mkRow("Tags", $tagFrag);
                }

        }
} catch (HttpException $ex) {
        echo $ex;
        exit;
  }

// echo $title . "<br><br>\n\n";
// echo $abstract . "<br><br>\n\n";
// exit;
// echo $content; exit;
// echo $body; exit;
// $title = "the title";

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- This page © Copyright 2014, Lennart Borgman -->
    <meta charset="UTF-8">
    <title><?php echo $title; ?></title>

    <!-- Mobile Specific Metas
         ================================================== -->
    <meta name="viewport" content="initial-scale=1" >

    <!-- For Zotero saving
         ================================================== -->
    <meta property="og:title" content="<?php echo $title; ?>" />
    <meta property="og:description" content="<?php echo $ogDescription; ?>" />
    <meta property="og:type" content="article" />

    <script>
      php_zgi = <?php echo $zgi; ?>
      php_zk = <?php echo $zk; ?>
      // php_json = <?php echo $content; ?>;
      <?php if (isset($parent_zgrp) && $parent_zgrp) { ?>
        php_parent_zgrp = "<?php echo $parent_zgrp; ?>";
        php_parent_zid  = "<?php echo $parent_zid; ?>";
      <?php } ?>
    </script>

    <!-- base-tag can not be used here because the copying of references will not work then!
         <base href="http://dl.dropboxusercontent.com/u/848981/it/z/"> -->


    <!-- CSS
         ================================================== -->

    <!-- Favicons
         ================================================== -->
    <link rel="icon" sizes="16x16 32x32 64x64" href="http://dl.dropboxusercontent.com/u/848981/it/z/favicon.ico">

    <!-- <link rel="stylesheet" href="css/zformat.css" /> -->
    <!-- <script type="text/javascript" src="js/zformat-cld.js"></script> -->

    <link rel="stylesheet" href="http://dl.dropboxusercontent.com/u/848981/it/z/css/zformat2.css" />
    <script id="zformat-js" src="http://dl.dropboxusercontent.com/u/848981/it/z/js/zformat2-cld.js"></script>

    <!-- Twitter cards
         ================================================== -->
    <meta name="twitter:card" content="summary" >
    <meta name="twitter:title" content="<?php echo $twitterFullTitle; ?>" >
    <meta name="twitter:description" content="<?php echo $twitterDescription; ?>" >
    <meta name="twitter:image:src" content="http://zotero.org/favicon.ico" >

  </head>
  <body>


    <div id="libinfo"></div>

    <div id="main" class="container">
      <div>
        <div id="header-div">
          <div id="glass-outer">
            <div id="glass-cont">
              <div id="glass" class="circle"></div>
              <div id="glass-search">Search!</div>
              <a id="glass2" class="circle" href="#"></a>
              <div id="glass-rod1" class="glass-rod"></div>
            </div>
          </div>
          <div id="upper-right-links">
            <a id="libinfolink"
               href="<?php echo $userUrl; ?>"
               title="Show Zotero library info. Or, right click to go there.">
              From
                <span class="zotero-name" id="zotero1"><span>z</span>otero</span>
              <img src="http://dl.dropboxusercontent.com/u/848981/it/z/img/info.svg">
            </a>
            <br>
            <span id="cite" tabstop="0" title="Copy reference etc">
              <img src="https://dl.dropboxusercontent.com/u/848981/it/z/img/double-quote-serif-left.svg">
              &nbsp;Cite&nbsp;
              <img src="https://dl.dropboxusercontent.com/u/848981/it/z/img/double-quote-serif-right.svg">
            </span>
          </div>
        </div>
        <div id="output" itemscope itemtype="http://schema.org/<?php echo $microdataItemtype; ?>" style="display:block">
          <?php echo $fragTitle; ?>
          <div id="output-authors"><?php echo $fragAuthors; ?></div>
          <?php echo $frag; ?>
          <div id="output-details"><?php echo $fragDetails; ?></div>
        </div>
        <div id="output-attachments"></div>
      </div>
    </div>

  
</body></html>
