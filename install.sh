#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

mixertype=$( grep mixer_type /etc/mpd.conf | head -1 | cut -d'"' -f2 )
sed -i -e '/mixer_type/ d
' -e '/max_connections/ a\mixer_type              "'$mixertype'"
' /etc/mpd.conf

redis-cli hdel addons font lyri udac kid3 expa motd enha &> /dev/null
redis-cli del AccessPoint activePlayer dirble mixer_type updatestart &> /dev/null

rm -f /srv/http/{Gruntfile.js,package.json} /srv/http/assets/js/vendor/{bootstrap-contextmenu*,bootstrap-select.min.js}

file="$( ls -d /mnt/MPD/USB/*/ ).mpdignore"
if [[ ! -e "$file" ]]; then
echo 'bookmarks
coverarts
gpio
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
