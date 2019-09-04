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
	if (( i > 10 )); then
		curl -s -X POST 'http://localhost/pub?id=notify' -d '{ "title": "USB Drive", "text": "No USB drive found.", "icon": "usbdrive" }'
		break
	fi
done

if [[ -e /srv/http/runonce.sh ]]; then
	runonce=1
	/srv/http/runonce.sh
fi

systemctl start redis
sleep 1

/srv/http/settings/mpdconf.sh
# mpd mpdidle start here

audiooutput=$( redis-cli get audiooutput )
if [[ -z $audiooutput ]] || ! mpc outputs | grep -q "$audiooutput"; then
	redis-cli set audiooutput "$( mpc outputs | head -1 | awk -F"[()]" '{print $2}' )"
fi

/srv/http/settings/soundprofile.sh $( redis-cli get orionprofile )

[[ $( redis-cli get mpd_autoplay ) == 1 ]] && mpc -q play

sleep 15 # wait for network interfaces

if ! grep '^dtoverlay=pi3-disable-wifi' /boot/config.txt; then
	if redis-cli exists accesspoint; then
		ifconfig wlan0 $( grep router /etc/dnsmasq.conf | cut -d, -f2 )
		systemctl start dnsmasq hostapd
		[[ $runonce ]] && curl -s -X POST 'http://localhost/pub?id=reload' -d '{ "content": "runonce" }'
	fi
	
	sleep 15
	
	wlans=$( ifconfig | grep '^wl' | cut -d: -f1 )
	for wlan in $wlans; do
		iw $wlan set power_save off
	done
fi

/srv/http/addonsupdate.sh &

exit 0
