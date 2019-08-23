#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

rm -f /srv/http/{Gruntfile.js,package.json} /srv/http/assets/js/vendor/bootstrap-contextmenu*

echo 'bookmarks
coverarts
lyrics
Movies
mpd
playlists
redis
tmp
webradiopl
webradios' >> $( ls -d /mnt/MPD/USB/*/ ).mpdignore

setColor

installfinish $@

restartlocalbrowser
