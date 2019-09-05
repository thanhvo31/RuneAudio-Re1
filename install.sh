#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

! grep -q replaygain /etc/mpd.conf && sed -i '/^port/ a\replaygain              "off"' /etc/mpd.conf

setColor

installfinish $@

restartlocalbrowser
