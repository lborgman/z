<?php
ini_set('display_errors', 1); 
error_reporting(E_ALL);

require_once 'HTTP/Request2.php';

// http://pear.php.net/manual/en/package.http.http-request2.request.php
// http://pear.php.net/manual/en/package.http.http-request2.response.php
//$url = "https://api.zotero.org/groups/56508/items/3B6TR25A?format=atom&content=json";
$url = "https://api.zotero.org/groups/"
  . htmlspecialchars($_GET["zgi"])
  . "/items/"
  . htmlspecialchars($_GET["zk"])
  . "?format=atom&content=json";
// echo $url . "<br>\n";

$r = new HTTP_Request2($url, HTTP_Request2::METHOD_GET);
$r->setHeader('Zotero-API-Version', '2');

// http://stackoverflow.com/questions/10064362/how-to-make-https-request-using-php-http-request2
$r->setConfig(array(
    'ssl_verify_peer'   => FALSE,
    'ssl_verify_host'   => FALSE
));
try {
        $response = $r->send();
        if ($response->getStatus() == 200) {
                $body = $response->getBody();
                // $body= str_replace('xmlns=', 'ns=', $body);
                $xml = new SimpleXMLElement($body);
                $xml->registerXPathNamespace('d', 'http://www.w3.org/2005/Atom');
                // var_dump($xml); exit;
                $myphp_up = $xml->xpath("//d:link[@rel='up']");
                // $myphp_up = $xml->xpath("//link[@rel]");
                // $myphp_up = $xml->xpath("//link");
                // $myphp_up = $xml->xpath("/");
                // $myphp_up = $xml->xpath("link");
                // var_dump($myphp_up); exit;
                // https://eval.in/private/fb3abc512f3678
                if (sizeof($myphp_up) > 0) {
                        $myphp_up0 = $myphp_up[0];
                        // var_dump($myphp_up0); exit;
                        // $myphp_up_href = $myphp_up0->href;
                        $myphp_up_href = $myphp_up0["href"];
                        // echo($myphp_up_href);
                        if (preg_match("#^https?://api.zotero.org/groups/(.*?)/items/(.*?)\?#",
                                       $myphp_up_href, $match))
                                {
                                        $myphp_parent_zgrp = $match[1];
                                        $myphp_parent_zid  = $match[2];
                                } else
                                {
                                        echo "ERROR:Can't match parent item";
                                }
                        // echo $myphp_parent_lib, " ", $myphp_parent_id; exit;
                }
                $myphp_content = $xml->content;
                $myphp_json = json_decode($myphp_content);
                $myphp_title = $myphp_json->title;
                $myphp_abstract = "(No abstract)";
                if (array_key_exists("abstractNote", $myphp_json)) {
                        $myphp_abstract = $myphp_json->abstractNote;
                }
                // $myphp_abstract = $myphp_json["abstractNote"];
                $myphp_sentence2 = substr($myphp_abstract, 0, 400);
                // Get group name
                $h = $xml->link[1]['href'];
                if (preg_match("#^https?://zotero.org/groups/(.*?)/#", $h, $match))
                    {
                            $myphp_zgrp = $match[1];
                    }
                else
                        {
                                $myphp_zgrp = "(Can't find group name)";
                        }
                // echo $h; exit;
        }
} catch (HttpException $ex) {
        echo $ex;
        exit;
  }

// echo $myphp_title . "<br><br>\n\n";
// echo $myphp_abstract . "<br><br>\n\n";
// exit;
// echo $myphp_content; exit;
// echo $body; exit;
// $myphp_title = "the title";

?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- This page © Copyright 2014, Lennart Borgman -->
    <meta charset="UTF-8">
    <title><?php echo $myphp_title; ?></title>

    <!-- Mobile Specific Metas
         ================================================== -->
    <meta name="viewport" content="initial-scale=1" >

    <!-- For Zotero saving
         ================================================== -->
    <meta property="og:title" content="<?php echo $myphp_title; ?>" />
    <meta property="og:description" content="<?php echo $myphp_sentence2; ?>" />
    <meta property="og:type" content="article" />

    <script>
      php_json = <?php echo $myphp_content; ?>;
      <?php if (isset($myphp_parent_zgrp) && $myphp_parent_zgrp) { ?>
        php_parent_zgrp = "<?php echo $myphp_parent_zgrp; ?>";
        php_parent_zid  = "<?php echo $myphp_parent_zid; ?>";
      <?php } ?>
    </script>

    <!-- base-tag can not be used here because the copying of references will not work then!
         <base href="http://dl.dropboxusercontent.com/u/848981/it/z/"> -->


    <!-- CSS
         ================================================== -->

    <!-- Favicons
         ================================================== -->
    <link rel="icon" sizes="16x16 32x32 64x64" href="http://dl.dropboxusercontent.com/u/848981/it/z/favicon.ico" />

    <!-- <link rel="stylesheet" href="css/zformat.css" /> -->
    <!-- <script type="text/javascript" src="js/zformat-cld.js"></script> -->

    <link rel="stylesheet" href="http://dl.dropboxusercontent.com/u/848981/it/z/css/zformat.css" />
    <script id="zformat-js" src="http://dl.dropboxusercontent.com/u/848981/it/z/js/zformat-cld.js"></script>

    <!-- Twitter cards
         ================================================== -->
    <meta name="twitter:card" content="summary" >
    <meta name="twitter:title" content="MY tytle" >
    <meta name="twitter:description" content="my long desc" >
    <meta name="twitter:image:src" content="http://zotero.org/favicon.ico" >

  </head>
  <body>


    <div class="container">
      <div id="lib-container">
        A
        <a href="javascript:alert('Something went wrong (or not ready yet)');"
           title="Show in Zotero"
           id="zotlink">reference</a>
        from
          <span style="font-size:18px"><span style="color: #BE0D0D">z</span>otero</span>
      library
        <div id="upper-right-links">
          <a href="javascript:alert('Something went wrong (or not ready yet)');"
             id="libinfolink"
             title="Show Zotero library info"
             style="text-decoration:none; xopacity:0.2">
            <div id="lib-title"></div>
          </a>
        </div>
        </div>
      <div id="libinfo"></div>
      <div class="sixteen columns">
        <div id="output" itemscope itemtype="http://schema.org/ScholarlyArticle" style="display:block">
          Preparing to fetch data from Zotero ...
        </div>
        <div id="output-attachments"></div>
      </div>
      <div id="glass-cont">
        <div id="glass" class="circle"></div>
        <div id="glass-search">Search!</div>
        <a id="glass2" class="circle" href="#"></a>
        <div id="glass-rod1" class="glass-rod"></div>
      </div>
    </div>



  </body>
