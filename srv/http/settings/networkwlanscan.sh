#!/bin/bash

[[ -n $1 ]] && wlan=$1 || wlan=wlan0

ifconfig $wlan up

stored=$( netctl list | grep -v eth | sed 's/^\s*//' )
readarray -t stored <<<"$stored"

connectedssid=$( iwgetid $wlan -r )

scan=$( iwlist $wlan scan | grep '^\s*Qu\|^\s*En\|^\s*ES\|WPA' | sed 's/^\s*//' )
readarray -t lines <<<"$scan"
for line in "${lines[@]}"; do
	ini=${line:0:2}
	if [[ $ini == Qu ]]; then
		if [[ $ssid ]] && (( $quality > 35 )); then
			list="$list$quality^^$db^^$ssid^^$encryption^^$wpa^^$connected^^$wlan^^$profile^^$gwip\n"
		fi
		quality=
		encryption=
		wpa=
		ssid=
		profile=
		quality=( $( echo $line | sed 's/\s\+.*=/ /; s/^.*=//' ) )
		quality=${quality[0]}
		db=${quality[1]}
		quality=${quality/\/*/}
	elif [[ $ini == En ]]; then
		encryption=$( echo $line | cut -d':' -f2 )
	elif echo $line | grep -q WPA; then
		wpa=wpa
	elif [[ $ini == ES ]]; then
		ssid=$( echo $line | cut -d':' -f2 )
		ssid=${ssid:1:-1}
		if [[ $ssid == $connectedssid ]]; then
			connected=connected
			gwip=$( ip r | grep "default.*$wlan" | awk '{print $3"^^"$9}' )
		else
			connected=
			gwip=
		fi
		for st in "${stored[@]}"; do
			[[ $ssid == $st ]] && profile=stored
		done
	fi
done
# last one
if [[ $ssid ]] && (( $quality > 35 )); then
	list="$list$quality^^$ssid^^$encryption^^$wpa^^$connect^^$wlan"
fi
list=$( echo -e "$list" | sort -r )

printf "$list"
