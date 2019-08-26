<?php
$redis = new Redis();
$redis->pconnect( '127.0.0.1' );
$ao = $redis->get( 'ao' );
$dop = $redis->get( 'dop' ) ? 'checked' : '';
$novolume = $redis->get( 'novolume' ) == 1 ? 'checked' : '';
$autoplay = $redis->get( 'mpd_autoplay' );

exec( "mpc outputs | grep '^Output' | awk -F'[()]' '{print $2}'", $outputs );
foreach( $outputs as $output ) {
	$index = exec( $sudo.'/aplay -l | grep "'.preg_replace( '/_.$/', '', $output ).'" | cut -c6' );
	$extlabel = exec( "$sudo/grep extlabel \"/srv/http/settings/i2s/$output\" | cut -d: -f2" );
	$mixer = $redis->hGet( 'mixer_type', $output );
	if ( !$mixer ) $mixer = exec( "$sudo/sed -n '/$output/,/mixer_type/ p' /etc/mpd.conf | grep mixer_type | cut -d'\"' -f2" );
	$routecmd = exec( "$sudo/grep route_cmd \"/srv/http/settings/i2s/$output\" | cut -d: -f2" );
	$selected = $output === $ao ? 'selected' : '';
	$htmlacards.= '<option value="'.$output.'" data-index="'.$index.'" data-mixer="'.$mixer.'" data-routecmd="'.$routecmd.'" '.$selected.'>'.( $extlabel ?: $output ).'</option>';
}
$crossfade = exec( "$sudo/mpc crossfade | cut -d' ' -f2" );
$normalization = exec( "$sudo/grep 'volume_normalization' /etc/mpd.conf | cut -d'\"' -f2" );
$replaygain = exec( "$sudo/mpc replaygain | cut -d' ' -f2" );
$autoupdate = exec( "$sudo/grep 'auto_update' /etc/mpd.conf | cut -d'\"' -f2" );
$ffmpeg = exec( "$sudo/sed -n '/ffmpeg/ {n;p}' /etc/mpd.conf | cut -d'\"' -f2" );
?>
<div class="container">
	<form class="form-horizontal">
		<h3>Audio Output</h3>
		<div class="form-group">
			<label class="col-sm-2 control-label">Inferface</label>
			<div class="col-sm-10">
				<select id="audiooutput" class="selectpicker" data-style="btn-default btn-lg">
					<?=$htmlacards?>
				</select><br>
				<i id="setting-audiooutput" class="setting select fa fa-gear"></i>
				<span class="help-block hide">Switch output between audio interfaces. Each volume level control, hardware or software, was set by its driver unless manually set by users.</span>
			</div>
		</div>
	</form>
	<form class="form-horizontal">
		<h3>Bit-perfect</h3>
		<div class="form-group">
			<label class="control-label col-sm-2">DSD over PCM</label>
			<div class="col-sm-10">
				<input id="dop" type="checkbox" <?=$dop?>>
				<label class="switchlabel" for="dop"></label>
				<span class="help-block hide">For DSD-capable devices without drivers dedicated for native DSD. DoP can be decoded by DSD-capable devices only. Any devices can play DSD files without DoP enabled.
					<br>DoP will repack 16bit DSD stream into 24bit PCM frames and transmit to the DAC. 
					Then PCM frames will be reassembled back to original DSD stream, COMPLETELY UNCHANGED, with expense of double bandwith.
					Otherwise DSD will be converted to PCM stream.<br>
					Note: On-board audio will always get converted DSD.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">No volume</label>
			<div class="col-sm-10">
				<input id="novolume" type="checkbox" <?=$novolume?>>
				<label class="switchlabel" for="novolume"></label>
				<span class="help-block hide">Disable all volume manipulations for bit-perfect stream.<br>
				Use hardware volume, resister type in DAC, to control level only if it's better than amplifier volume.</span>
			</div>
		</div>
	</form>
	<form id="volume" class="form-horizontal <?=( $novolume === 'checked' ? 'hide' : '' )?>">
		<h3>Volume</h3>
		<div class="form-group">
			<label class="control-label col-sm-2">Crossfade</label>
			<div class="col-sm-10">
				<input id="crossfade" class="switch" type="checkbox" value="<?=$crossfade?>" <?=( $crossfade == 0 ? '' : 'checked' )?>>
				<label class="switchlabel" for="crossfade"></label>
				<i id="setting-crossfade" class="setting fa fa-gear <?=( $crossfade == 0 ? 'hide' : '' )?>"></i>
				<span class="help-block hide">Fade-out to fade-in between songs.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Normalization</label>
			<div class="col-sm-10">
				<input id="normalization" type="checkbox" <?=( $normalization === 'no' ? '' : 'checked' )?>>
				<label class="switchlabel" for="normalization"></label>
				<span class="help-block hide">Normalize the volume level of songs as they play.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Replay gain</label>
			<div class="col-sm-10">
				<input id="replaygain" type="checkbox" data-replaygain="<?=$replaygain?>" <?=( $replaygain === 'off' ? '' : 'checked' )?>>
				<label class="switchlabel" for="replaygain"></label>
				<i id="setting-replaygain" class="setting fa fa-gear <?=( $replaygain === 'off' ? 'hide' : '' )?>"></i>
				<span class="help-block hide">Set gain control to setting in replaygain tag. Currently only FLAC, Ogg Vorbis, Musepack, and MP3 (through ID3v2 ReplayGain tags, not APEv2) are supported.</span>
			</div>
		</div>
	</form>
	<form class="form-horizontal">
		<h3>Options</h3>
		<div class="form-group">
			<label class="control-label col-sm-2">Auto update</label>
			<div class="col-sm-10">
				<input id="autoupdate" type="checkbox" <?=( $autoupdate === 'no' ? '' : 'checked' )?>>
				<label class="switchlabel" for="autoupdate"></label>
				<span class="help-block hide">Automatic update MPD database when files changed.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">FFmpeg</label>
			<div class="col-sm-10">
				<input id="ffmpeg" type="checkbox" <?=( $ffmpeg === 'no' ? '' : 'checked' )?>>
				<label class="switchlabel" for="ffmpeg"></label>
				<span class="help-block hide">FFmpeg decoder for AAC / ALAC. Disable if not used for faster database update.</span>
			</div>
		</div>
		<div class="form-group">
			<label class="control-label col-sm-2">Play on startup</label>
			<div class="col-sm-10">
				<input id="autoplay" type="checkbox" <?=( $autoplay == 0 ? '' : 'checked' )?>>
				<label class="switchlabel" for="autoplay"></label>
				<span class="help-block hide">Start playing automatically after boot.</span>
			</div>
		</div>
	</form>
</div>
