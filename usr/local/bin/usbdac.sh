#!/bin/bash

! systemctl -q is-active mpd && exit

if (( $# > 0 )); then
	name=$( aplay -l | grep card | tail -1 | awk -F'[][]' '{print $2}' )
	/srv/http/settings/mpdconf.sh
else
	sysname=$( redis-cli get ao )
	file="/srv/http/settings/dac/$sysname"
	[[ -e "$file" ]] && name=$( grep extlabel "$file" | cut -d: -f2- ) || name="$sysname"
fi

curl -s -X POST 'http://localhost/pub?id=notify' -d '{ "title": "Audio Output Switched", "text": "'"$name"'", "icon": "output" }'
