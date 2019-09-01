<div class="container">
	<br>
	<h3noline>USB and NAS&ensp;<i id="addnas" class="fa fa-plus-circle"></i></h3noline>
	<ul id="list" class="entries" data-uid="<?=( exec( "$sudo/id -u mpd" ) )?>" data-gid="<?=( exec( "$sudo/id -g mpd" ) )?>"></ul>
	<p class="brhalf"></p>
	<span class="help-block hide">
		USB drive will be found and mounted automatically.<br>
		Network shares must be manually configured.</span>
	<br>
	<h3>Library&ensp;<i id="updating" class="fa fa-library blink hide"></i></h3>
	<form class="form-horizontal"> 
		<div class="form-group">
			<label class="control-label col-sm-2">Database</label>
			<div class="col-sm-10">
				<a class="btn btn-lg btn-primary" id="update" data-db="<?=( file_exists( '/var/lib/mpd/mpd.db' ) )?>">Update</a>
				<span class="help-block hide">
					Update Library database when music files or metadata were changed to make them available.<br>
					Choose "Rebuild database" option only when necessary or for initial update. It will scan all files which could be a lot longer than "Only changed data".<br>
					Disable FFmpeg if not used speed up update significantly.
				</span>
			</div>
		</div>
	</form>
</div>
