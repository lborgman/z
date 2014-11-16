<?php
namespace ZSitemap;

////// Zotero forum
// https://forums.zotero.org/discussion/33988/google-indexing-and-the-look-of-the-items-pages/

///// Test URL
// http://ourcomments.org/cgi-bin/zsitemap.php
// http://ourcomments.org/zformat/g/56508/sitemap.php

////// Create a site map, see http://erikastokes.com/sitemaps/
// http://webmasters.stackexchange.com/questions/49589/sitemap-xml-file-extension-does-it-have-to-be-xml

////// Rewrite rules so we can use "site search":
// https://www.addedbytes.com/articles/for-beginners/url-rewriting-for-beginners/
// http://stackoverflow.com/questions/5493075/apache-rewrite-get-original-url-in-php
//
// http://ourcomments.org/zformat/g/56508/i/3B6TR25A
// http://ourcomments.org/zformat/g/56508/sitemap.php
//
// RewriteEngine On
// RewriteRule ^zformat/g/([A-Za-z0-9]+)/i/([A-Za-z0-9]+)/?$ cgi-bin/zformat2.php?zgi=$1&zk=$2 [L]
// RewriteRule ^zformat/g/([A-Za-z0-9]+)/sitemap.php$ cgi-bin/sitemap.php?zgi=$1 [L,E=ZOTERO_GID:$1]



ini_set('display_errors', 1); 
error_reporting(E_ALL);

require_once 'HTTP/Request2.php';

if (array_key_exists("zgi", $_GET)) {
        // This is what is used even after Apache rewrite!
        $zgi = htmlspecialchars($_GET["zgi"]);
        // echo "GET ".$zgi; exit;
} elseif (array_key_exists("zgi", $_SERVER)) {
        $zgi = htmlspecialchars($_SERVER["ZOTERO_GID"]);
        // echo "SERVER ".$zgi; exit;
} else {
        $zgi = "56508";
}

$baseurl = null;
if (array_key_exists("SCRIPT_URI", $_SERVER)) {
        if (preg_match("#^(https?://[^/]+/zformat/g/[^/]+/)#",
                       $_SERVER["SCRIPT_URI"], $match) === 1)
                {
                        $baseurl = $match[1]."i/";
                }
} else {
        $baseurl = "http://ourcomments.org/zformat/g/".$zgi."/i/";
}

// https://api.zotero.org/groups/56508/items?format=keys&itemType=-attachment
$zurl = "https://api.zotero.org/groups/"
        . $zgi
        . "/items?format=keys";
$zurl .= "&itemType=-attachment";
// echo $zurl; exit;


// http://stackoverflow.com/questions/10064362/how-to-make-https-request-using-php-http-request2
$r = new \HTTP_Request2($zurl, \HTTP_Request2::METHOD_GET);
$r->setHeader('Zotero-API-Version', '3');
$r->setConfig(array(
    'ssl_verify_peer'   => FALSE,
    'ssl_verify_host'   => FALSE
));

try {
        $response = $r->send();
        if ($response->getStatus() !== 200) {
                echo $response->getStatus(); exit;
        }
        $body = $response->getBody();
        // $body = substr($body, 0, 50);
        $itemKeys = explode("\n", trim($body) );
} catch (HttpException $ex) {
        echo $ex;
        exit;
}

// echo count($itemKeys); exit;

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <?php foreach($itemKeys as $itemKey) { ?>
   <url><loc><?php echo $baseurl.$itemKey; ?></loc></url>
   <?php } ?>
</urlset>
