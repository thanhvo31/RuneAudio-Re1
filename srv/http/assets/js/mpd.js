$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var mpdconf = '/etc/mpd.conf';
var restart = 'systemctl restart mpd';
$( '#audiooutput' ).change( function() {
	var $selected = $( this ).find( ':selected' );
	var name = $selected.val();
	var index = $selected.data( 'index' );
	var cmd = [
		  'redis-cli set audiooutput "'+ name +'"'
		, "sed -i 's/output_device = .*/output_device = \"hw:"+ index +"\";/' /etc/shairport-sync.conf"
		, 'systemctl try-restart shairport-sync'
	];
	var routecmd = $selected.data( 'routecmd' );
	if ( routecmd ) cmd.push( routecmd.replace( '*CARDID*', index ) );
	$.post( 'commands.php', { bash: cmd } );
} );
$( '#setting-audiooutput' ).click( function() {
	var $selected = $( '#audiooutput option:selected' );
	var sysname = $selected.val();
	info( {
		  icon     : 'mpd'
		, title    : 'Volume'
		, radio    : { Disable: 'none', Hardware: 'hardware', Software: 'software' }
		, checked  : $( '#audiooutput' ).data( 'mixertype' )
		, ok       : function() {
			var type = $( '#infoRadio input[ type=radio ]:checked' ).val();
			$.post( 'commands.php', { bash: [
				  "sed -i 's/mixer_type.*/mixer_type              \""+ type +"\"/' /etc/mpd.conf"
				, restart
			] } );
			$( '#audiooutput' ).data( 'mixertype', type )
		}
	} );
} );
$( '#dop' ).click( function() {
	$.post( 'commands.php', { bash: [
		  'redis-cli set dop '+ ( $( this ).prop( 'checked' ) ? 1 : 0 )
		, '/srv/http/settings/mpdconf.sh'
	] } );
} );
$( '#novolume' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		$.post( 'commands.php', { bash: [
			  "sed -i 's/volume_normalization.*/volume_normalization    \"no\"/' "+ mpdconf
			, 'mpc crossfade 0'
			, 'mpc replaygain off'
			, 'redis-cli set novolume 1'
			, '/srv/http/settings/mpdconf.sh'
		] } );
		$( '#crossfade, #normalization, #replaygain' ).prop( 'checked', 0 );
		$( '#crossfade' ).val( 0 );
		$( '#normalization' ).val( 'no' );
		$( '#replaygain' ).val( 'off' );
		$( '#volume, #setting-crossfade, #setting-replaygain' ).addClass( 'hide' );
	} else {
		$( '#volume' ).removeClass( 'hide' );
		$.post( 'commands.php', { bash: [
			  'redis-cli set novolume 0'
			, '/srv/http/settings/mpdconf.sh'
		] } );
	}
} );
$( '#crossfade' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var crossfade = 2;
		$( '#setting-crossfade' ).removeClass( 'hide' );
	} else {
		var crossfade = 0;
		$( '#setting-crossfade' ).addClass( 'hide' );
	}
	$( this ).val( crossfade );
	$.post( 'commands.php', { bash: 'mpc crossfade '+ crossfade } );
} );
$( '#setting-crossfade' ).click( function() {
	info( {
		  icon    : 'mpd'
		, title   : 'Crossfade'
		, message : 'Seconds:'
		, radio   : { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
		, checked : $( '#crossfade' ).val()
		, ok      : function() {
			var sec = $( '#infoRadio input[ type=radio ]:checked' ).val();
			$.post( 'commands.php', { bash: 'mpc crossfade '+ sec } );
			$( '#crossfade' ).val( sec );
		}
	} );
} );
$( '#normalization' ).click( function() {
	var yesno = $( this ).prop( 'checked' ) ? 'yes' : 'no';
	$.post( 'commands.php', { bash: [
		  "sed -i 's/volume_normalization.*/volume_normalization    \""+ yesno +"\"/' "+ mpdconf
		, restart
	] } );
} );
$( '#replaygain' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var replaygain = 'auto';
		$( '#setting-replaygain' ).removeClass( 'hide' );
	} else {
		var replaygain = 'off';
		$( '#setting-replaygain' ).addClass( 'hide' );
	}
	$( '#replaygain' ).data( 'replaygain', replaygain );
	$.post( 'commands.php', { bash: 'mpc replaygain '+ replaygain } );
} );
$( '#setting-replaygain' ).click( function() {
	info( {
		  icon      : 'mpd'
		, title     : 'Replay Gain'
		, radio     : { Auto: 'auto', Album: 'album', Track: 'track' }
		, checked   : $( '#replaygain' ).data( 'replaygain' )
		, ok        : function() {
			var replaygain = $( '#infoRadio input[ type=radio ]:checked' ).val();
			$( '#replaygain' ).data( 'replaygain', replaygain );
			$.post( 'commands.php', { bash: 'mpc replaygain '+ replaygain } );
		}
	} );
} );
$( '#autoupdate' ).click( function() {
	var yesno = $( this ).prop( 'checked' ) ? 'yes' : 'no';
	$.post( 'commands.php', { bash: [
		  "sed -i 's/^auto_update.*/auto_update             \""+ yesno +"\"/' "+ mpdconf
		, restart
	] } );
} );
$( '#ffmpeg' ).click( function() {
	var yesno = $( this ).prop( 'checked' ) ? 'yes' : 'no';
	$.post( 'commands.php', { bash: [
		  "sed -i '/ffmpeg/ {n;s/enabled.*/enabled            \""+ yesno +"\"/}' "+ mpdconf
		, restart
	] } );
} );
$( '#autoplay' ).click( function() {
	$.post( 'commands.php', { bash: 'redis-cli set mpd_autoplay '+ ( $( this ).prop( 'checked' ) ? 1 : 0 ) } );
} );
var pushstream = new PushStream( { modes: 'websocket' } );
pushstream.addChannel( 'notify' );
pushstream.connect();
pushstream.onmessage = function( data ) {
	if ( data[ 0 ].title === 'Audio Output Switched' ) location.reload();
}

} ); // document ready end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
