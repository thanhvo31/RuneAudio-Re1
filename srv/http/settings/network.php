<?php
$hostapd = exec( "$sudo/systemctl is-active hostapd" ) === 'active' ? 1 : 0;
$ssid = exec( "$sudo/grep ssid= /etc/hostapd/hostapd.conf | cut -d= -f2" );
$passphrase = exec( "$sudo/grep '^wpa_passphrase' /etc/hostapd/hostapd.conf | cut -d'=' -f2" );
$ipwebuiap = exec( "$sudo/grep 'router' /etc/dnsmasq.conf | cut -d',' -f2" );
?>
<div class="container">
	<br>
	<div id="divinterface">
		<h3noline>Interfaces&ensp;<i id="refreshing" class="fa fa-wifi-3 blink hide"></i></h3noline>
		<ul id="listinterfaces" class="entries"></ul>
		<span class="help-block hide">Use LAN if available or select Wi-Fi to connect a network.<br><br></span>
	</div>
	<div id="divwifi" class="hide">
		<h3noline>Wi-Fi&ensp;
			<i id="add" class="fa fa-plus-circle"></i>&ensp;<i id="scanning" class="fa fa-wifi-3 blink"></i>
			<i id="back" class="fa fa-arrow-left"></i>
		</h3noline>
		<ul id="listwifi" class="entries"></ul>
		<span class="help-block hide">Access points with less than optimal signal, -36dB, were omitted.</span>
	</div>
	<div id="divwebui">
		<form id="webui" class="form-horizontal hide">
			<div class="form-group">
				<label class="control-label col-sm-2">Web UI</label>
				<div class="col-sm-10">
					<gr>http://</gr><span id="ipwebui"></span><br>
					<div class="divqr">
						<div id="qrwebui" class="qr"></div>
					</div>
					<span class="help-block hide">Scan QR code or use IP address to connect RuneAudio Web User Interface.</span>
				</div>
			</div>
		</form>
	</div>
	<div id="divaccesspoint">
	<br>
	<h3>RPi access point</h3>
		<form class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-2">Enable</label>
				<div class="col-sm-10">
					<input id="accesspoint" type="checkbox" <?=( $hostapd ? 'checked' : '' )?>>
					<label class="switchlabel" for="accesspoint"></label>
					<i id="settings-accesspoint" class="setting fa fa-gear <?=( $hostapd ? '' : 'hide' )?>"></i>
					<span class="help-block hide">RPi access point should be used only when LAN or Wi-Fi were not available.</span>
				</div>
			</div>
			<p class="brhalf"></p>
			<div id="boxqr" class="hide">
			<div class="form-group">
				<label class="control-label col-sm-2">Credential</label>
				<div class="col-sm-10">
					<gr>SSID:</gr> <span id="ssid"><?=$ssid ?></span><br>
					<gr>Password:</gr> <span id="passphrase"><?=( $passphrase ?: '(No password)' )?></span>
					<div class="divqr">
						<div id="qraccesspoint" class="qr"></div>
					</div>
					<span class="help-block hide">Scan QR code or find the SSID and use the password to connect RuneAudio via local access point.</span>
				</div>
			</div>
			<div class="form-group">
				<label class="control-label col-sm-2">Web UI</label>
				<div class="col-sm-10">
					<gr>http://</gr><span id="ipwebuiap"><?=$ipwebuiap ?></span>
					<div class="divqr">
						<div id="qrwebuiap" class="qr"></div>
					</div>
					<span class="help-block hide">Scan QR code or use IP address to connect RuneAudio Web User Interface.</span>
				</div>
			</div>
		</form>
	</div>
</div>
