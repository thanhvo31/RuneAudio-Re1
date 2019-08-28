<?php
$redis = new Redis(); 
$redis->pconnect( '127.0.0.1' );

$sudo = '/usr/bin/sudo /usr/bin/';
$statusonly = isset( $_POST[ 'statusonly' ] );
if ( !$statusonly ) {
	if ( exec( "$sudo/systemctl is-active mpd" ) === 'active' ) {
		$activePlayer = 'MPD';
	} else if ( exec( "$sudo/systemctl is-active shairport-sync" ) === 'active' ) {
		$activePlayer = 'AirPlay';
	}
	$status[ 'activePlayer' ] = $activePlayer;
	$status[ 'volumemute' ] = $redis->hGet( 'display', 'volumemute' );
	$status[ 'volumempd' ] = exec( "$sudo/grep mixer_type /etc/mpd.conf | cut -d'\"' -f2" );
	if ( $activePlayer === 'AirPlay' ) {
		$status[ 'Artist'] = $redis->hGet( 'airplaymeta', 'Artist' );
		$status[ 'Title'] = $redis->hGet( 'airplaymeta', 'Title' );
		$status[ 'Album'] = $redis->hGet( 'airplaymeta', 'Album' );
		$status[ 'sampling'] = '16 bit • 44.1 kHz 1.41 Mbit/s';
		$status[ 'ext'] = 'AirPlay';
		$file = '/srv/http/assets/img/airplaycoverart';
		if ( file_exists( $file ) ) $status[ 'coverart' ] = file_get_contents( $file );
		echo json_encode( $status, JSON_NUMERIC_CHECK );
		exit();
	}
}

// grep cannot be used here
$mpdtelnet = ' | telnet localhost 6600 | sed "/^Trying\|^Connected\|^Escape\|^OK\|^Connection\|^Date\|^Last-Modified\|^mixrampdb\|^nextsong\|^nextsongid/ d"';
$lines = shell_exec( '{ sleep 0.05; echo clearerror; echo status; echo currentsong; sleep 0.05; }'.$mpdtelnet );
// fix: initially add song without play - currentsong = (blank)
if ( strpos( $lines, 'file:' ) === false ) $lines = shell_exec( '{ sleep 0.05; echo status; echo playlistinfo 0; sleep 0.05; }'.$mpdtelnet );

$line = strtok( $lines, "\n" );
while ( $line !== false ) {
	$pair = explode( ': ', $line, 2 );
	$key = $pair[ 0 ];
	$val = $pair[ 1 ];
	if ( $key === 'elapsed' ) {
		$status[ $key ] = round( $val );
	} else if ( $key === 'bitrate' ) {
		$status[ $key ] = $val * 1000;
	} else if ( $key === 'audio' ) {
		$audio = explode( ':', $val );
		$status[ 'bitdepth' ] = $audio[ 1 ];
		$status[ 'samplerate' ] = $audio[ 0 ];
	} else {
		$status[ $key ] = trim( $val );
	}
	$line = strtok( "\n" );
}
$status[ 'song' ] = $status[ 'song' ] ?: 0;
$status[ 'updating_db' ] = $status[ 'updating_db' ] ? 1 : 0;
$status[ 'librandom' ] = exec( "$sudo/systemctl is-active libraryrandom" ) === 'active' ? 1 : 0;

if ( $status[ 'file' ] ) {
	$statusfile = $status[ 'file' ];
	$file = '/mnt/MPD/'.$statusfile;
	$pathinfo = pathinfo( $file );
	$ext = strtoupper( $pathinfo[ 'extension' ] );
	$status[ 'ext' ] = ( substr( $statusfile, 0, 4 ) !== 'http' ) ? $ext : 'radio';
	$radio = $status[ 'ext' ] === 'radio';
	if ( !$radio ) {
		// missing id3tags
		if ( empty( $status[ 'Artist' ] ) ) $status[ 'Artist' ] = end( explode( '/', $pathinfo[ 'dirname' ] ) );
		if ( empty( $status[ 'Title' ] ) ) $status[ 'Title' ] = $pathinfo[ 'filename' ];
		if ( empty( $status[ 'Album' ] ) ) $status[ 'Album' ] = '';
	} else {
		// before webradios play: no 'Name:' - use station name from file instead
		if ( isset( $status[ 'Name' ] ) ) {
			$status[ 'Artist' ] = $status[ 'Name' ];
		} else {
			$urlname = str_replace( '/', '|', $statusfile );
			$webradiofile = "/srv/http/assets/img/webradios/$urlname";
			if ( !file_exists( $webradiofile ) ) $webradiofile = "/srv/http/assets/img/webradiopl/$urlname";
			$status[ 'Artist' ] = file( $webradiofile )[ 0 ];
		}
		$status[ 'Title' ] = ( $status[ 'state' ] === 'stop' ) ? '' : $status[ 'Title' ];
		$status[ 'Album' ] = $statusfile;
		$status[ 'time' ] = '';
	}
}

$previousartist = isset( $_POST[ 'artist' ] ) ? $_POST[ 'artist' ] : '';
$previousalbum = isset( $_POST[ 'album' ] ) ? $_POST[ 'album' ] : '';
if ( $statusonly
	|| !$status[ 'playlistlength' ]
	|| ( $status[ 'Artist' ] === $previousartist && $status[ 'Album' ] === $previousalbum )
	&& !$radio
) {
	$status[ 'updatestart' ] = $redis->get( 'updatestart' ) ?: 0;
	echo json_encode( $status, JSON_NUMERIC_CHECK );
	exit();
}

// coverart
if ( !$radio && $activePlayer === 'MPD' ) {
	$status[ 'coverartfile' ] = $file;
	$status[ 'coverart' ] = shell_exec( '/srv/http/getcover.sh "'.$file.'"' );
} else if ( $radio ) {
	$status[ 'coverart' ] = 0;
	$filename = str_replace( '/', '|', $statusfile );
	$file = "/srv/http/assets/img/webradios/$filename";
	if ( !file_exists( $file ) ) $file = "/srv/http/assets/img/webradiopl/$filename";
	if ( file_exists( $file ) ) {
		$content = explode( "\n", trim( file_get_contents( $file ) ) );
		$status[ 'coverart' ] = $content[ 2 ];
	}
}

$name = $status[ 'Artist' ]; // webradioname
if ( $status[ 'state' ] === 'play' ) {
	if ( $radio ) {
		$bitdepth = '';
	} else if ( $ext === 'DSF' || $ext === 'DFF' ) {
		$bitdepth = 'dsd';
	} else {
		$bitdepth = $status[ 'bitdepth' ];
	}
	$sampling = samplingline( $bitdepth, $status[ 'samplerate' ], $status[ 'bitrate' ] );
	$status[ 'sampling' ] = $sampling;
	echo json_encode( $status, JSON_NUMERIC_CHECK );
	// save only webradio: update sampling database on each play
	if ( $radio ) $redis->hSet( 'sampling', $name, $sampling );
	exec( "$sudo/systemctl ".( $radio ? 'start' : 'stop' ).' radiowatchdog' );
	exit();
}
exec( "$sudo/systemctl stop radiowatchdog" );

// state: stop / pause >>>>>>>>>>
// webradio
if ( $radio ) {
	$sampling = $redis->hGet( 'sampling', $name );
	$status[ 'sampling' ] = $sampling ? $sampling : '&nbsp;';
	echo json_encode( $status, JSON_NUMERIC_CHECK );
	exit();
}

// while stop no mpd info
if ( $ext === 'DSF' || $ext === 'DFF' ) {
	// DSF: byte# 56+4 ? DSF: byte# 60+4
	$byte = ( $ext === 'DSF' ) ? 56 : 60;
	exec( '/usr/bin/hexdump -x -s'.$byte.' -n4 "'.$file.'"', $bin );
	$hex = preg_replace( '/ +/', ' ', $bin[ 0 ] );
	$hex = explode( ' ', $hex );
	$bitrate = hexdec(  $hex[ 2 ].$hex[ 1 ] );
	$dsd = round( $bitrate / 44100 );
	$bitrate = round( $bitrate / 1000000, 2 );
	$sampling = 'DSD'.$dsd.' • '.$bitrate.' Mbit/s';
} else {
	$data = shell_exec( '/usr/bin/ffprobe -v quiet -select_streams a:0 -show_entries stream=bits_per_raw_sample,sample_rate -show_entries format=bit_rate -of default=noprint_wrappers=1:nokey=1 "'.$file.'"' );
	$data = explode( "\n", $data );
	$bitdepth = $data[ 1 ];
	$samplerate = $data[ 0 ];
	$bitrate = $data[ 2 ];
	$sampling = $bitrate ? samplingline( $bitdepth, $samplerate, $bitrate ) : '';
}
$status[ 'sampling' ] = $sampling;
$elapsed = exec( '{ sleep 0.01; echo status; sleep 0.01; } | telnet localhost 6600 | grep elapsed | cut -d" " -f2' );
$status[ 'elapsed' ] = round( $elapsed ); // refetch after coverart fetch

echo json_encode( $status, JSON_NUMERIC_CHECK );

function samplingline( $bitdepth, $samplerate, $bitrate ) {
	if ( $bitdepth === 'N/A' ) {
		$bitdepth = ( $ext === 'WAV' || $ext === 'AIFF' ) ? ( $bitrate / $samplerate / 2 ).' bit ' : '';
	} else {
		if ( $bitdepth === 'dsd' ) {
			$dsd = round( $bitrate / 44100 );
			$bitrate = round( $bitrate / 1000000, 2 );
			return 'DSD'.$dsd.' • '.$bitrate.' Mbit/s';
		} else if ( $ext === 'MP3' || $ext === 'AAC' ) { // lossy has no bitdepth
			$bitdepth = '';
		} else {
			$bitdepth = $bitdepth ? $bitdepth.' bit ' : '';
		}
	}
	if ( !$bitrate ) $bitrate = 2 * $bitdepth * $samplerate;
	if ( $bitrate < 1000000 ) {
		$bitrate = round( $bitrate / 1000 ).' kbit/s';
	} else {
		$bitrate = round( $bitrate / 1000000, 2 ).' Mbit/s';
	}
	$samplerate = round( $samplerate / 1000, 1 ).' kHz ';
	return $bitdepth.$samplerate.$bitrate;
}
