$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var intervalscan;
var wlcurrent = '';
var wlconnected = '';

nicsStatus();

$( '#back' ).click( function() {
	wlcurrent = '';
	clearInterval( intervalscan );
	$( '#divinterface, #divwebui, #divaccesspoint' ).removeClass( 'hide' );
	$( '#divwifi' ).addClass( 'hide' );
	if ( wlconnected ) { // refresh for ip to be ready
		$( '#refreshing' ).removeClass( 'hide' );
		wlanIP( wlconnected );
	} else {
		nicsStatus();
	}
} );
$( '#listinterfaces' ).on( 'click', 'li', function( e ) {
	var $this = $( this );
	var inf = $this.data( 'inf' );
	var ip = $this.data( 'ip' );
	var router = $this.data( 'router' );
	var dhcp = $this.data( 'dhcp' ) ? 1 : 0;
	if ( inf === 'eth0' ) {
		var dataeth0 = "Description='eth0 connection'\n"
				  +'Interface=eth0\n'
				  +'ForceConnect=yes\n'
				  +'SkipNoCarrier=yes\n'
				  +'Connection=ethernet\n'
		info( {
			  icon         : 'lan'
			, title        : 'Edit LAN IP'
			, textlabel    : [ 'IP', 'Gateway', 'Primary DNS', 'Secondary DNS' ]
			, textvalue    : [ ip, router ]
			, textrequired : [ 0, 1 ]
			, checkbox     : { 'Static IP': 1 }
			, preshow      : function() {
				$( '#infoText' ).toggle( dhcp );
				$( '#infoCheckBox input' ).prop( 'checked', !dhcp );
			}
			, ok           : function() {
				var newdhcp = $( '#infoCheckBox input' ).prop( 'checked' ) ? 1 : 0;
				if ( dhcp && newdhcp === dhcp ) return
				
				if ( !checked ) {
					dataeth0 += 'IP=dhcp';
				} else {
					dataeth0 += "IP=static\n"
							   +"Address='"+ $( '#infoTextBox' ).val() +"/24'\n"
							   +"Gateway='"+ $( '#infoTextBox1' ).val() +"'\n"
							   +"DNS=('"+ $( '#infoTextBox2' ).val() +"' '"+ $( '#infoTextBox3' ).val() +"')";
				}
				notify( 'eth0', 'Restarting ...', 'lan', 10000 );
				local = 1;
				$.post( 'commands.php', { bash: [
					  'echo -e "'+ dataeth0 +'" > /etc/netctl/eth0'
					, 'netctl restart eth0'
					, pstream( 'network' )
					] }, function() {
					bannerHide();
					nicsStatus();
					resetlocal();
				} );
			}
		} );
		$( '#infoCheckBox' ).on( 'click', 'input', function() {
			$( '#infoText' ).toggle( $( this ).prop( 'checked' ) );
		} );
	} else if ( inf === 'wlan0' && $( '#accesspoint' ).prop( 'checked' ) ) {
		info( {
			  icon    : 'wifi-3'
			, title   : 'Disable Access Point'
			, message : 'Stop Access Point to connect Wi-Fi?'
			, ok      : function() {
				$( '#accesspoint' ).click();
				wlcurrent = inf;
				wlanStatus();
				wlconnected = '';
			}
		} );
	} else {
		wlcurrent = inf;
		wlanStatus();
	}
} );
$( '#listwifi' ).on( 'click', 'li', function() {
	var $this = $( this );
	var wlan = $this.data( 'wlan' );
	var ssid = $this.data( 'ssid' );
	var encrypt = $this.data( 'encrypt' );
	var wpa = $this.data( 'wpa' );
	if ( $this.data( 'connected' ) ) {
		info( {
			  icon    : 'wifi-3'
			, title   : ssid
			, message : 
				'<div class="col-l">'
					+'Signal<br>'
					+'Interface<br>'
					+'IP<br>'
					+'Router'
				+'</div>'
				+'<div class="col-r">'
					+ $this.data( 'db' ) +' dB<br>'
					+'<span id="inf">'+ wlan +'</span><br>'
					+ $this.data( 'ip' ) +'<br>'
					+ $this.data( 'router' )
				+'</div>'
			, buttonlabel : 'Fotget'
			, button      : function() {
				local = 1;
				$.post( 'commands.php', { bash: [
					  'netctl stop "'+ ssid +'"'
					, 'rm "/etc/netctl/'+ ssid +'"'
					, pstream( 'network' )
					] }, function() {
					wlconnected = '';
					wlanScan();
					notify( 'Wi-Fi', ssid +' removed.', 'wifi-3' );
					resetlocal();
				} );
			}
			, oklabel     : 'Disconnect'
			, ok          : function() {
				clearInterval( intervalscan );
				$( '#scanning' ).removeClass( 'hide' );
				local = 1;
				$.post( 'commands.php', { bash: [
					  'systemctl disable --now netctl-auto@'+ wlan
					, 'netctl stop '+ ssid
					, pstream( 'network' )
					] }, function() {
						wlconnected = '';
						wlanScanInterval();
						resetlocal();
				} );
			}
		} );
	} else if ( $this.data( 'profile' ) ) { // saved wi-fi
		connect( wlan, ssid, 0 );
	} else if ( encrypt === 'on' ) { // new wi-fi
		info( {
			  icon      : 'wifi-3'
			, title     : 'Wi-Fi'
			, message   : 'Connect: <wh>'+ ssid +'</wh>'
			, textlabel : 'Password'
			, ok      : function() {
				var data = 'Interface='+ wlan +'\n'
						  +'Connection=wireless\n'
						  +'IP=dhcp\n'
						  +'ESSID="'+ ssid +'"\n'
						  +'Security='+ ( wpa || 'wep' ) +'\n'
						  +'Key="'+ $( '#infoTextBox' ).val() +'"\n';
				connect( wlan, ssid, data );
			}
		} );
	} else { // no password
		var data = 'Interface='+ wlan +'\n'
				  +'Connection=wireless\n'
				  +'IP=dhcp\n'
				  +'ESSID="'+ ssid +'"\n'
				  +'Security=none\n';
		connect( wlan, ssid, data );
	}
} );
$( '#add' ).click( function() {
	$this = $( this );
	info( {
		  icon      : 'wifi-3'
		, title     : 'Add Wi-Fi'
		, textlabel : [ 'SSID', 'Password', 'IP', 'Gateway' ]
		, checkbox  : { 'Static IP': 1, 'Hidden SSID': 1, 'WEP': 1 }
		, preshow   : function() {
			$( '#infoTextLabel2, #infoTextBox2, #infoTextLabel3, #infoTextBox3' ).hide();
		}
		, ok        : function() {
			var ssid = $( '#infoTextBox' ).val();
			var wlan = $( '#listwifi li:eq( 0 )' ).data( 'wlan' );
			var password = $( '#infoTextBox1' ).val();
			var ip = $( '#infoTextBox2' ).val();
			var gw = $( '#infoTextBox3' ).val();
			var wpa = $( '#infoCheckBox input:eq( 2 )' ).prop( 'checked' ) ? 'wep' : 'wpa'
			var data = 'Interface='+ wlan +'\n'
					  +'Connection=wireless\n'
					  +'IP=dhcp\n'
					  +'ESSID="'+ ssid +'"\n';
			if ( password ) {
				data += 'Security='+ wpa +'\n'
					   +'Key="'+ password +'"\n'
			}
			if ( ip ) {
				data += 'Address='+ ip +'\n'
					   +'Gateway='+ gw
			}
			connect( wlan, ssid, data );
		}
	} );
	$( '#infoCheckBox' ).on( 'click', 'input:eq( 0 )', function() {
		$( '#infoTextLabel2, #infoTextBox2, #infoTextLabel3, #infoTextBox3' ).toggle( $( this ).prop( 'checked' ) );
	} );
} );
$( '#accesspoint' ).change( function() {
	$( '#refreshing' ).removeClass( 'hide' );
	if ( $( this ).prop( 'checked' ) ) {
		qr();
		$( '#boxqr, #settings-accesspoint' ).removeClass( 'hide' );
		var cmd = [
				  'ifconfig wlan0 '+ $( '#ipwebuiap' ).text()
				, 'systemctl enable --now hostapd dnsmasq'
				, 'systemctl disable --now netctl-auto@wlan0'
				, 'netctl stop-all'
				, pstream( 'network' )
		];
	} else {
		$( '#boxqr, #settings-accesspoint' ).addClass( 'hide' );
		var cmd = [
			  'systemctl disable --now hostapd dnsmasq'
			, 'ifconfig wlan0 0.0.0.0'
			, pstream( 'network' )
		];
	}
	local = 1;
	$.post( 'commands.php', { bash: cmd }, function() {
		nicsStatus();
		resetlocal();
	} );
});
$( '#settings-accesspoint' ).click( function() {
	info( {
		  icon    : 'network'
		, title   : 'Access Point Settings'
		, textlabel : [ 'Password', 'IP' ]
		, textvalue : [ $( '#passphrase' ).text(), $( '#ipwebuiap' ).text() ]
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
			] }, resetlocal );
			$( '#passphrase' ).text( passphrase || '(No password)' );
			$( '#ipwebuiap' ).text( ip );
			qr();
			notify( 'Access Point', 'Settings changed' );
		}
	} );
} );

document.addEventListener( 'visibilitychange', function() {
	if ( !wlcurrent ) return
	
	if ( document.hidden ) {
		clearInterval( intervalscan );
	} else {
		wlanScanInterval();
	}
} );
function nicsStatus() {
	$.post( 'commands.php', { bash: '/srv/http/settings/networkstatus.sh' }, function( data ) {
		var html = '';
		data.forEach( function( el ) {
			var val = el.split( '^^' );
			var inf = val[ 0 ];
			var infname = inf === 'eth0' ? 'LAN' : 'Wi-Fi';
			if ( inf.slice( -1 ) != 0 ) infname += ' '+ inf.slice( -1 );
			var up = val[ 1 ];
			var ip = val[ 2 ];
			var dataip = ip ? ' data-ip="'+ ip +'"' : '';
			var ssid = val[ 3 ];
			var router = val[ 4 ];
			var datarouter = router ? ' data-router="'+ router +'"' : '';
			var dhcp = val[ 5 ] ? ' data-dhcp="1"' : '';
			var wlan = inf !== 'eth0';
			var accesspoint = $( '#accesspoint' ).prop( 'checked' );
			html += '<li data-inf="'+ inf +'" '+ ( up ? 'data-up="1"' : ''  ) + dataip + datarouter + dhcp +'>';
			html += '<i class="fa fa-'+ ( wlan ? 'wifi-3' : 'lan' ) +'"></i>'+ infname;
			if ( accesspoint && wlan ) {
				html += '&ensp;<span class="green">&bull;</span>&ensp;'+ $( '#ipwebuiap' ).text() +'<gr>&ensp;<<&ensp;RPi access point</gr></li>';
			} else if ( inf === 'eth0' ) {
				var routerhtml = router ? '<gr>&ensp;>>&ensp;'+ router +'&ensp;</gr>' : '';
				if ( ip ) html += '&ensp;<span class="green">&bull;</span>&ensp;'+ ip + routerhtml +'</li>';
			} else {
				if ( router ) {
					html += '&ensp;<span class="green">&bull;</span>&ensp;'+ ip +'<gr>&ensp;>>&ensp;'+ router +'&ensp;&bull;&ensp;</gr>'+ ssid +'</li>';
				} else {
					html += '</li>';
				}
			}
		} );
		$( '#listinterfaces' ).html( html ).promise().done( function() {
			$( '#divaccesspoint' ).toggleClass( 'hide', !$( '#listinterfaces .fa-wifi-3' ).length );
		} );
		qr();
		$( '#refreshing' ).addClass( 'hide' );
	}, 'json' );
}
function wlanStatus() {
	$( '#divinterface, #divwebui, #divaccesspoint' ).addClass( 'hide' );
	$( '#listwifi' ).empty();
	$( '#divwifi' ).removeClass( 'hide' );
	wlanScanInterval()
}
function wlanScan() {
	$( '#scanning' ).removeClass( 'hide' );
	$.post( 'commands.php', { bash: '/srv/http/settings/networkwlanscan.sh '+ wlcurrent }, function( data ) {
		var val, quality, ssid, encrypt, wpa, wlan, connected, profile, router, ip, db, wifi;
		var html = '';
		data.forEach( function( el ) {
			val = el.split( '^^' );
			ssid = val[ 1 ];
			encrypt = val[ 2 ];
			wpa = val[ 3 ];
			connected = val[ 4 ] ? ' data-connected="1"' : '';;
			wlan = val[ 5 ];
			profile = val[ 6 ] ? ' data-profile="1"' : '';
			router = val[ 7 ] ? ' data-router="'+ val[ 7 ] +'"' : '';
			ip = val[ 8 ] ? ' data-ip="'+ val[ 8 ] +'"' : '';
			db = val[ 9 ];
			quality = val[ 0 ];
			if ( quality > 55 ) {
				wifi = 3;
			} else if ( quality < 41 ) {
				wifi = 1;
			} else {
				wifi = 2
			}
			html += '<li '
				   +'data-db="'+ db +'" data-ssid="'+ ssid +'" data-encrypt="'+ encrypt +'" '
				   +' data-encrypt="'+ encrypt +'" data-wpa="'+ wpa +'" data-wlan="'+ wlan +'"'
				   + router + ip +'"'+ connected + profile +'>';
			html += '<i class="fa fa-wifi-'+ wifi +'"></i>';
			if ( connected ) html += '<span class="green">&bull;</span>&ensp;';
			html += ssid;
			if ( encrypt === 'on' ) html += ' <i class="fa fa-lock sx"></i>';
			$( '#listwifi' ).html( html +'</li>' ).promise().done( function() {
				bannerHide();
				$( '#scanning' ).addClass( 'hide' );
			} );
		} );
	}, 'json' );
}
function wlanScanInterval() {
	wlanScan();
	intervalscan = setInterval( function() {
		wlanScan();
	}, 12000 );
}
function connect( wlan, ssid, data ) {
	clearInterval( intervalscan );
	wlcurrent = wlan;
	$( '#scanning' ).removeClass( 'hide' );
	var cmd = [
		  'echo -e "'+ data +'" > "/etc/netctl/'+ ssid +'"'
		, 'netctl stop-all'
		, 'ifconfig '+ wlan +' down'
		, 'netctl start "'+ ssid +'"'
	];
	if ( !data ) cmd.shift();
	local = 1;
	$.post( 'commands.php', { bash: cmd }, function( std ) {
		if ( std != -1 ) {
			wlconnected = wlan;
			$.post( 'commands.php', { bash: [
				  'systemctl enable --now netctl-auto@'+ wlan
				, pstream( 'network' )
				] }, function( std ) {
				wlanScanInterval();
			} );
		} else {
			$( '#scanning' ).addClass( 'hide' );
			wlconnected =  '';
			info( {
				  icon      : 'wifi-3'
				, title     : 'Wi-Fi'
				, message   : 'Connect to <wh>'+ ssid +'</wh> failed.'
			} );
		}
		resetlocal();
	} );
}
function wlanIP( wlconnected ) {
	$.post( 'commands.php', { bash: 'ip addr list '+ wlconnected +' | grep inet' }, function( std ) {
		if ( std!= -1 ) {
			wlconnected = '';
			nicsStatus();
			$( '#refreshing' ).addClass( 'hide' );
		} else {
			setTimeout( function() {
				wlanIP( wlconnected )
			}, 1000 );
		}
	} );
}
function escape_string( string ) {
	var to_escape = [ '\\', ';', ',', ':', '"' ];
	var hex_only = /^[0-9a-f]+$/i;
	var output = "";
	for ( var i = 0; i < string.length; i++ ) {
		if ( $.inArray( string[ i ], to_escape ) != -1 ) {
			output += '\\'+string[ i ];
		} else {
			output += string[ i ];
		}
	}
	return output;
};
var qroptions = {
	  width  : 120
	, height : 120
}
function qr() {
	$( 'li' ).each( function() {
		var ip = $( this ).data( 'ip' );
		var router = $( this ).data( 'router' );
		if ( ip && router ) {
			$( '#qrwebui' ).empty();
			$( '#ipwebui' ).text( ip );
			qroptions.text = 'http://'+ ip;
			$( '#qrwebui' ).qrcode( qroptions );
			$( '#webui' ).removeClass( 'hide' );
			return false
		}
	} );
	if ( !$( '#accesspoint' ).prop( 'checked' ) ) return
	
	$( '#qraccesspoint, #qrwebuiap' ).empty();
	qroptions.text = 'WIFI:S:'+ escape_string( $( '#ssid' ).text() ) +';T:WPA;P:'+ escape_string( $( '#passphrase' ).text() ) +';';
	$( '#qraccesspoint' ).qrcode( qroptions );
	qroptions.text = 'http://'+ $( '#ipwebuiap' ).text();
	$( '#qrwebuiap' ).qrcode( qroptions );
	$( '#boxqr' ).removeClass( 'hide' );
}

} );