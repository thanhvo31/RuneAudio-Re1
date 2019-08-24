<?php
$redis = new Redis();
$redis->pconnect( '127.0.0.1' );
$hostname = $redis->get( 'hostname' );
$i2sname = $redis->get( 'i2sname' );
$i2ssysname = $redis->get( 'i2ssysname' );
$soundprofile = $redis->get( 'orionprofile' );
$password = $redis->get( 'pwd_protection' ) ? 'checked' : '';
$passworddefault = password_verify( 'rune', $redis->get( 'password' ) );

$data = json_decode( shell_exec( '/srv/http/settings/systemdata.sh' ) );

date_default_timezone_set( $data->timezone );
$timezonelist = timezone_identifiers_list();
foreach( $timezonelist as $key => $zone ) {
	$selected = $zone === $data->timezone ? ' selected' : '';
	$datetime = new DateTime( 'now', new DateTimeZone( $zone ) );
	$offset = $datetime->format( 'P' );
	$zonename = preg_replace( array( '/_/', '/\//' ), array( ' ', ' <gr>&middot;</gr> ' ), $zone );
	if ( $selected ) $zonestring = $data->timezone === 'UTC' ? 'UTC' : explode( ' <gr>&middot;</gr> ', $zonename, 2 )[ 1 ];
	$optiontimezone.= '<option value="'.$zone.'"'.$selected.'>'.$zonename.'&ensp;'.$offset."</option>\n";
}

// set value
//   - append '/boot/config.txt' with 'dtoverlay' file names in '/boot/overlays/*'
//   - disable on-board audio in '/boot/config.txt'
//   - reboot
//   - parse sysnames with 'aplay -l' and populate to '/etc/mpd.conf'
//   - enable 1st output = i2s module
//
//   - MPD setting page - get names from '/srv/http/settings/i2s/*' for interface dropdown
include '/srv/http/settings/system_i2smodules.php';

foreach( $i2slist as $name => $sysname ) {
	$selected = ( $name === $i2sname && $sysname === $i2ssysname ) ? ' selected' : '';
	$optioni2smodule.= "<option value=\"$sysname\"$selected>$name</option>";
}
?>
<div class="container">
	<fieldset>
		<h3>System Status</h3>
		<div class="form-group" id="systemstatus">
			<label class="col-l gr">
				RuneAudio<br>
				Kernel<br>
				Hardware<br>
				Time<br>
				Up time<br>
				Since
			</label>
			<div class="col-r">
				<i class="fa fa-addons"></i> e1<br>
				<?=$data->kernel?><br>
				<?=$data->hardware?><br>
				<?=$data->date?><gr>&emsp;@ </gr><?=$zonestring?><br>
				<?=$data->uptime?><br>
				<?=$data->since?>
			</div>
		</div>
	</fieldset>
	<h3>Environment</h3>
	<form class="form-horizontal"> 
		<div class="form-group" id="environment">
			<label class="control-label col-sm-2">Player name</label>
			<div class="col-sm-10">
				<input class="form-control input-lg" type="text" id="hostname" value="<?=$hostname?>" readonly style="cursor: pointer">
				<span class="help-block hide">Set the player hostname. This will change the address used to reach the RuneUI. Local access point, AirPlay, Samba and UPnP/DLNA will broadcast this name when enabled.<br>
				(No spaces or special charecters allowed in the name.)</span>
			</div>
		</div>
		<div class="form-group">
		<label class="control-label col-sm-2">Timezone</label>
			<div class="col-sm-10">
				<select class="selectpicker" id="timezone" data-style="btn-default btn-lg">
					<?=$optiontimezone?>
				</select>
				<i id="setting-ntp" class="settingedit fa fa-gear"></i><br>
				<span class="help-block hide">Network Time Protocol server.</span></span>
			</div>
		</div>
	</form>
	<form class="form-horizontal">
		<h3>Audio</h3>
		<div class="form-group">
			<label class="control-label col-sm-2">I&#178;S Module</label>
			<div class="col-sm-10 i2s">
				<div id="divi2smodulesw" <?=( $i2ssysname ? 'class="hide"' : '' )?>>
					<input id="i2smodulesw" type="checkbox">
					<label class="switchlabel" for="i2smodulesw"></label>
				</div>
				<div id="divi2smodule" <?=( $i2ssysname ? '' : 'class="hide"' )?>>
					<select class="selectpicker" id="i2smodule" data-style="btn-default btn-lg">
						<?=$optioni2smodule?>
					</select>
				</div>
				<span class="help-block hide">I&#178;S modules are not plug-and-play capable. Select a driver for installed device.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Sound Profile</label>
			<div class="col-sm-10">
				<input id="soundprofile" type="checkbox" value="<?=$soundprofile?>" <?=( $soundprofile !== 'default' ? 'checked' : '' )?>>
				<label class="switchlabel" for="soundprofile"></label>
				<i id="setting-soundprofile" class="setting fa fa-gear <?=( $soundprofile !== 'default' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">System kernel parameters tweak: eth0 mtu, eth0 txqueuelen, swappiness and sched_latency_ns.</span>
			</div>
		</div>
	</form>
	<h3>On-board devices</h3>
	<form class="form-horizontal"> 
		<div id="divonboardaudio" class="form-group <?=( $i2ssysname ? '' : 'hide' )?>">
			<label class="control-label col-sm-2">Audio</label>
			<div class="col-sm-10">
				<input id="onboardaudio" type="checkbox" <?=( $data->onboardaudio === 'on' ? 'checked' : '' )?>>
				<label class="switchlabel" for="onboardaudio"></label>
				<span class="help-block hide">3.5mm phone and HDMI outputs.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Bluetooth</label>
			<div class="col-sm-10">
				<input id="bluetooth" type="checkbox" <?=( $data->bluetooth ? 'checked' : '' )?>>
				<label class="switchlabel" for="bluetooth"></label>
				<span class="help-block hide">Should be disabled if not used.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Wi-Fi</label>
			<div class="col-sm-10">
				<input id="wlan" type="checkbox" <?=( $data->wlan ? 'checked' : '' )?>>
				<label class="switchlabel" for="wlan"></label>
				<span class="help-block hide">Should be disabled if not used.</span>
			</div>
		</div>
	</form>
	<form class="form-horizontal">
		<h3>Features</h3>
		<div class="form-group">
			<label class="control-label col-sm-2">Access point</label>
			<div class="col-sm-10">
				<input id="accesspoint" type="checkbox" data-passphrase="<?=$data->passphrase?>" data-ip="<?=$data->ipwebuiap?>"<?=( $data->hostapd === 'active' ? 'checked' : '' )?>>
				<label class="switchlabel" for="accesspoint"></label>
				<i id="settings-accesspoint" class="setting fa fa-gear <?=( $data->hostapd === 'active' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">[hostapd] RPi access point should be used only when LAN or Wi-Fi were not available.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">AirPlay</label>
			<div class="col-sm-10">
				<input id="airplay" type="checkbox" <?=( $data->airplay === 'active' ? 'checked' : '' )?>>
				<label class="switchlabel" for="airplay"></label>
				<span class="help-block hide">[Shairport Sync] Receive audio streaming via AirPlay protocol.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Browser on RPi</label>
			<div class="col-sm-10">
				<input id="localbrowser" type="checkbox" data-cursor="<?=( $data->cursor === 'yes' ? 1 : 0 )?>" data-overscan="<?=$data->overscan?>" data-rotate="<?=$data->rotate?>" data-screenoff="<?=$data->screenoff?>" data-zoom="<?=$data->zoom?>" <?=( $data->localbrowser === 'active' ? 'checked' : '' )?>>
				<label class="switchlabel" for="localbrowser"></label>
				<i id="setting-localbrowser" class="setting fa fa-gear <?=( $data->localbrowser === 'active' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">[Chromium] Browser on RPi connected screen. Overscan change needs a reboot.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">File sharing</label>
			<div class="col-sm-10">
				<input id="samba" type="checkbox" data-usb="<?=( $data->readonlyusb ? 0 : 1 )?>" data-sd="<?=( $data->readonlysd ? 0 : 1 )?>" <?=( $data->samba === 'active' ? 'checked' : '' )?>>
				<label class="switchlabel" for="samba"></label>
				<i id="setting-samba" class="setting fa fa-gear <?=( $data->samba === 'active' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">[Samba] Share your files in USB drives and SD card on your network.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Password login</label>
			<div class="col-sm-10">
				<input id="password" type="checkbox" <?=( $passworddefault ? 'data-default="1"' : '' )?> <?=$password?>>
				<label class="switchlabel" for="password"></label>
				<i id="setting-password" class="setting fa fa-gear <?=( $password ==='checked' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">Protect the UI with a password. (Default is "rune")</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">UPnP / DLNA</label>
			<div class="col-sm-10">
				<input id="dlna" type="checkbox" value="<?=$data->queowner?>" <?=( $data->dlna === 'active' ? 'checked' : '' )?>>
				<label class="switchlabel" for="dlna"></label>
				<i id="setting-dlna" class="setting fa fa-gear <?=( $data->dlna === 'active' ? '' : 'hide' )?>"></i>
				<span class="help-block hide">[upmpdcli] Receive audio streaming via UPnP / DLNA.</span>
			</div>
		</div>
	</form>
</div>
