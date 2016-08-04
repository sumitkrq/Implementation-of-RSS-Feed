<?php

$sUrl = $_GET['url'];

header( 'Content-Type: text/xml' );
readfile($sUrl);

?>