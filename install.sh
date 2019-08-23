#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

rm -f /srv/http/{Gruntfile.js,package.json} /srv/http/assets/js/vendor/bootstrap-contextmenu*

file="$( ls -d /mnt/MPD/USB/*/ ).mpdignore"
if [[ ! -e "$file" ]]; then
echo 'bookmarks
coverarts
lyrics
mpd
playlists
redis
tmp
webradiopl
webradios' > "$file"
fi

setColor

installfinish $@

restartlocalbrowser
