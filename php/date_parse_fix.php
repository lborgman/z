// Work around for some bugs in date_parse (tested in PHP 5.5.19)
//   http://php.net/manual/en/function.date-parse.php
//   For testing 
//
// Date formats that are cannot be parsed correctly withoug this fix:
//   1) "2014" - Valid ISO 8061 date format but not recognized by date_parse.
//   2) "Feb 2010" - Parsed but gives ["day"] => 1.
function date_parse_5_5_bugfix($dateRaw) {
        // Check "2014" bug:
        $dateRaw = rtrim($dateRaw);
        $dateRaw = ltrim($dateRaw);
        if (strlen($dateRaw) === 4 && preg_match("/\d{4}/", $dateRaw) === 1) {
                $da = date_parse($dateRaw . "-01-01");
                $da["month"] = false;
                $da["day"] = false;
        } else {
                $da = date_parse($dateRaw);
                if ($da) {
                        if (array_key_exists("year", $da)
                            && array_key_exists("month", $da)
                            && array_key_exists("day", $da))
                                {
                                        if ($da["day"] === 1) {
                                                // Check "Feb 2010" bug:
                                                // http://www.phpliveregex.com/
                                                if (preg_match("/\b0?1(?:\b|T)/", $dateRaw) !== 1) {
                                                        $da["day"] = false;
                                                }
                                        }
                                }
                }
        }
        return $da;
}
// Tests (visual ;-) )
$a = date_parse_5_5_bugfix("2014"); print_r($a);
$b = date_parse_5_5_bugfix("feb 2010"); print_r($b);
$c = date_parse_5_5_bugfix("2014-01-01"); print_r($c);
$d = date_parse_5_5_bugfix("2014-11-01T06:43:08Z"); print_r($d);
$e = date_parse_5_5_bugfix("2014-11-01x06:43:08Z"); print_r($e);

