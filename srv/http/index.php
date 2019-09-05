<?php
$redis = new Redis();
$redis->pconnect( '127.0.0.1' );
$password = $redis->get( 'pwd_protection' );
if ( $password ) session_start(); // for login
$time = time();  // for cache busting
$desktop = !preg_match( '/(Mobile|Android|Tablet|GoBrowser|[0-9]x[0-9]*|uZardWeb\/|Mini|Doris\/|Skyfire\/|iPhone|Fennec\/|Maemo|Iris\/|CLDC\-|Mobi\/)/uis', $_SERVER['HTTP_USER_AGENT'] );
?>
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="msapplication-tap-highlight" content="no" />
<title>RuneAudio+R</title>
<link rel="apple-touch-icon" sizes="152x152" href="/assets/img/apple-touch-icon-152x152.<?=$time?>.png">
<link rel="apple-touch-icon" sizes="167x167" href="/assets/img/apple-touch-icon-167x167.<?=$time?>.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon-180x180.<?=$time?>.png">
<link rel="icon" type="image/png" href="/assets/img/favicon-192x192.<?=$time?>.png" sizes="192x192">
<meta name="apple-mobile-web-app-title" content="RuneAudio">
<meta name="msapplication-TileColor" content="#000000">
<meta name="msapplication-TileImage" content="/assets/img/mstile-144x144.<?=$time?>.png">
<meta name="msapplication-config" content="/assets/img/browserconfig.xml">
<meta name="application-name" content="RuneAudio">
<style>
	@font-face {
		font-family: enhance;
		src        : url( "/fonts/enhance.<?=$time?>.woff" ) format( 'woff' ),
		             url( "/fonts/enhance.<?=$time?>.ttf" ) format( 'truetype' );
		font-weight: normal;
		font-style : normal;
	}
</style>
<link rel="stylesheet" href="/assets/css/bootstrap.min.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/info.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/roundslider.min.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/main.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/banner.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/lyrics.<?=$time?>.css">
	<?php if ( $desktop ) { ?> 
<link rel="stylesheet" href="/assets/css/desktop.css">
	<?php } ?>
	
</head>
<body>

<?php include 'indexbody.php';?>

<script src="/assets/js/vendor/jquery-2.1.0.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/jquery.mobile.custom.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/pushstream.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/bootstrap.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/openwebapp.<?=$time?>.js"></script>
<script src="/assets/js/vendor/Sortable.min.<?=$time?>.js"></script>
<script src="/assets/js/info.<?=$time?>.js"></script>
<script src="/assets/js/vendor/roundslider.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/lazyload.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/pica.<?=$time?>.js"></script>
<script src="/assets/js/vendor/html5kellycolorpicker.min.<?=$time?>.js"></script>
<script src="/assets/js/function.<?=$time?>.js"></script>
<script src="/assets/js/main.<?=$time?>.js"></script>
<script src="/assets/js/banner.<?=$time?>.js"></script>
<script src="/assets/js/context.<?=$time?>.js"></script>
<script src="/assets/js/lyrics.<?=$time?>.js"></script>
	<?php if ( $desktop ) { ?> 
<script src="/assets/js/shortcut.<?=$time?>.js"></script>
	<?php } ?>
	
</body>
</html>
