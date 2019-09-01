<?php
$redis = new Redis();
$redis->pconnect( '127.0.0.1' );
$password = $redis->get( 'pwd_protection' );
if ( $password ) session_start(); // for login
$time = time();  // for cache busting
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
<link rel="stylesheet" href="/assets/css/bootstrap.min.<?=$time?>.css">
<style>
	@font-face {
		font-family: enhance;
		src        : url( "/fonts/enhance.<?=$time?>.woff" ) format( 'woff' ),
		             url( "/fonts/enhance.<?=$time?>.ttf" ) format( 'truetype' );
		font-weight: normal;
		font-style : normal;
	}
</style>
<link rel="stylesheet" href="/assets/css/fontawesome.min.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/info.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/roundslider.min.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/main.<?=$time?>.css">
<link rel="stylesheet" href="/assets/css/banner.<?=$time?>.css">
	<?php
	if ( !preg_match( '/(Mobile|Android|Tablet|GoBrowser|[0-9]x[0-9]*|uZardWeb\/|Mini|Doris\/|Skyfire\/|iPhone|Fennec\/|Maemo|Iris\/|CLDC\-|Mobi\/)/uis', $_SERVER['HTTP_USER_AGENT'] ) ) echo 
'<link rel="stylesheet" href="/assets/css/desktop.css">';
	if ( file_exists('/srv/http/assets/js/lyrics.js') ) echo 
'<link rel="stylesheet" href="/assets/css/lyrics.'.$time.'.css">';
	?>
	
</head>
<body>

<?php
$logo = '
	<g><path class="st0" d="M206.4,118.7c2.3,3.8,5.7,7.3,8.1,9.3c3.8,3.1,6.7,2.8,10.2-0.6c4.8-5.5,8.7-8.9,13.2-13.5
			c12.5-12.8,14.4-28.3,13-45.2c-1.9-12.8-1.6-14.3-0.6-23.3c1.2-7.1,0.8-13.6-0.9-20c-0.6-3.4-1.4-3.4-4.6-4
			c-17.2-1.5-32.9,3-47.4,12.3c-5.1,3.1-5,3.7-3.1,9.3c1.3,3.2,2.1,6.7,3.6,9.8c3.8,8.2,4.7,7.9,13.5,6.6c5.6-0.8,10.5-3,17.5-6
			c-2.4,3.5-4.3,7.1-6.6,9.4c-6.6,6.6-15,10.4-23.8,13.1c-4.6,1.4-8-1.1-9.3-5.1c-2.9-7.3-4-13.1-5.4-19.9c-1.3-6-2.5-12.4-2.6-18.5
			c0-4,0-5.6,3.6-8.2c4.3-3,9.4-5.4,14.3-7.4c18.5-7.6,37.3-12.6,57.1-15.9c7.4-1.2,8.9-1.6,8.9,6.1c1.3,20.5-1.9,46.5-0.3,66.2
			c1.4,5.8,1.1,6.8-0.3,13.3c-3.7,17-19.1,38.6-34.3,50.7c-2.1,1.8-4.4,3.1-7.2,4c-9,2.8-10.3,5-14.3-5.2
			C207.5,133.1,206,127,206.4,118.7z"/>
		<path class="st0" d="M201.9,92.2c11.7-2.7,18.4-4.7,27.2-14.1c-0.6,7.8-3.1,15.9-8.8,20.6c-3.8,3.2-5.8,2.9-8.6,0.8
			C208.9,97.6,204.2,94,201.9,92.2z"/></g>
	<g><path class="st1" d="M0,100.9V61.1h2c0.4,0,0.8,0.1,1,0.3s0.3,0.5,0.4,1l0.3,8.4c1.3-3.2,3-5.7,5.1-7.6c2.1-1.8,4.8-2.7,7.9-2.7
			c1.2,0,2.3,0.1,3.3,0.4c1,0.2,2,0.6,2.9,1.1l-0.5,2.6c-0.1,0.4-0.3,0.6-0.8,0.7c-0.2,0-0.4-0.1-0.7-0.2c-0.3-0.1-0.7-0.2-1.1-0.4
			c-0.4-0.1-1-0.2-1.6-0.3c-0.6-0.1-1.4-0.2-2.2-0.2c-3,0-5.5,0.9-7.4,2.8s-3.5,4.5-4.7,8v25.9H0z"/>
		<path class="st1" d="M30.7,86.5V61.1h3.8v25.4c0,3.7,0.9,6.7,2.6,8.8c1.7,2.1,4.3,3.2,7.8,3.2c2.6,0,5-0.7,7.2-2s4.3-3.2,6.1-5.5
			V61.1H62v39.8h-2.1c-0.7,0-1.1-0.4-1.2-1.1l-0.4-5.9c-1.9,2.3-4,4.1-6.4,5.5s-5.1,2.1-8.1,2.1c-2.2,0-4.1-0.3-5.8-1
			c-1.6-0.7-3-1.7-4.1-3s-1.9-2.9-2.5-4.7C31,90.9,30.7,88.8,30.7,86.5z"/>
		<path class="st1" d="M75,100.9V61.1h2.1c0.7,0,1.1,0.3,1.2,1l0.4,5.9c1.8-2.3,3.9-4.1,6.3-5.5s5.1-2.1,8.1-2.1c2.2,0,4.1,0.3,5.8,1
			c1.7,0.7,3,1.7,4.1,3c1.1,1.3,1.9,2.9,2.5,4.7c0.6,1.8,0.8,3.9,0.8,6.3v25.4h-3.8V75.4c0-3.7-0.9-6.7-2.6-8.8
			c-1.7-2.1-4.3-3.2-7.8-3.2c-2.6,0-5,0.7-7.3,2c-2.2,1.3-4.2,3.2-6,5.5v29.9H75V100.9z"/>
		<path class="st1" d="M115.3,80.2c0-2.9,0.4-5.5,1.2-7.9s2-4.5,3.5-6.2s3.4-3.1,5.6-4.1s4.8-1.5,7.6-1.5c2.2,0,4.3,0.4,6.2,1.2
			s3.5,1.9,4.9,3.4c1.4,1.5,2.5,3.3,3.3,5.5s1.2,4.6,1.2,7.4c0,0.6-0.1,1-0.3,1.2s-0.4,0.3-0.8,0.3h-28.6v0.8c0,3,0.4,5.6,1.1,7.9
			s1.7,4.2,3,5.7s2.8,2.7,4.6,3.5s3.8,1.2,6.1,1.2c2,0,3.7-0.2,5.2-0.6s2.7-0.9,3.7-1.5c1-0.5,1.8-1,2.4-1.5c0.6-0.4,1-0.7,1.3-0.7
			s0.6,0.1,0.8,0.4l1,1.3c-0.6,0.8-1.5,1.5-2.5,2.2s-2.2,1.3-3.5,1.8s-2.7,0.9-4.1,1.2c-1.5,0.3-2.9,0.4-4.4,0.4
			c-2.7,0-5.2-0.5-7.4-1.4s-4.2-2.3-5.8-4.1c-1.6-1.8-2.8-4-3.7-6.7S115.3,83.6,115.3,80.2z M119.2,77h26.2c0-2.1-0.3-4-0.9-5.7
			c-0.6-1.7-1.4-3.1-2.5-4.3c-1.1-1.2-2.3-2.1-3.8-2.7s-3.1-1-5-1c-2.1,0-3.9,0.3-5.5,1c-1.6,0.6-3,1.6-4.2,2.8
			c-1.2,1.2-2.1,2.6-2.9,4.3S119.5,74.9,119.2,77z"/></g>
	<g><path class="st1" d="M300.1,91.2c0-1.7,0.5-3.3,1.4-4.7s2.5-2.7,4.5-3.8c2.1-1.1,4.7-1.9,7.9-2.6c3.2-0.6,7.1-1,11.6-1.1v-4.2
			c0-3.7-0.8-6.5-2.4-8.5s-3.9-3-7.1-3c-1.9,0-3.6,0.3-4.9,0.8c-1.3,0.5-2.5,1.1-3.4,1.8c-0.9,0.6-1.7,1.2-2.3,1.8
			c-0.6,0.5-1.1,0.8-1.5,0.8c-0.5,0-1-0.3-1.2-0.8l-0.7-1.2c2.1-2.1,4.3-3.6,6.6-4.7s4.9-1.6,7.8-1.6c2.1,0,4,0.3,5.6,1
			s2.9,1.6,4,2.9c1.1,1.3,1.9,2.8,2.4,4.6c0.5,1.8,0.8,3.8,0.8,6v25.9h-1.5c-0.8,0-1.3-0.4-1.5-1.1l-0.6-5.1c-1.1,1.1-2.2,2-3.3,2.9
			c-1.1,0.9-2.2,1.6-3.4,2.2c-1.2,0.6-2.4,1-3.8,1.3s-2.9,0.4-4.5,0.4c-1.4,0-2.7-0.2-4-0.6s-2.4-1-3.4-1.8s-1.8-1.9-2.4-3.2
			C300.4,94.6,300.1,93,300.1,91.2z M303.9,91.2c0,1.3,0.2,2.5,0.7,3.5c0.4,1,1,1.8,1.7,2.4s1.6,1.1,2.5,1.4s2,0.5,3,0.5
			c1.5,0,2.9-0.2,4.2-0.5c1.3-0.3,2.5-0.8,3.6-1.4s2.1-1.3,3.1-2.1s1.9-1.7,2.8-2.7V81.7c-3.8,0.1-7,0.4-9.8,0.9
			c-2.7,0.5-5,1.1-6.8,1.9s-3.1,1.8-3.9,2.9S303.9,89.7,303.9,91.2z"/>
		<path class="st1" d="M340.2,86.5V61.1h3.8v25.4c0,3.7,0.9,6.7,2.6,8.8c1.7,2.1,4.3,3.2,7.8,3.2c2.6,0,5-0.7,7.2-2s4.3-3.2,6.1-5.5
			V61.1h3.8v39.8h-2.1c-0.7,0-1.1-0.4-1.2-1.1l-0.4-5.9c-1.9,2.3-4,4.1-6.4,5.5s-5.1,2.1-8.1,2.1c-2.2,0-4.1-0.3-5.8-1
			c-1.6-0.7-3-1.7-4.1-3s-1.9-2.9-2.5-4.7C340.5,90.9,340.2,88.8,340.2,86.5z"/>
		<path class="st1" d="M381.5,81.1c0-2.9,0.4-5.6,1.1-8.2s1.9-4.7,3.3-6.6c1.5-1.9,3.3-3.3,5.4-4.4c2.1-1.1,4.6-1.6,7.4-1.6
			c2.7,0,5,0.5,7,1.5s3.7,2.5,5.1,4.4V42.7h3.8v58.2h-2.1c-0.7,0-1.1-0.3-1.2-1l-0.4-6.2c-1.8,2.4-3.8,4.3-6.2,5.7
			c-2.4,1.4-5,2.1-8,2.1c-4.8,0-8.6-1.7-11.3-5.1C382.8,93,381.5,87.9,381.5,81.1z M385.3,81.1c0,5.9,1.1,10.3,3.3,13.1
			c2.2,2.8,5.3,4.2,9.4,4.2c2.6,0,5-0.7,7.2-2s4.1-3.3,5.8-5.7V69.6c-1.5-2.3-3.2-3.9-5.1-4.8s-4-1.4-6.3-1.4s-4.4,0.4-6.2,1.3
			s-3.2,2.1-4.4,3.6c-1.2,1.6-2.1,3.4-2.7,5.6C385.6,76.1,385.3,78.5,385.3,81.1z"/>
		<path class="st1" d="M427.7,47.4c0-0.5,0.1-0.9,0.3-1.4c0.2-0.4,0.4-0.8,0.8-1.2c0.3-0.3,0.7-0.6,1.1-0.8s0.9-0.3,1.4-0.3
			s0.9,0.1,1.3,0.3s0.8,0.4,1.1,0.8c0.3,0.3,0.6,0.7,0.8,1.2c0.2,0.4,0.3,0.9,0.3,1.4s-0.1,0.9-0.3,1.3c-0.2,0.4-0.5,0.8-0.8,1.1
			s-0.7,0.6-1.1,0.8s-0.9,0.3-1.3,0.3s-0.9-0.1-1.3-0.3s-0.8-0.4-1.1-0.8c-0.3-0.3-0.6-0.7-0.8-1.1C427.8,48.3,427.7,47.9,427.7,47.4
			z M429.3,100.9V61.1h3.8v39.8C433.1,100.9,429.3,100.9,429.3,100.9z"/>
		<path class="st1" d="M444.1,81c0-3.1,0.4-5.9,1.2-8.4c0.8-2.5,2-4.7,3.5-6.5s3.4-3.2,5.7-4.1c2.2-1,4.8-1.4,7.6-1.4
			c2.8,0,5.4,0.5,7.6,1.4c2.2,1,4.1,2.3,5.7,4.1c1.5,1.8,2.7,3.9,3.5,6.5c0.8,2.5,1.2,5.3,1.2,8.4s-0.4,5.9-1.2,8.4
			c-0.8,2.5-2,4.7-3.5,6.5s-3.4,3.2-5.7,4.1c-2.2,1-4.8,1.4-7.6,1.4c-2.8,0-5.4-0.5-7.6-1.4c-2.2-1-4.1-2.3-5.7-4.1s-2.7-3.9-3.5-6.5
			C444.5,86.9,444.1,84.1,444.1,81z M447.9,81c0,2.7,0.3,5.1,0.9,7.2s1.5,4,2.7,5.5s2.7,2.7,4.4,3.5s3.8,1.2,6.2,1.2s4.4-0.4,6.2-1.2
			c1.8-0.8,3.3-2,4.4-3.5s2.1-3.4,2.7-5.5s0.9-4.5,0.9-7.2c0-2.6-0.3-5-0.9-7.2s-1.5-4-2.7-5.5s-2.7-2.7-4.4-3.5
			c-1.8-0.8-3.8-1.2-6.2-1.2s-4.4,0.4-6.2,1.2s-3.3,2-4.4,3.5c-1.2,1.5-2.1,3.4-2.7,5.5C448.2,75.9,447.9,78.3,447.9,81z"/></g>
';

include 'indexbody.php';
?>

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
<script src="/assets/js/main.<?=$time?>.js"></script>
<script src="/assets/js/banner.<?=$time?>.js"></script>
<script src="/assets/js/context.<?=$time?>.js"></script>
<script src="/assets/js/function.<?=$time?>.js"></script>
<script src="/assets/js/lyrics.<?=$time?>.js"></script>
	<?php
	if ( !preg_match( '/(Mobile|Android|Tablet|GoBrowser|[0-9]x[0-9]*|uZardWeb\/|Mini|Doris\/|Skyfire\/|iPhone|Fennec\/|Maemo|Iris\/|CLDC\-|Mobi\/)/uis', $_SERVER['HTTP_USER_AGENT'] ) ) echo
'<script src="/assets/js/shortcut.'.$time.'.js"></script>';
	if ( file_exists( '/srv/http/assets/js/gpio.js' ) ) echo
'<script src="/assets/js/gpio.'.$time.'.js"></script>';
	?>
	
</body>
</html>
