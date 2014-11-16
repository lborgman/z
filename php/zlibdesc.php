<?php
try {
        header("access-control-allow-origin: *");
        $zlibUrl = 'https://www.zotero.org/groups/from_some_psychologists';
        $zlibUrl = $_GET["zlib"];
        $html = file_get_contents($zlibUrl);
        // echo "($html)";
        // $numItems = 0;
        if (preg_match("/See all (\d+) items/", $html, $matches)) {
                $numItems = $matches[1];
        }

        // $xml = new SimpleXMLElement($homepage);
        $doc = new DOMDocument();
        $doc->loadHTML($html);
        $sxml = simplexml_import_dom($doc);
        $desc = $sxml->xpath("//div[@class='minor-col last-col']");
        if (!$desc) {
                echo "Could not find Zotero library desc in this link \n";
                echo $zlibUrl;
                exit;
        }
        $descXML = $desc[0]->asXml();
        $withoutDetails = preg_replace("/<ul class=\"group-information\"[\s\S]*/", "</div>", $descXML);
        // $withoutDetails = preg_replace("/<ul class=[\s\S]*/", "</div>", $descXML);
        // echo $descXML; exit;
        echo $withoutDetails;
        if ($numItems) {
                echo "\n<p><i>$numItems items</i></p>";
        }
} catch (Exception $ex) {
        echo $ex;
        exit;
  }

?>