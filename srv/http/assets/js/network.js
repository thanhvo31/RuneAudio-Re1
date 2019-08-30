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
	if ( inf !== 'eth0' ) {
		wlcurrent = inf;
		wlanStatus();
	} else {
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
	}
} );
$( '#listwifi' ).on( 'click', '.fa-save', function() {
	var $this = $( this ).parent();
	if ( ! $this.data( 'profile' ) ) return
	
	var wlan = $this.data( 'wlan' );
	var ssid = $this.data( 'ssid' );
	info( {
		  icon        : 'wifi-3'
		, title       : 'Saved Wi-Fi'
		, message     : 'Forget / Connect ?'
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
		, oklabel     : 'Connect'
		, ok          : function() {
			connect( wlan, ssid, 0 );
		}
	} );
} );
$( '#listwifi' ).on( 'click', 'li', function( e ) {
	if ( $( e.target ).hasClass( 'fa-save' ) ) return
	
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
		if ( $( '#accesspoint' ).prop( 'checked' ) ) {
			info( {
				  icon    : 'wifi-3'
				, title   : 'RPi access point'
				, message : 'Stop RPi access point to connect Wi-Fi?'
				, ok      : function() {
					connect( wlan, ssid, 0 );
				}
			} );
		} else {
			connect( wlan, ssid, 0 );
		}
	} else if ( encrypt === 'on' ) { // new wi-fi
		if ( $( '#accesspoint' ).prop( 'checked' ) ) {
			info( {
				  icon    : 'wifi-3'
				, title   : 'RPi access point'
				, message : 'Stop RPi access point to connect Wi-Fi?'
				, ok      : function() {
					newWiFi( $this );
				}
			} );
		} else {
			newWiFi( $this );
		}
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
		var cmd = [
				  'ifconfig wlan0 '+ $( '#ipwebuiap' ).text()
				, 'systemctl start hostapd dnsmasq'
				, 'redis-cli set accesspoint 1'
				, 'systemctl disable --now netctl-auto@wlan0'
				, 'netctl stop-all'
				, pstream( 'network' )
		];
		if ( wlconnected ) {
			info( {
				  icon    : 'wifi-3'
				, title   : 'Wi-Fi'
				, message : 'Disconnect Wi-Fi to start RPi access point?'
				, ok      : function() {
					qr();
					$( '#boxqr, #settings-accesspoint' ).removeClass( 'hide' );
					local = 1;
					$.post( 'commands.php', { bash: cmd }, function() {
						nicsStatus();
						resetlocal();
					} );
				}
			} );
			return
		}
		
		qr();
		$( '#boxqr, #settings-accesspoint' ).removeClass( 'hide' );
	} else {
		$( '#boxqr, #settings-accesspoint' ).addClass( 'hide' );
		var cmd = [
			  'systemctl stop hostapd dnsmasq'
			, 'redis-cli del accesspoint'
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
					wlconnected = inf;
					html += '&ensp;<span class="green">&bull;</span>&ensp;'+ ip +'<gr>&ensp;>>&ensp;'+ router +'&ensp;&bull;&ensp;</gr>'+ ssid +'</li>';
				} else {
					html += '</li>';
				}
			}
		} );
		$( '#listinterfaces' ).html( html ).promise().done( function() {
			$( '#divaccesspoint' ).toggleClass( 'hide', !accesspoint );
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
			db = val[ 8 ];
			quality = val[ 0 ];
			saved = val[ 6 ] ? '<i class="fa fa-save"></i>' : '';
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
				   + router +'"'+ connected + profile +'>';
			html += '<i class="fa fa-wifi-'+ wifi +'"></i>';
			if ( connected ) html += '<span class="green">&bull;</span>&ensp;';
			html += ssid;
			if ( encrypt === 'on' ) html += ' <i class="fa fa-lock"></i>'+ saved;
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
function newWiFi( $this ) {
	var wlan = $this.data( 'wlan' );
	var ssid = $this.data( 'ssid' );
	var wpa = $this.data( 'wpa' );
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
			if ( $( '#accesspoint' ).prop( 'checked' ) ) {
				$( '#accesspoint' ).prop( 'checked', 0 );
				$( '#boxqr, #settings-accesspoint' ).addClass( 'hide' );
				var cmd = [
					  'systemctl stop hostapd dnsmasq'
					, 'redis-cli del accesspoint'
					, 'ifconfig wlan0 0.0.0.0'
				];
			} else {
				var cmd = [];
			}
			cmd.push(
				  'systemctl enable --now netctl-auto@'+ wlan
				, pstream( 'network' )
			);
			$.post( 'commands.php', { bash: cmd }, function( std ) {
				wlanScanInterval();
				resetlocal();
			} );
		} else {
			$( '#scanning' ).addClass( 'hide' );
			wlconnected =  '';
			info( {
				  icon      : 'wifi-3'
				, title     : 'Wi-Fi'
				, message   : 'Connect to <wh>'+ ssid +'</wh> failed.'
			} );
			resetlocal();
		}
	} );
}
function wlanIP( wlconnected ) {
	$( '#refreshing' ).removeClass( 'hide' );
	$.post( 'commands.php', { bash: 'ip addr list '+ wlconnected +' | grep inet' }, function( std ) {
		if ( std != -1 ) {
			wlconnected = '';
			nicsStatus();
		} else {
			setTimeout( function() {
				wlanIP( wlconnected )
			}, 1000 );
		}
		$( '#refreshing' ).addClass( 'hide' );
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