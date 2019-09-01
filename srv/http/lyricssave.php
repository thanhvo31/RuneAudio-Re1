<?php
$artist = $_POST[ 'artist' ];
$song = $_POST[ 'song' ];
$filelyrics = '/srv/http/assets/img/lyrics/'.strtolower( $artist.' - '.$song ).'.txt';

if ( isset( $_POST[ 'delete' ] ) ) {
	echo unlink( $filelyrics );
} else {
	$filelyrics = fopen( $filelyrics, 'w' );
	echo fwrite( $filelyrics, $_POST[ 'lyrics' ] );
	fclose( $filelyrics );
}
