#!/usr/bin/php

<?php
$metadata = fopen( '/tmp/shairport-sync-metadata', 'r' );
$code = '';
while ( 1 ) {
	$lines = fgets( $metadata );
	$line = strtok( $lines, "\n" ); //////////
	
	while ( $line ) {
		if ( strpos( $line, '61736172' ) ) {
			$code = 'Artist';
		} else if ( strpos( $line, '6d696e6d' ) ) {
			$code = 'Title';
		} else if ( strpos( $line, '6173616c' ) ) {
			$code = 'Album';
		} else if ( strpos( $line, '50494354' ) ) {
			$code = 'coverart';
		}
		if ( $code && strpos( $line, '</data></item>' ) ) {
			$data = str_replace( '</data></item>', '', $line );
			if ( $code === 'coverart' ) {
				exec( '/usr/bin/sudo /usr/bin/echo "data:image/jpeg;base64,'.$data.'" > /srv/http/assets/img/airplaycoverart' );
			} else {
				exec( '/usr/bin/sudo /usr/bin/redis-cli hset airplaymeta '.$code.' "'.base64_decode( $data ).'"' );
				if ( $code === 'Title' ) exec( "/usr/bin/sudo /usr/bin/curl -s -X POST 'http://localhost/pub?id=airplay' -d 2" );
			}
			$code = '';
		}
		
		$line = strtok( "\n" ); //////////
	}
}
