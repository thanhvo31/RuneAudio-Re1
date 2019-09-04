#!/bin/bash

[[ -n $1 ]] && wlan=$1 || wlan=wlan0

ifconfig $wlan up

stored=$( netctl list | grep -v eth | sed 's/^\s*\**\s*//' )
readarray -t stored <<<"$stored"
# pre-scan saved profile to force display hidden ssid
for st in "${stored[@]}"; do
	grep -q '^Hidden=yes' "/etc/netctl/$st" && iwlist $wlan scan essid "$st" &> /dev/null
done

connectedssid=$( iwgetid $wlan -r )

scan=$( iwlist $wlan scan | grep '^\s*Qu\|^\s*En\|^\s*ES\|WPA' | sed 's/^\s*//' )
readarray -t lines <<<"$scan"
for line in "${lines[@]}"; do
	ini=${line:0:2}
	if [[ $ini == Qu ]]; then
		if [[ -n $ssid ]]; then
			list="$list$db^^$ssid^^$encryption^^$wpa^^$wlan^^$connected^^$profile^^$gw_ip\n"
		fi
		signal=
		quality=
		db=
		ssid=
		encryption=
		wpa=
		profile=
		db=$( echo $line | cut -d= -f3 )
	elif [[ $ini == En ]]; then
		encryption=$( echo $line | cut -d':' -f2 )
	elif echo $line | grep -q WPA; then
		wpa=wpa
	elif [[ $ini == ES ]]; then
		ssid=$( echo $line | cut -d':' -f2 )
		ssid=${ssid:1:-1}
		if [[ $ssid == $connectedssid ]]; then
			connected=connected
			gw_ip=$( ip r | grep "default.*$wlan" | awk '{print $3"^^"$9}' )
		else
			connected=
			gw_ip=
		fi
		for st in "${stored[@]}"; do
			[[ $ssid == $st ]] && profile=stored
		done
	fi
done
# last one
if [[ -n $ssid ]]; then
	list="$list$db^^$ssid^^$encryption^^$wpa^^$wlan^^$connected^^$profile^^$gw_ip"
fi

list=$( echo -e "$list" | awk NF | sort )

printf -- "$list"
