<?php
try {
        header("access-control-allow-origin: *");
        header('Content-type: text/plain; charset=utf-8');

        $zlibUrl = 'https://www.zotero.org/groups/from_some_psychologists';
        if (array_key_exists("zgi", $_GET)) { $zlibUrl = $_GET["zlib"]; }

        $opts = array('http'=>array('method'=>"GET",
                                    'header'=> implode("\r\n",
                                                       array('Content-type: text/html; charset=utf-8'))));
        $context = stream_context_create($opts);
        $html = file_get_contents($zlibUrl, false, $context);
        echo $html; exit;
        // echo "($html)";
        // $numItems = 0;
        // if (preg_match("/See all (\d+) items/", $html, $matches)) {
        //         $numItems = $matches[1];
        // }

        // // $xml = new SimpleXMLElement($homepage);
        // $doc = new DOMDocument();
        // $doc->loadHTML($html);
        // $sxml = simplexml_import_dom($doc);
        // // $breadcrumbs = $sxml->xpath("//div[@id='breadcrumbs']");
        // // echo $breadcrumbs[0]->asXml(); exit;
        // $h1 = $sxml->xpath("//*[@id='group-show']/h1");
        // // echo $h1[0]->asXml(); exit;
        // if (!$h1) {
        //         echo "Could not find Zotero library title in this link \n";
        //         echo $zlibUrl;
        //         exit;
        // }
        // $desc = $sxml->xpath("//div[@class='minor-col last-col']");
        // if (!$desc) {
        //         echo "Could not find Zotero library desc in this link \n";
        //         echo $zlibUrl;
        //         exit;
        // }
        // $descXML = $desc[0]->asXml();
        // $withoutDetails = preg_replace("/<ul class=\"group-information\"[\s\S]*/", "</div>", $descXML);
        // // $withoutDetails = preg_replace("/<ul class=[\s\S]*/", "</div>", $descXML);
        // // echo $descXML; exit;
        // echo $h1[0]->asXml();
        // echo $withoutDetails;
        // if ($numItems) {
        //         echo "\n<p id=\"libinfo-items-link\">(<a href=\"$zlibUrl/items\">$numItems items</a>)</p>";
        // }
} catch (Exception $ex) {
        echo $ex;
        exit;
  }

?>