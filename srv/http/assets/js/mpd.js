$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var mpdconf = '/etc/mpd.conf';
var restart = 'systemctl restart mpd';
$( '#audiooutput' ).change( function() {
	var $selected = $( this ).find( ':selected' );
	var name = $selected.val();
	var index = $selected.data( 'index' );
	var subdevice = name.slice( -1 );
	var name0 = name.slice( 0, -2 );
	var routecmd = $selected.data( 'routecmd' );
	var cmd = [
		  'redis-cli set ao "'+ name +'"'
		, "sed -i 's/output_device = .*/output_device = \"hw:"+ index +"\";/' /etc/shairport-sync.conf"
		, 'systemctl try-restart shairport-sync'
	];
	if ( routecmd ) cmd.push( routecmd.replace( '*CARDID*', index ) );
	$.post( 'commands.php', { bash: cmd } );
} );
$( '#dop' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var cmd = [
			  "sed -i '/^\\s*name/ a\\\tdop               \"yes\"' "+ mpdconf
			, 'redis-cli set dop 1'
			, restart
		];
	} else {
		var cmd = [
			  "sed -i '/^\\s*dop/ d' "+ mpdconf
			, 'redis-cli set dop 0'
			, restart
		];
	}
	$.post( 'commands.php', { bash: cmd } );
} );
$( '#novolume' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		$.post( 'commands.php', { bash: [
			  'sed -i'
					+" -e 's/mixer_type.*/mixer_type        \"none\"/'"
					+" -e 's/replaygain.*/replaygain              \"off\"/'"
					+" -e 's/volume_normalization.*/volume_normalization    \"no\"/'"
					+' '+ mpdconf
			, 'mpc crossfade 0'
			, 'redis-cli set mixer_type none'
			, restart
		] } );
		$( '#mixertype, #crossfade, #normalization, #replaygain' ).prop( 'checked', 0 );
		$( '#mixertype' ).val( 'none' );
		$( '#crossfade' ).val( 0 );
		$( '#normalization' ).val( 'no' );
		$( '#replaygain' ).val( 'off' );
		$( '#volume, #setting-crossfade, #setting-replaygain' ).addClass( 'hide' );
	} else {
		$( '#mixertype' ).click();
		$( '#volume' ).removeClass( 'hide' );
	}
} );
$( '#mixertype' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var cmd = 'sed -i';
		$( '#audiooutput option' ).each( function() {
			$this = $( this );
			cmd += " -e '/"+ $this.val() +"/,/mixer_type/ s/mixer_type.*/mixer_type        \""+ $this.data( 'mixer' ) +"\"/'"
		} );
		cmd += ' '+ mpdconf;
		$.post( 'commands.php', { bash: [
			  cmd
			, 'redis-cli del mixer_type'
			, restart
		] } );
	} else {
		$.post( 'commands.php', { bash: [
			  "sed -i 's/mixer_type.*/mixer_type        \"none\"/' "+ mpdconf
			, 'redis-cli mixer_type none'
			, restart
		] } );
	}
} );
$( '#setting-mixertype' ).click( function() {
	info( {
		  icon     : 'mpd'
		, title    : 'Volume'
		, checkbox : { Software volume }
		, checked  : [ $( this ).val() === 'software' ? 0 : '' ]
		, ok      : function() {
			var sw = $( '#infoCheckBox input[ type=checkbox ]' ).prop( 'checked' ) ? 1 : 0;
			$.post( 'commands.php', { bash: [
				  ( cw ? 'redis-cli set mixer software' : 'redis-cli del mixer' )
				, '/srv/http/settings/mpdconf.sh'
				, restart
			] } );
			$( this ).val( sw );
		}
	} );
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

} ); // document ready end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
