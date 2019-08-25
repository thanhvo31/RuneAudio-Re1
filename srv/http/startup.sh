#!/bin/bash

# 0. wait for usb mount 5 sec
# 1. start redis
# 2. mpdconf.sh
#   - probe sound devices
#   - populate mpd.conf
#   - start mpd, mpdidle
# 3. set mpd sound device
# 4. set sound profile
# 5. auto play
# 6. check addons update
# 7. disable wlan power saving

while $( sleep 1 ); do
	grep -q '/mnt/MPD/USB' /proc/mounts && break
	
	(( i++ ))
	if (( i > 5 )); then
		curl -s -X POST 'http://localhost/pub?id=notify' -d '{ "title": "USB Drive", "text": "No USB drive found.", "icon": "usbdrive" }'
		break
	fi
done

systemctl start redis
sleep 1

/srv/http/settings/mpdconf.sh
# mpd mpdidle start here

ao=$( redis-cli get ao )
if [[ -z $ao ]] || ! mpc outputs | grep -q "$ao"; then
	redis-cli set ao "$( mpc outputs | head -1 | awk -F'[()]' '{print $2}' )"
fi

/srv/http/settings/soundprofile.sh $( redis-cli get orionprofile )

[[ $( redis-cli get mpd_autoplay ) == 1 ]] && mpc -q play

/srv/http/addonsupdate.sh &

wlans=$( ifconfig | grep '^wl' | cut -d: -f1 )
for wlan in $wlans; do
	iw $wlan set power_save off
done

exit 0
