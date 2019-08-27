$( function() { // document ready start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var formdata = {}
var updating = 0;
mountStatus();
toggleUpdate();
document.addEventListener( 'visibilitychange', function() {
	if ( !document.hidden ) toggleUpdate();
} );
$( '#update' ).click( function() {
	if ( $( this ).data( 'db' ) ) {
		info( {
			  icon    : 'library'
			, title   : 'Update Library Database'
			, radio   : { 'Only changed files' : 'update', 'Rescan all files': 'rescan' }
			, ok      : function() {
				updating = 1;
				update( $( '#infoRadio input[ type=radio ]:checked' ).val() );
			}
		} );
	} else {
		info( {
			  icon    : 'library'
			, title   : 'Build Library Database'
			, message : 'Continue?'
			, ok      : function() {
				updating = 1
				update( 'rescan' );
				$( '#update' ).data( 'db', 1 )
			}
		} );
	}
} );
var pushstreamidle = new PushStream( { modes: 'websocket' } );
pushstreamidle.addChannel( 'idle' );
pushstreamidle.connect();
pushstreamidle.onmessage = function( changed ) {
	if ( changed[ 0 ].changed === 'update' ) toggleUpdate();
}

var html = heredoc( function() { /*
	<form id="formmount">
		<div id="infoRadio" class="infocontent infohtml">
			&emsp;&emsp;&emsp;Type&emsp;<label><input type="radio" name="protocol" value="cifs"> SMB/CIFS</label>&emsp;
			<label><input type="radio" name="protocol" value="nfs"> NFS</label>&emsp;&emsp;
		</div>
		<div id="infoText" class="infocontent">
			<div id="infotextlabel">
				Name<br>
				IP<br>
				<span id="sharename">Share path</span><br>
				<span class="guest">
					User<br>
					Password<br>
				</span>
				Options
			</div>
			<div id="infotextbox">
				<input type="text" class="infoinput" name="name" spellcheck="false">
				<input type="text" class="infoinput" name="ip" spellcheck="false">
				<input type="text" class="infoinput" name="directory" spellcheck="false">
				<div class="guest">
				<input type="text" class="infoinput" name="user" spellcheck="false">
				<input type="password" class="infoinput" name="password">
				</div>
				<input type="text" class="infoinput" name="options" spellcheck="false">
			</div>
		</div>
		<div id="infoRadio1" class="infocontent infohtml options">
			Charset&emsp;<label><input type="radio" name="charset" value="utf8"> UTF-8</label>&emsp;
			<label><input type="radio" name="charset" value="iso8859-1"> ISO8859-1</label>
		</div>
		<div id="infoCheckBox" class="infocontent infohtml">
			<label><input type="checkbox" id="guest" name="guest" value="guest">&ensp;Guest mode</label>&emsp;
		</div>
	</form>
*/ } );
$( '#addnas' ).click( function() {
	infoMount();
} );
$( '#infoContent' ).on( 'click', '#infoRadio', function() {
	if ( $( this ).find( 'input:checked' ).val() === 'nfs' ) {
		$( '.guest, #infoRadio1, #infoCheckBox' ).addClass( 'hide' );
		$( '#guest' ).prop( 'checked', 1 );
	} else {
		$( '.guest, #infoRadio1, #infoCheckBox' ).removeClass( 'hide' );
		$( '#guest' ).prop( 'checked', 0 );
	}
} );
$( '#infoContent' ).on( 'click', '#guest', function( e ) {
	e.stopImmediatePropagation();
	$( '.guest' ).toggleClass( 'hide' );
} );
$( '.entries' ).on( 'click', 'li', function( e ) {
	var mountpoint = $( this ).data( 'mountpoint' );
	var mountname = mountpoint.replace( / /g, '\\040' );
	var device = $( this ).data( 'device' );
	var nas = mountpoint.slice( 9, 12 ) === 'NAS';
	if ( $( e.target ).hasClass( 'remove' ) ) {  // remove
		info( {
			  icon    : 'network'
			, title   : 'Remove Network Mount'
			, message : '<wh>'+ mountpoint +'</wh>'
					   +'<br><br>Continue?'
			, oklabel : 'Remove'
			, ok      : function() {
				local = 1;
				$.post( 'commands.php', { bash: [
						  "sed -i '\\|"+ mountname +"| d' /etc/fstab"
						, 'rmdir "'+ mountpoint +'" &> /dev/null'
						, pstream( 'sources' )
					] }, function() {
					mountStatus();
					resetlocal();
				} );
			}
		} );
		return
	}
	
	if ( !$( this ).data( 'unmounted' ) ) { // unmount
		info( {
			  icon    : nas ? 'network' : 'usbdrive'
			, title   : 'Unmount '+ ( nas ? 'Network Share' : 'USB Drive' )
			, message : '<wh>'+ mountpoint +'</wh>'
					   +'<br><br>Continue?'
			, oklabel : 'Unmount'
			, ok      : function() {
				local = 1;
				$.post( 'commands.php', { bash: [
						  ( nas ? '' : 'udevil ' ) +'umount -l "'+ mountname +'"'
						, pstream( 'sources' )
					] }, function() {
					mountStatus();
					resetlocal();
				} );
			}
		} );
	} else { // remount
		info( {
			  icon    : nas ? 'network' : 'usbdrive'
			, title   : 'Mount '+ ( nas ? 'Network Share' : 'USB Drive' )
			, message : '<wh>'+ mountpoint +'</wh>'
					   +'<br><br>Continue?'
			, oklabel : 'Mount'
			, ok      : function() {
				local = 1;
				$.post( 'commands.php', { bash: [
						  ( nas ? 'mount "'+ mountname +'"' : 'udevil mount '+ device )
						, pstream( 'sources' )
					] }, function() {
					mountStatus();
					resetlocal();
				} );
			}
		} );
	}
} );

function mountStatus() {
	$.post( 'commands.php', { getmount: 1 }, function( data ) {
		if ( !data ) return
		var data = data.split( '\n' );
		var htmlnas = '';
		var htmlusb = '';
		var htmlunmount = '';
		data.forEach( function( el ) {
			var mountpoint = el.split( ' ' )[ 0 ].replace( /\/$/, '' );
			if ( el.slice( 9, 12 ) === 'USB' ) {
				htmlusb += '<li data-mountpoint="'+ mountpoint +'"><i class="fa fa-usbdrive"></i>'+ el +'</li>';
			} else if ( el.slice( 9, 12 ) === 'NAS' ) {
				htmlnas += '<li data-mountpoint="'+ mountpoint +'"><i class="fa fa-lan"></i>'+ el +'</li>';
			} else {
				var devmount = el.split( '^^' );
				var device = devmount[ 0 ];
				if ( device.slice( 0, 4 ) === '/dev' ) {
					var icon = 'usbdrive';
					var removemount = '';
				} else {
					var icon = 'network';
					var removemount = '<i class="fa fa-minus-circle remove"></i></li>';
				}
				var mountpoint = devmount[ 1 ].replace( /\/$/, '' );
				htmlunmount += '<li data-mountpoint="'+ mountpoint +'" data-device="'+ device +'" data-unmounted="1"><i class="fa fa-'+ icon +'"></i><gr>'
							  + mountpoint +'</gr><a class="red"> &bull; </a>'+ device + removemount;
			}
		} );
		$( '#list' ).html( htmlusb + htmlnas + htmlunmount );
	} );
}
function infoMount( data ) {
	info( {
		  icon    : 'network'
		, title   : 'Mount Share'
		, content : html
		, preshow : function() {
			if ( $.isEmptyObject( data ) ) {
				$( '#infoRadio input' ).eq( 0 ).prop( 'checked', 1 );
				$( '#infoRadio1 input' ).eq( 0 ).prop( 'checked', 1 );
			} else {
				$( '#infoRadio input' ).eq( formdata.protocol === 'cifs' ? 0 : 1 ).prop( 'checked', 1 );
				$( '#infotextbox input:eq( 0 )' ).val( formdata.name );
				$( '#infotextbox input:eq( 1 )' ).val( formdata.ip );
				$( '#infotextbox input:eq( 2 )' ).val( formdata.directory );
				$( '#infotextbox input:eq( 3 )' ).val( formdata.user );
				$( '#infotextbox input:eq( 4 )' ).val( formdata.password );
				$( '#infotextbox input:eq( 5 )' ).val( formdata.options );
				$( '#infoCheckBox input' ).prop( 'checked', formdata.guest === 'guest' );
				$( '#infoRadio1 input' ).eq( formdata.charset === 'utf8' ? 0 : 1 ).prop( 'checked', 1 );
			}
		}
		, ok      : function() {
			var data = getFormData( $( '#formmount' ) );
			var mountpoint = '/mnt/MPD/NAS/'+ data.name;
			var ip = data.ip;
			var directory = data.directory.replace( /^\//, '' );
			if ( data.protocol === 'cifs' ) {
				var options = ( data.guest || !data.user ) ? 'username=guest' : 'username='+ data.user +',password='+ data.password;
				options += ',uid='+ $( '#list' ).data( 'uid' ) +',gid='+ $( '#list' ).data( 'gid' ) +',iocharset='+ data.charset;
				options += data.options ? ','+ data.options : '';
				var cmd = '"'+ mountpoint +'" '+ ip +' "//'+ ip +'/'+ directory +'" cifs "'+ options +'"';
			} else {
				var options = data.options || '';
				var cmd = '"'+ mountpoint +'" '+ ip +' "'+ ip +':/'+ directory +'" nfs '+ options;
			}
			local = 1;
			$.post( 'commands.php', { bash: [
					  '/srv/http/settings/sourcesmount.sh '+ cmd
					, pstream( 'sources' )
				] }, function( std ) {
				var std = std[ 0 ];
				if ( std ) {
					formdata = data;
					info( {
						  icon    : 'network'
						, title   : 'Mount Share'
						, message : std
						, ok      : function() {
							infoMount( formdata );
						}
					} );
				} else {
					mountStatus();
					formdata = {}
				}
				resetlocal();
			}, 'json' );
		}
	} );
}
function getFormData( $form ) {
	var data = $form.serializeArray();
	var json = {};
	$.map( data, function( val ) {
		json[ val[ 'name' ] ] = val[ 'value' ];
	});
	return json;
}
function toggleUpdate() {
	$.post( 'status.php', { statusonly: 1 }, function( status ) {
		$( '#updating' ).toggleClass( 'hide', !status.updating_db );
		if ( updating && !status.updating_db ) {
				var second = ( Date.now() - status.updatestart ) / 1000;
				notify( 'Library Update', 'Finished in '+ second2HMS( second ), 'library', -1 );
				updating = 0;
		}
	}, 'json' );
}
function update( cmd ) {
	$( '#updating' ).removeClass( 'hide' );
	$.post( 'commands.php', { bash: [
		  'redis-cli set updatestart '+ new Date().getTime()
		, '/srv/http/count.sh '+ cmd
		, pstream( 'sources' )
	] }, resetlocal );
}
function second2HMS( second ) {
	if ( second <= 0 ) return 0;
	
	var second = Math.round( second );
	var hh = Math.floor( second / 3600 );
	var mm = Math.floor( ( second % 3600 ) / 60 );
	var ss = second % 60;
	
	hh = hh ? hh +':' : '';
	mm = hh ? ( mm > 9 ? mm +':' : '0'+ mm +':' ) : ( mm ? mm +':' : '' );
	ss = mm ? ( ss > 9 ? ss : '0'+ ss ) : ss;
	return hh + mm + ss;
}

} ); // document ready end <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
