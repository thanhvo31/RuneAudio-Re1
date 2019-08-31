#!/bin/bash

# change version number in RuneAudio_Addons/srv/http/addonslist.php

alias=rre1

. /srv/http/addonstitle.sh

installstart $@

getinstallzip

# no verify ###################################
ao=$( redis-cli get ao )
[[ -n $ao ]] && redis-cli set audiooutput "$ao"
redis-cli del AccessPoint activePlayer ao ao0 dirble librandom mixer_type &> /dev/null
redis-cli hdel addons enha expa font kid3 lyri motd udac &> /dev/null

rm -f /srv/http/{Gruntfile.js,package.json,lyricscontainer.php}
rm -f /srv/http/assets/js/addonsmenu.js
rm -f /srv/http/assets/js/vendor/{bootstrap-contextmenu*,bootstrap-select.min.js}

sed -i 's/gpu_mem=16/gpu_mem=32/' /boot/config.txt
# need verify ######################################
if systemctl -q is-enabled hostapd; then
	systemctl disable hostapd dnsmasq
	redis-cli set accesspoint 1
fi

if ! grep '^mixer_type' /etc/mpd.conf; then
	mixertype=$( grep mixer_type /etc/mpd.conf | head -1 | cut -d'"' -f2 )
	sed -i -e '/mixer_type/ d
	' -e '/max_connections/ a\mixer_type              "'$mixertype'"
	' /etc/mpd.conf
fi

# fix missing locations by systemd upgrade
[[ -L /etc/resolv.conf ]] || ln -sf /{run/systemd/resolve,etc}/resolv.conf
sed -i 's|/var/run|/run|' /usr/lib/tmpfiles.d/bluealsa.conf
sed -i 's|/var/run|/run|' /usr/lib/tmpfiles.d/samba.conf 

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
