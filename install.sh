#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

redis-cli hdel addons font lyri udac kid3 expa motd enha &> /dev/null
redis-cli set novolume 0 &> /dev/null

rm -f /srv/http/{Gruntfile.js,package.json} \
/srv/http/assets/js/vendor/{bootstrap-contextmenu*,bootstrap-select.min.js}

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
