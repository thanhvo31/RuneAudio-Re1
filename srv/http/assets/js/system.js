$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

$( '#hostname' ).click( function() {
	info( {
		  icon      : 'rune'
		, title     : 'Player Name'
		, textlabel : 'Name'
		, textvalue : $( '#hostname' ).val().replace( /[^a-zA-Z0-9]+/g, '_' )
		, ok        : function() {
			var hostname = $( '#infoTextBox' ).val();
			$( '#hostname' ).val( hostname );
			local = 1;
			$.post( 'commands.php', { bash: [
				  'hostname "'+ hostname +'"'
				, 'sed -i "s/^ssid=.*/ssid='+ hostname +'/" /etc/hostapd/hostapd.conf'
				, "sed -i 's/zeroconf_name.*/zeroconf_name           \""+ hostname +"\"/' /etc/mpd.conf"
				, 'sed -i "s/netbios name = .*/netbios name = '+ hostname +'/" /etc/samba/smb.conf'
				, 'sed -i "s/^friendlyname.*/friendlyname = '+ hostname +'/; s/^ohproductroom.*/ohproductroom = '+ hostname +'/" /etc/upmpdcli.conf'
				, 'rm /srv/http/.config/chromium/SingletonLock'
				, 'redis-cli set hostname "'+ hostname +'"'
				, 'systemctl try-restart hostapd mpd nmb smb shairport-sync upmpdcli'
				, pstream( 'system' )
			] }, resetlocal );
		}
	} );
} );
$( '#setting-ntp' ).click( function() {
	info( {
		  icon      : 'stopwatch'
		, title     : 'NTP Server'
		, textlabel : 'URL'
		, textvalue : $( '#ntpserver' ).text()
		, ok        : function() {
			var ntpserver = $( '#infoTextBox' ).val();
			$( '#ntpserver' ).text( ntpserver );
			local = 1;
			$.post( 'commands.php', { bash: [
				  "sed -i 's/^NTP=.*/NTP="+ ntpserver +"/' /etc/systemd/timesyncd.conf"
				, pstream( 'system' )
			] }, resetlocal );
		}
	} );
} );
$( '#timezone' ).change( function() {
	var timezone = $( this ).find( ':selected' ).val();
	$.post( 'commands.php', { bash: [ 
		  'timedatectl set-timezone '+ timezone
		, pstream( 'system' )
	] } );
	// no local = 1; > self reload
} );
$( 'body' ).on( 'click touchstart', function( e ) {
	if ( !$( e.target ).closest( '.i2s' ).length
		&& $( '#i2smodule option:selected' ).val() === 'none'
	) {
		$( '#divi2smodulesw' ).removeClass( 'hide' );
		$( '#divi2smodule' ).addClass( 'hide' );
	}
} );
$( '#i2smodulesw' ).click( function() {
	// delay to show sliding
	setTimeout( function() {
		$( '#divi2smodulesw' ).addClass( 'hide' );
		$( '#divi2smodule' ).removeClass( 'hide' );
		$( '#i2smodulesw' ).prop( 'checked', 0 );
	}, 200 );
} );
$( '#i2smodule' ).change( function() {
	var $selected = $( this ).find( ':selected' );
	var sysname = $selected.val();
	var name = $selected.text();
	if ( sysname !== 'none' ) {
		local = 1;
		$.post( 'commands.php', { bash: [
			  'sed -i'
					+" -e '/^dtoverlay/ d'"
					+" -e '/^#dtparam=i2s=on/ s/^#//'"
					+" -e 's/dtparam=audio=.*/dtparam=audio=off/'"
					+" -e '$ a\dtoverlay="+ sysname +"'"
					+' /boot/config.txt'
			, 'redis-cli mset reboot "Enable '+ name +'" i2sname "'+ name +'" i2ssysname '+ sysname
			, pstream( 'system' )
		] }, resetlocal );
		$( '#onboardaudio' ).prop( 'checked', 0 );
		$( '#divonboardaudio' ).removeClass( 'hide' );
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  'sed -i'
				+" -e '/^dtoverlay/ d'"
				+" -e '/^dtparam=i2s=on/ s/^/#/'"
				+" -e 's/dtparam=audio=.*/dtparam=audio=on/'"
				+' /boot/config.txt'
			, 'redis-cli set reboot "Disable I&#178;S Module"'
			, 'redis-cli del i2sname i2ssysname'
			, pstream( 'system' )
		] }, resetlocal );
		$( this ).addClass( 'hide' );
		$( '#divi2smodule, #divonboardaudio' ).addClass( 'hide' );
		$( '#divi2smodulesw' ).removeClass( 'hide' );
	}
} );
$( '#soundprofile' ).change( function() {
	if ( $( this ).prop( 'checked' ) ) {
		var profile = 'RuneAudio';
		$( '#setting-soundprofile' ).removeClass( 'hide' );
	} else {
		var profile = 'default';
		$( '#setting-soundprofile' ).addClass( 'hide' );
	}
	$( this ).val( profile );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'redis-cli set orionprofile '+ profile
		, '/srv/http/settings/soundprofile.sh '+ profile
		, pstream( 'system' )
	] }, resetlocal );
} );
$( '#setting-soundprofile' ).click( function() {
	info( {
		  icon    : 'mpd'
		, title   : 'Sound Profile'
		, radio   : { RuneAudio: 'RuneAudio', ACX: 'ACX', Orion: 'Orion', OrionV2: 'OrionV2', OrionV3: 'OrionV3', Um3ggh1U: 'Um3ggh1U' }
		, checked : $( '#soundprofile' ).val()
		, ok      : function() {
			var profile = $( '#infoRadio input[ type=radio ]:checked' ).val();
			$( '#soundprofile' ).val( profile );
			local = 1;
			$.post( 'commands.php', { bash: [
				  'redis-cli set orionprofile '+ profile
				, '/srv/http/settings/soundprofile.sh '+ profile
				, pstream( 'system' )
			] }, resetlocal );
		}
	} );
} );
$( '#onboardaudio' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i 's/dtparam=audio=.*/dtparam=audio=on/' /boot/config.txt"
			, "redis-cli set reboot 'Enable on-board audio'"
			, pstream( 'system' )
		] }, resetlocal );
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i 's/dtparam=audio=.*/dtparam=audio=off/' /boot/config.txt"
			, '/srv/http/settings/mpdconf.sh'
			, "redis-cli set reboot 'Disable on-board audio'"
			, pstream( 'system' )
		] }, resetlocal );
	}
} );
$( '#bluetooth' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i '/dtoverlay=pi3-disable-bt/ s/^/#/' /boot/config.txt"
			, 'systemctl enable brcm43438'
			, 'redis-cli set reboot "Enable on-board Bluetooth"'
			, pstream( 'system' )
		] }, resetlocal );
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i '/^#dtoverlay=pi3-disable-bt/ s/^#//' /boot/config.txt"
			, 'systemctl disable --now brcm43438'
			, 'redis-cli set reboot "Disable on-board Bluetooth"'
			, pstream( 'system' )
		] }, resetlocal );
	}
} );
$( '#wlan' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i '/^dtoverlay=pi3-disable-wifi/ s/^/#/' /boot/config.txt"
			, 'systemctl enable netctl-auto@wlan0'
			, 'redis-cli set reboot "Enable on-board Wi-Fi"'
			, pstream( 'network' )
			, pstream( 'system' )
		] }, resetlocal );
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  "sed -i '/^#dtoverlay=pi3-disable-wifi/ s/^#//' /boot/config.txt"
			, 'systemctl disable --now netctl-auto@wlan0'
			, 'ifconfig wlan0 down'
			, 'redis-cli set reboot "Disable on-board Wi-Fi"'
			, pstream( 'network' )
			, pstream( 'system' )
		] }, resetlocal );
		$( '#accesspoint' ).prop( 'checked', 0 );
	}
} );
$( '#accesspoint' ).click( function() {
	$this = $( this );
	if ( $( this ).prop( 'checked' ) ) {
		if ( !$( '#wlan' ).prop( 'checked' ) ) {
			local = 1;
			$.post( 'commands.php', { bash: [
				  "sed -i '/^dtoverlay=pi3-disable-wifi/ s/^/#/' /boot/config.txt"
				, 'systemctl enable hostapd dnsmasq'
				, 'redis-cli set reboot "Enable RPi access point"'
				, pstream( 'network' )
				, pstream( 'system' )
			] }, resetlocal );
			$( '#wlan' ).prop( 'checked', 1 );
		} else {
			local = 1;
			$.post( 'commands.php', { bash: [
				  'ifconfig wlan0 '+ $( '#ipwebuiap' ).text()
				, 'systemctl enable --now hostapd dnsmasq'
				, 'systemctl disable --now netctl-auto@wlan0'
				, 'netctl stop-all'
				, pstream( 'network' )
				, pstream( 'system' )
			] }, function() {
				location.href = 'indexsettings.php?p=network';
			} );
		}
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  'systemctl disable --now hostapd dnsmasq'
			, 'ifconfig wlan0 0.0.0.0'
			, pstream( 'network' )
			, pstream( 'system' )
		] }, resetlocal )
		$( '#settings-accesspoint' ).addClass( 'hide' );
	}
} );
$( '#settings-accesspoint' ).click( function() {
	info( {
		  icon    : 'network'
		, title   : 'Access Point Settings'
		, textlabel : [ 'Password', 'IP' ]
		, textvalue : [ $( '#accesspoint' ).data( 'passphrase' ), $( '#accesspoint' ).data( 'ip' ) ]
		, textrequired : [ 0, 1 ]
		, ok      : function() {
			var passphrase = $( '#infoTextBox' ).val();
			if ( passphrase && passphrase.length < 8 ) {
				info( 'Password must be at least 8 characters.' );
				return
			}
			
			var ip = $( '#infoTextBox1' ).val();
			var ips = ip.split( '.' );
			var ip3 = ips.pop();
			var ip012 = ips.join( '.' );
			var iprange = ip012 +'.'+ ( +ip3 + 1 ) +','+ ip012 +'.254,24h';
			var values = '"'+ passphrase +'" '+ ip +' '+ iprange;
			local = 1;
			$.post( 'commands.php', { bash: [
					  '/srv/http/settings/networkaccesspoint.sh '+ values
					, pstream( 'network' )
					, pstream( 'system' )
				] }, function() {
				location.href = 'indexsettings.php?p=network';
			} );
		}
	} );
} );
$( '#airplay' ).click( function() {
	var O = getCheck( $( this ) );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'systemctl '+ O.enabledisable +' --now shairport-sync shairport-meta'
		, pstream( 'system' )
	] }, resetlocal );
} );
$( '#localbrowser' ).click( function() {
	var O = getCheck( $( this ) );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'systemctl '+ O.enabledisable +' --now local-browser'
		, pstream( 'system' )
	] }, resetlocal );
	$( '#setting-localbrowser' ).toggleClass( 'hide', !O.onezero );
} );
$( '#setting-localbrowser' ).click( function() {
	var html = heredoc( function() { /*
		<div id="infoText" class="infocontent">
			<div id="infotextlabel">
				<a class="infolabel">
					Screen off <gr>(min)</gr><br>
					Zoom <gr>(0.5-2.0)</gr>
				</a>
			</div>
			<div id="infotextbox">
				<input type="text" class="infoinput" id="infoTextBox" spellcheck="false" style="width: 60px; text-align: center">
				<input type="text" class="infoinput" id="infoTextBox1" spellcheck="false" style="width: 60px; text-align: center">
			</div>
		</div>
		<hr>
		Screen rotation<br>
		<div id="infoRadio" class="infocontent infohtml" style="text-align: center">
			&nbsp;0°<br>
			<label><input type="radio" name="inforadio" value="NORMAL"></label><br>
			<label>90°&ensp;<i class="fa fa-undo"></i>&emsp;<input type="radio" name="inforadio" value="CCW"></label>&emsp;&emsp;&ensp;
			<label><input type="radio" name="inforadio" value="CW"> <i class="fa fa-redo"></i>&ensp;90°&nbsp;</label><br>
			<label><input type="radio" name="inforadio" value="UD"></label><br>
			&nbsp;180°
		</div>
		<hr>
		<div id="infoCheckBox" class="infocontent infohtml">
			<label><input type="checkbox">&ensp;Mouse pointer</label><br>
			<label><input type="checkbox">&ensp;Overscan <gr>(Reboot needed.)</gr></label>
		</div>
	*/ } );
	info( {
		  icon    : 'chromium'
		, title   : 'Browser on RPi'
		, content : html
		, preshow : function() {
			$( '#infoTextBox1' ).val( $( '#localbrowser' ).data( 'zoom' ) );
			$( '#infoTextBox' ).val( $( '#localbrowser' ).data( 'screenoff' ) );
			$( '#infoRadio input[value='+ $( '#localbrowser' ).data( 'rotate' ) +']' ).prop( 'checked', true )
			$( '#infoCheckBox input:eq( 0 )' ).prop( 'checked', $( '#localbrowser' ).data( 'cursor' ) );
			$( '#infoCheckBox input:eq( 1 )' ).prop( 'checked', $( '#localbrowser' ).data( 'overscan' ) );
		}
		, ok      : function() {
			var screenoff = $( '#infoTextBox' ).val();
			$( '#localbrowser' ).data( 'screenoff', screenoff );
			var zoom = parseFloat( $( '#infoTextBox1' ).val() ) || 1;
			zoom = zoom < 2 ? ( zoom < 0.5 ? 0.5 : zoom ) : 2;
			$( '#localbrowser' ).data( 'zoom', zoom );
			var cursor = $( '#infoCheckBox input:eq( 0 )' ).prop( 'checked' ) ? 1 : 0;
			$( '#localbrowser' ).data( 'cursor', cursor );
			var rotate = $( '#infoRadio input[ type=radio ]:checked' ).val();
			$( '#localbrowser' ).data( 'rotate', rotate );
			var overscan = $( '#infoCheckBox input:eq( 1 )' ).prop( 'checked' ) ? 1 : 0;
			$( '#localbrowser' ).data( 'overscan', overscan );
			$( '#localbrowser' ).data( 'zoom', zoom ).data( 'screenoff', screenoff ).data( 'cursor', cursor ).data( 'rotate', rotate );
			var cmdzoomcursor = 'sed -i "s/-use_cursor.*/-use_cursor '+ ( cursor == 1 ? 'yes \\&' : 'no \\&' ) +'/; s/factor=.*/factor='+ zoom +'/"';
			if ( rotate === 'NORMAL' ) {
				var cmdrotate = 'rm /etc/X11/xorg.conf.d/99-raspi-rotate.conf';
			} else {
				var matrix = {
					  CW     : '0 1 0 -1 0 1 0 0 1'
					, CCW    : '0 -1 1 1 0 0 0 0 1'
					, UD     : '-1 0 1 0 -1 1 0 0 1'
				}
				var rotatecontent = heredoc( function() { /*
Section "Device"
	Identifier "RpiFB"
	Driver "fbdev"
	Option "rotate" "ROTATION_SETTING"
EndSection

Section "InputClass"
	Identifier "Touchscreen"
	Driver "libinput"
	MatchIsTouchscreen "on"
	MatchDevicePath "/dev/input/event*"
	Option "calibrationmatrix" "MATRIX_SETTING"
EndSection

Section "Monitor"
	Identifier "generic"
EndSection

Section "Screen"
	Identifier "screen1"
	Device "RpiFB"
	Monitor "generic"
EndSection

Section "ServerLayout"
	Identifier "slayo1"
	Screen "screen1"
EndSection
*/ } );
				rotatecontent = rotatecontent.replace( 'ROTATION_SETTING', rotate ).replace( 'MATRIX_SETTING', matrix[ rotate ] );
				var cmdrotate = "echo '"+ rotatecontent +"' > /etc/X11/xorg.conf.d/99-raspi-rotate.conf";
			}
			if ( overscan ) {
				var cmdoverscan = "sed -i '/^disable_overscan=1/ s/^/#/' /boot/config.txt";
			} else {
				var cmdoverscan = "sed -i '/^#disable_overscan=1/ s/^#//' /boot/config.txt";
			}
			local = 1;
			$.post( 'commands.php', { bash: [
				  cmdzoomcursor +' /etc/X11/xinit/xinitrc'
				, "sed -i 's/xset dpms .*/xset dpms 0 0 "+ ( screenoff * 60 ) +" \\\&/' /etc/X11/xinit/xinitrc"
				, cmdrotate
				, cmdoverscan
				, 'ln -sf /srv/http/assets/img/'+ rotate +'.png /usr/share/bootsplash/start.png'
				, 'systemctl try-restart local-browser'
				, pstream( 'system' )
			] }, resetlocal );
			notify( 'Browser on RPi', 'Restarting ...', 'chromium', 10000 );
		}
	} );
} );
$( '#password' ).click( function() {
	if ( $( this ).prop( 'checked' ) ) {
		local = 1;
		$.post( 'commands.php', { bash: [
			  'redis-cli set pwd_protection 1'
			, "sed -i 's/bind_to_address.*/bind_to_address         \"localhost\"/' /etc/mpd.conf"
			, pstream( 'system' )
		] }, resetlocal );
		$( '#setting-password' ).removeClass( 'hide' );
		if ( $( this ).data( 'default' ) ) {
			info( {
				  icon    : 'lock'
				, title   : 'Password'
				, message : 'Default password is <wh>rune</wh>'
			} );
		}
	} else {
		local = 1;
		$.post( 'commands.php', { bash: [
			  'redis-cli set pwd_protection 0'
			, "sed -i 's/bind_to_address.*/bind_to_address         \"any\"/' /etc/mpd.conf"
			, pstream( 'system' )
		] }, resetlocal );
		$( '#setting-password' ).addClass( 'hide' );
	}
} );
$( '#setting-password' ).click( function() {
	info( {
		  icon          : 'lock'
		, title         : 'Change Password'
		, passwordlabel : [ 'Existing', 'New' ]
		, ok            : function() {
			$.post( 'commands.php', { login: $( '#infoPasswordBox' ).val(), pwdnew: $( '#infoPasswordBox1' ).val() }, function( data ) {
				info( {
					  icon    : 'lock'
					, title   : 'Change Password'
					, nox     : 1
					, message : ( data ? 'Password changed' : 'Wrong existing password' )
				} );
			} );
		}
	} );
} );
$( '#samba' ).click( function() {
	var O = getCheck( $( this ) );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'systemctl '+ O.enabledisable +' --now nmb smb'
		, pstream( 'system' )
	] }, resetlocal );
	$( '#setting-samba' ).toggleClass( 'hide', !O.onezero );
} );
$( '#setting-samba' ).click( function() {
	info( {
		  icon     : 'network'
		, title    : 'Samba File Sharing'
		, message  : 'Enable <wh>write</wh> permission:'
		, checkbox : { 'USB: /mnt/MPD/USB': 1, 'SD:&emsp;/mnt/MPD/LocalStorage': 1 }
		, preshow  : function() {
			if ( $( '#samba' ).data( 'usb' ) ) $( '#infoCheckBox input:eq( 0 )' ).prop( 'checked', 1 );
			if ( $( '#samba' ).data( 'sd' ) ) $( '#infoCheckBox input:eq( 1 )' ).prop( 'checked', 1 );
		}
		, ok       : function() {
			var cmd = "sed -i -e '/read only = no/ d'";
			if ( $( '#infoCheckBox input:eq( 0 )' ).prop( 'checked' ) ) {
				cmd += " -e '/path = .*USB/ a\\\\tread only = no'";
				$( '#samba' ).data( 'usb', 1 );
			} else {
				$( '#samba' ).data( 'usb', 0 );
			}
			if ( $( '#infoCheckBox input:eq( 1 )' ).prop( 'checked' ) ) {
				cmd += " -e '/path = .*LocalStorage/ a\\\\tread only = no'";
				$( '#samba' ).data( 'sd', 1 );
			} else {
				$( '#samba' ).data( 'sd', 0 );
			}
			local = 1;
			$.post( 'commands.php', { bash: [
				  cmd +' /etc/samba/smb.conf'
				, 'systemctl try-restart nmb smb'
				, pstream( 'system' )
			] }, resetlocal );
		}
	} );
} );
$( '#dlna' ).click( function() {
	var O = getCheck( $( this ) );
	local = 1;
	$.post( 'commands.php', { bash: [
		  'systemctl '+ O.enabledisable +' --now upmpdcli'
		, pstream( 'system' )
	] }, resetlocal );
	$( '#setting-dlna' ).toggleClass( 'hide', !O.onezero );
} );
$( '#setting-dlna' ).click( function() {
	var json = {
		  icon     : 'dlna'
		, title    : 'DLNA'
		, checkbox : { 'Clear Playlist before play': 1 }
		, ok       : function() {
			var checked = $( '#infoCheckBox input' ).prop( 'checked' ) ? 1 : 0;
			local = 1;
			$.post( 'commands.php', { bash: [
				  "sed -i 's/^ownqueue.*/ownqueue = "+ checked +"/' /etc/upmpdcli.conf"
				, 'systemctl try-restart upmpdcli'
				, pstream( 'system' )
			] }, resetlocal );
			$( '#dlna' ).val( checked );
		}
	}
	if ( $( '#dlna' ).val() == 1 ) json.checked = [ 0 ];
	info( json );
} );

function getCheck( $this ) {
	var O = {};
	if ( $this.prop( 'checked' ) ) {
		O.startstop = 'start';
		O.enabledisable = 'enable';
		O.onezero = 1;
	} else {
		O.startstop = 'stop';
		O.enabledisable = 'disable';
		O.onezero = 0;
	}
	return O
}

} ); // document ready end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
