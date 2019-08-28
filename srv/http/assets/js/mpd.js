$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var restartmpd = 'systemctl restart mpd';
var setmpdconf = '/srv/http/settings/mpdconf.sh';
function warning( dB ) {
	return '<wh><i class="fa fa-warning fa-lg"></i>&ensp;Lower amplifier volume</wh>'
		  +'<br><br>Signal level will be set to full amplitude:'
		  +'<br><wh>from '+ dB +'dB to 0dB</wh>'
		  +'<br>Too high volume can damage speakers and ears';
}
function setMixerType( mixertype ) {
	local = 1;
	$.post( 'commands.php', { bash: [
		  "sed -i 's/mixer_type.*/mixer_type              \""+ mixertype +"\"/' /etc/mpd.conf"
		, setmpdconf
		, pstream( 'mpd' )
	] }, resetlocal );
	$( '#audiooutput' ).data( 'mixertype', mixertype );
	if ( mixertype === 'none' ) {
		$( '#audiooutput option' ).data( 'db', 0 );
		if ( !$( '#crossfade, #normalization, #replaygain' ).prop( 'checked' ) ) {
			$( '#nosoftware' ).data( 'nosoftware', 1 ).prop( 'checked', 1 );
			$( '#volume' ).addClass( 'hide' );
		}
	} else {
		$( '#nosoftware' ).data( 'nosoftware', 0 ).prop( 'checked', 0 );
		$( '#volume' ).removeClass( 'hide' );
	}
}
function setNoSoftware() {
	local = 1;
	$.post( 'commands.php', { bash: [
		  "sed -i -e 's/mixer_type.*/mixer_type              \"none\"/'"
		 +" -e 's/volume_normalization.*/volume_normalization    \"no\"/' /etc/mpd.conf"
		, 'mpc crossfade 0'
		, 'mpc replaygain off'
		, setmpdconf
		, pstream( 'mpd' )
	] }, resetlocal );
	$( '#crossfade, #normalization, #replaygain' ).prop( 'checked', 0 );
	$( '#crossfade' ).val( 0 );
	$( '#normalization' ).val( 'no' );
	$( '#replaygain' ).val( 'off' );
	$( '#volume, #setting-crossfade, #setting-replaygain' ).addClass( 'hide' );
	$( '#nosoftware' ).data( 'nosoftware', 1 );
	$( '#audiooutput' ).data( 'mixertype', 'none' );
}
$( '#audiooutput' ).change( function() {
	var $selected = $( this ).find( ':selected' );
	var name = $selected.val();
	var index = $selected.data( 'index' );
	var cmd = [
		  'redis-cli set audiooutput "'+ name +'"'
		, "sed -i 's/output_device = .*/output_device = \"hw:"+ index +"\";/' /etc/shairport-sync.conf"
		, 'systemctl try-restart shairport-sync'
		, pstream( 'mpd' )
	];
	var routecmd = $selected.data( 'routecmd' );
	if ( routecmd ) cmd.push( routecmd.replace( '*CARDID*', index ) );
	local = 1;
	$.post( 'commands.php', { bash: cmd }, resetlocal );
} );
$( '#setting-audiooutput' ).click( function() {
	var dB = $( '#audiooutput option:selected' ).data( 'db' );
	info( {
		  icon     : 'mpd'
		, title    : 'Volume Level Control'
		, radio    : { 'Disable': 'none', 'DAC hardware': 'hardware', 'MPD Software': 'software' }
		, checked  : $( '#audiooutput' ).data( 'mixertype' )
		, ok       : function() {
			var mixertype = $( '#infoRadio input[ type=radio ]:checked' ).val();
			if ( mixertype === 'none' && dB < 0 ) {
				info( {
					  icon    : 'volume'
					, title   : 'Volume Level'
					, message : warning( dB )
					, ok      : function() {
						setMixerType( mixertype );
					}
				} );
			} else {
				setMixerType( mixertype );
			}
		}
	} );
} );
$( '#dop' ).click( function() {
	local = 1;
	$.post( 'commands.php', { bash: [
		  'redis-cli set dop '+ ( $( this ).prop( 'checked' ) ? 1 : 0 )
		, setmpdconf
		, pstream( 'mpd' )
	] }, resetlocal );
} );
$( '#nosoftware' ).click( function() {
	var $this = $( this );
	var nosoftware = $this.data( 'nosoftware' );
	var dB = $( '#audiooutput option:selected' ).data( 'db' );
	if ( $this.prop( 'checked' ) && !nosoftware ) {
		if ( dB < 0 ) {
			info( {
				  icon    : 'volume'
				, title   : 'Volume Level'
				, message : warning( dB )
				, ok      : setNoSoftware
			} );
		} else {
			setNoSoftware();
		}
	} else {
		$( '#volume' ).toggleClass( 'hide' );
	}
} );
$( '#crossfade' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var crossfade = 2;
		$( '#setting-crossfade' ).removeClass( 'hide' );
		$( '#nosoftware' ).data( 'nosoftware', 0 ).prop( 'checked', 0 );
	} else {
		var crossfade = 0;
		$( '#setting-crossfade' ).addClass( 'hide' );
	}
	$( this ).val( crossfade );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'mpc crossfade '+ crossfade
		, pstream( 'mpd' )
	] }, resetlocal );
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
			local = 1;
			$.post( 'commands.php', { bash: [
				  'mpc crossfade '+ sec
				, pstream( 'mpd' )
			] }, resetlocal );
			$( '#crossfade' ).val( sec );
		}
	} );
} );
$( '#normalization' ).click( function() {
	var checked = $( this ).prop( 'checked' ) ? 1 : 0;
	local = 1;
	$.post( 'commands.php', { bash: [
		  "sed -i 's/volume_normalization.*/volume_normalization    \""+ ( checked ? 'yes' : 'no' ) +"\"/' /etc/mpd.conf"
		, restartmpd
		, pstream( 'mpd' )
	] }, resetlocal );
	if ( checked ) $( '#nosoftware' ).data( 'nosoftware', 0 ).prop( 'checked', 0 );
} );
$( '#replaygain' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var replaygain = 'auto';
		$( '#setting-replaygain' ).removeClass( 'hide' );
				$( '#nosoftware' ).data( 'nosoftware', 0 ).prop( 'checked', 0 );
	} else {
		var replaygain = 'off';
		$( '#setting-replaygain' ).addClass( 'hide' );
	}
	$( '#replaygain' ).data( 'replaygain', replaygain );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'mpc replaygain '+ replaygain
		, pstream( 'mpd' )
	] }, resetlocal );
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
			local = 1;
			$.post( 'commands.php', { bash: [
				  'mpc replaygain '+ replaygain
				, pstream( 'mpd' )
			] }, resetlocal );
		}
	} );
} );
$( '#autoupdate' ).click( function() {
	var yesno = $( this ).prop( 'checked' ) ? 'yes' : 'no';
	local = 1;
	$.post( 'commands.php', { bash: [
		  "sed -i 's/^auto_update.*/auto_update             \""+ yesno +"\"/' /etc/mpd.conf"
		, restartmpd
		, pstream( 'mpd' )
	] }, resetlocal );
} );
$( '#ffmpeg' ).click( function() {
	var yesno = $( this ).prop( 'checked' ) ? 'yes' : 'no';
	local = 1;
	$.post( 'commands.php', { bash: [
		  "sed -i '/ffmpeg/ {n;s/enabled.*/enabled            \""+ yesno +"\"/}' /etc/mpd.conf"
		, restartmpd
		, pstream( 'mpd' )
	] }, resetlocal );
} );
$( '#autoplay' ).click( function() {
	local = 1;
	$.post( 'commands.php', { bash: [
		 'redis-cli set mpd_autoplay '+ ( $( this ).prop( 'checked' ) ? 1 : 0 )
		, pstream( 'mpd' )
	] }, resetlocal );
} );

} ); // document ready end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
