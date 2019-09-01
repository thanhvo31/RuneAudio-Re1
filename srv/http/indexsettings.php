<?php $time = time();?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>RuneAudio Settings</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="msapplication-tap-highlight" content="no">
	<link rel="stylesheet" href="/assets/css/bootstrap.min.<?=$time?>.css">
	<link rel="stylesheet" href="/assets/css/fontawesome.min.<?=$time?>.css">
	<link rel="stylesheet" href="/assets/css/bootstrap-select.min.<?=$time?>.css">
	<style>
		@font-face {
			font-family: enhance;
			src        : url( '/assets/fonts/enhance.<?=$time?>.woff' ) format( 'woff' ),
			             url( '/assets/fonts/enhance.<?=$time?>.ttf' ) format( 'truetype' );
			font-weight: normal;
			font-style : normal;
		}
	</style>
	<link rel="stylesheet" href="/assets/css/info.<?=$time?>.css">
	<link rel="stylesheet" href="/assets/css/indexsettings.<?=$time?>.css">
	<link rel="stylesheet" href="/assets/css/banner.<?=$time?>.css">
	<link rel="icon" type="image/png" href="/img/favicon-192x192.<?=$time?>.png" sizes="192x192">
</head>
<body>

<?php
$sudo = '/usr/bin/sudo /usr/bin';
function headhtml( $icon, $title ) {
	echo '
		<div class="head">
			<i class="page-icon fa fa-'.$icon.'"></i><span class="title">'.$title.'</span><a href="/"><i id="close" class="fa fa-times fa-2x"></i></a><i id="help" class="fa fa-question-circle"></i>
		</div>
	';
}
$p = $_GET[ 'p' ];
if ( $p === 'credits' ) {
	headhtml( 'rune', 'CREDITS' );
	include 'settings/credits.php';
} else if ( $p === 'mpd' ) {
	headhtml( 'mpd', 'MPD' );
	include 'settings/mpd.php';
} else if ( $p === 'network' ) {
	headhtml( 'network', 'NETWORK' );
	include 'settings/network.php';
} else if ( $p === 'sources' ) {
	headhtml( 'folder-open-cascade', 'SOURCES' );
	include 'settings/sources.php';
} else if ( $p === 'system' ) {
	headhtml( 'sliders', 'SYSTEM' );
	include 'settings/system.php';
}
?>
<script src="/assets/js/vendor/jquery-2.1.0.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/bootstrap.min.<?=$time?>.js"></script>
<script src="/assets/js/vendor/pushstream.min.<?=$time?>.js"></script>
<script src="/assets/js/info.<?=$time?>.js"></script>
<script src="/assets/js/banner.<?=$time?>.js"></script>
<script>
$( '#help' ).click( function() {
	$( this ).toggleClass( 'blue' );
	$( '.help-block' ).toggleClass( 'hide' );
} );
local = 0;
pushstream = new PushStream( { modes: 'websocket' } );
pushstream.addChannel( 'page' );
pushstream.connect();
pushstream.onmessage = function( data ) {
	if ( !local && location.search === '?p='+ data[0].p ) location.reload();
}
function pstream( page ) {
	return 'curl -s -X POST "http://localhost/pub?id=page" -d \'{ "p": "'+ page +'" }\'';
}
function resetlocal() {
	setTimeout( function() { local = 0 }, 1000 );
}
</script>
	<?php
	if ( $p === 'mpd' ) echo
'<script src="/assets/js/vendor/bootstrap-select-1.12.1.min.'.$time.'.js"></script>
 <script src="/assets/js/mpd.'.$time.'.js"></script>';
	if ( $p === 'network' ) echo
'<script src="/assets/js/vendor/jquery.qrcode.min.'.$time.'.js"></script>
 <script src="/assets/js/network.'.$time.'.js"></script>';
	if ( $p === 'sources' ) echo
'<script src="/assets/js/sources.'.$time.'.js"></script>';
	if ( $p === 'system' ) echo
'<script src="/assets/js/vendor/bootstrap-select-1.12.1.min.'.$time.'.js"></script>
 <script src="/assets/js/system.'.$time.'.js"></script>';
	?>

</body>
</html>
