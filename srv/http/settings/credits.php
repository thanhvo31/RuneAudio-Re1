<?php
$list05 = array(
	  'Gearhead' => [ 'https://github.com/gearhead', 'RuneOS - Full kernel and package upgrade, kernel patch for alsa 384kHz audio support and Chromium local browser' ]
	, 'janui' => [ 'https://github.com/janui', 'RuneUI - Shairport sync with metadata, random play and autostart rework, Samba optimisation and 101 bugfixes' ]
);
$list04 = array(
	 'Frank Friedmann <gr>(aka hondagx35)</gr>' => [ 'https://github.com/hondagx35', 'A grand solo effort, AP, Local Browser, Lyrics, many upgrades, bugfixes and other improvements' ]
);
$list0103 = array(
	  'Andrea Coiutti <gr>(aka ACX)</gr>' => [ 'http://www.runeaudio.com/team/', 'RuneUI frontend design - frontend HTML/JS/CSS coding' ]
	, 'Simone De Gregori <gr>(aka Orion)</gr>' => [ 'http://www.runeaudio.com/team/', 'RuneUI PHP backend coding - frontend JS coding - RuneOS distro build &amp; optimization' ]
	, 'Carmelo San Giovanni <gr>(aka Um3ggh1U)</gr>' => [ 'http://www.runeaudio.com/team/', 'RuneOS distro build &amp; Kernel optimization' ]
	, 'Cristian Pascottini' => [ 'https://github.com/cristianp6', 'RuneUI Javascript optimizations' ]
	, 'Valerio Battaglia' => [ 'https://github.com/vabatta', 'RuneUI Javascript optimizations' ]
	, 'Frank Friedmann <gr>(aka hondagx35)</gr>' => [ 'https://github.com/hondagx35', 'RuneUI/RuneOS PHP backend code debug, refactoring of network management, RuneOS porting for Cubietruck' ]
	, 'Kevin Welsh <gr>(aka kdubious)</gr>' => [ 'https://github.com/kdubious', 'RuneUI/RuneOS Frontend & backend development' ] 
	, 'Andrea Rizzato <gr>(aka AandreR)</gr>' => [ 'https://github.com/GitAndrer', 'RuneUI/RuneOS PHP backend code debug, integration of Wolfson Audio Card' ]
	, 'Saman' => [ 'http://www.runeaudio.com/forum/member275.html', 'RuneOS RT Linux kernel for Wolfson Audio Card (RaspberryPi)' ]
	, 'Daniele Scasciafratte <gr>(aka Mte90)</gr>' => [ 'https://github.com/Mte90', 'RuneUI Firefox integration' ]
	, 'Francesco Casarsa <gr>(aka CAS)</gr>' => [ 'https://github.com/fcasarsa', 'Shairport patch' ]
);
foreach( $list05 as $name => $value ) {
	$list05html.= '<a href="'.$value[ 0 ].'" target="_blank">'.$name.'</a><span class="help-block hide"> - '.$value[ 1 ].'</span><br>';
}
foreach( $list04 as $name => $value ) {
	$list04html.= '<a href="'.$value[ 0 ].'" target="_blank">'.$name.'</a><span class="help-block hide"> - '.$value[ 1 ].'</span><br>';
}
foreach( $list0103 as $name => $value ) {
	$list0103html.= '<a href="'.$value[ 0 ].'" target="_blank">'.$name.'</a><span class="help-block hide"> - '.$value[ 1 ].'</span><br>';
}
$listruneui = array(
	  'Bootstrap' => [ 'https://getbootstrap.com/' ]
	, 'bootstrap-select' => [ 'https://github.com/snapappointments/bootstrap-select' ]
	, 'HTML5-Color-Picker' => [ 'https://github.com/NC22/HTML5-Color-Picker', 'Rubchuk Vladimir' ]
	, 'jQuery' => [ 'https://jquery.com/' ]
	, 'jQuery.documentSize' => [ 'https://github.com/hashchange/jquery.documentsize', 'Michael Heim' ]
	, 'jQuery Mobile' => [ 'https://jquerymobile.com/' ]
	, 'jquery.qrcode.js' => [ 'https://github.com/jeromeetienne/jquery-qrcode', 'Jerome Etienne' ]
	, 'Lato-Fonts' => [ 'http://www.latofonts.com/lato-free-fonts', 'Lukasz Dziedzic' ]
	, 'LazyLoad' => [ 'https://github.com/verlok/lazyload', 'Andrea Verlicchi' ]
	, 'pica' => [ 'https://github.com/nodeca/pica', 'Nodeca' ]
	, 'roundSlider' => [ 'https://github.com/soundar24/roundSlider', 'Soundar' ]
	, 'Sortable' => [ 'https://github.com/SortableJS/Sortable' ]
);
foreach( $listruneui as $name => $list ) {
	$runeuihtml.= '<br><a href="'.$list[ 0 ].'">'.$name.'</a>';
	if ( $list[ 1 ] ) $runeuihtml.= '<gr> - '.$list[ 1 ].'</gr>';
}
$listruneos = array(
	  'Alac' => [ 'https://github.com/TimothyGu/alac', 'Timothy Gu' ]
	, 'ArchLinuxArm' => [ 'https://www.archlinuxarm.org' ]
	, 'ArchLinux (patch for alsa 384kHz audio support)' => [ 'https://github.com/gearhead', 'Gearhead' ]
	, 'BlueZ' => [ 'http://www.bluez.org' ]
	, 'BlueZ-Alsa' => [ 'https://github.com/Arkq/bluez-alsa' ]
	, 'BlueZ-Utils-Compat' => [ 'href="https://aur.archlinux.org/packages/bluez-utils-compat' ]
	, 'Example ArchLinux patch for alsa 384kHz audio support' => [ 'https://github.com/RoPieee/ropieee-kernel', 'RoPieee' ]
	, 'FFmpeg' => [ 'http://ffmpeg.org' ]
	, 'Hfsprogs' => [ 'http://www.opensource.apple.com' ]
	, 'Hfsutils' => [ 'http://www.opensource.apple.com' ]
	, 'ImageMagick' => [ 'https://imagemagick.org/' ]
	, 'Kid3 - Audio Tagger' => [ 'https://kid3.sourceforge.io/' ]
	, 'LyricsCore' => [ 'https://github.com/Smile4ever/LyricsCore', 'Geoffrey De Belie' ]
	, 'MPD' => [ 'http://www.musicpd.org/', 'Max Kellermann' ]
	, 'NGiNX' => [ 'http://nginx.org' ]
	, 'Nginx Push Stream Module' => [ 'https://github.com/wandenberg/nginx-push-stream-module', 'Wandenberg Peixoto' ]
	, 'PHP' => [ 'http://php.net' ]
	, 'Phpiredis' => [ 'https://github.com/nrk/phpiredis', 'Daniele Alessandri' ]
	, 'Phpredis' => [ 'https://github.com/phpredis', 'Nicolas Favre-Felix, Michael Grunder &amp; Pavlo Yatsukhnenko' ]
	, 'Pi-Bluetooth' => [ 'https://aur.archlinux.org/pi-bluetooth.git' ]
	, 'raspi-rotate' => [ 'https://github.com/colinleroy/raspi-rotate', 'Colin Leroy-Mira' ]
	, 'Redis' => [ 'http://redis.io', 'Salvatore Sanfilippo' ]
	, 'Samba' => [ 'http://www.samba.org' ]
	, 'Shairport' => [ 'https://github.com/abrasive/shairport', 'James &#8220;abrasive&#8221; Laird' ]
	, 'Shairport-sync' => [ 'https://github.com/mikebrady/shairport-sync', 'Mike Brady' ]
	, 'Upmpdcli' => [ 'http://www.lesbonscomptes.com/upmpdcli/upmpdcli.html', 'Jean-Francois Dockes' ]
);
foreach( $listruneos as $name => $list ) {
	$runeoshtml.= '<br><a href="'.$list[ 0 ].'">'.$name.'</a>';
	if ( $list[ 1 ] ) $runeoshtml.= '<gr> - '.$list[ 1 ].'</gr>';
}
?>
<div class="container credits">
	<h3><i class="fa fa-addons"></i> e1.1</h3>
	<a href="https://github.com/rern/">r e r n</a><br>
	<span class="help-block hide">
		System-wide improvements and new settings.<br>
		<br>
		Integrated addons:
		<p class="indent">
		- Addons<br>
		- RuneUI Enhancement<br>
		- RuneUI Lyrics<br>
		- RuneUI Metadata Tag Editor<br>
		- USB DAC Hotplug</p>
		Upgraded:
		<p class="indent">
		- MPD<br>
		- Chromium<br>
		- NGINX<br>
		- Redis<br>
		- Samba<br>
		- Shairport Sync</p>
	</span>
	<h3>Version 0.5</h3>
	<?=$list05html?>
	<h3>Version 0.4</h3>
	<?=$list04html?>
	<h3>Version 0.1 - 0.3</h3>
	<?=$list0103html?>
	<h3>Support us</h3>
	<form id="form-paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
		<input type="hidden" name="cmd" value="_s-xclick">
		<input type="hidden" name="hosted_button_id" value="AZ5L5M5PGHJNJ">
		<input type="image" src="/assets/img/donate.png" name="submit" style="border: none !important">
	</form>
	<h3>License &amp; Copyright</h3>
		<gr>This Program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation either version 3, 
		or (at your option) any later version. This Program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
		See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with RuneAudio; see the file COPYING. 
		If not, see <a href="http://www.gnu.org/licenses/gpl-3.0.txt" target="_blank" rel="nofollow">http://www.gnu.org/licenses/gpl-3.0.txt</a></gr>
	<p>
		Copyright (C) 2013-2014 RuneAudio Team <gr>- Andrea Coiutti &amp; Simone De Gregori &amp; Carmelo San Giovanni</gr><br>
		RuneUI <gr>- copyright (C) 2013-2014 – Andrea Coiutti (aka ACX) &amp; Simone De Gregori (aka Orion)</gr><br>
		RuneOS <gr>- copyright (C) 2013-2014 – Simone De Gregori (aka Orion) &amp; Carmelo San Giovanni (aka Um3ggh1U)</gr>
	</p>
	<h3>RuneUI</h3>
	<gr><i>(In alphabetical order, credits for all versions included)</i></gr><br>
	<?=$runeuihtml?>
	<br>
	<h3>RuneOS</h3>
	<gr><i>(In alphabetical order, credits for all versions included)</i></gr><br>
	<?=$runeoshtml?>
	<br>
	<br><gr><i>Please contact us if you think we have forgotten someone</i></gr>
</div>
