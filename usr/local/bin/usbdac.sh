#!/bin/bash

/srv/http/settings/mpdconf.sh

if (( $# > 0 )); then
	name=$( aplay -l | grep card | tail -1 | awk -F'[][]' '{print $2}' )
	ao0=$( redis-cli get ao )
	redis-cli mset ao0 "$ao0" ao "$name"
else
	name=$( redis-cli get ao0 )
	redis-cli set ao "$name"
	file="/srv/http/settings/i2s/$name"
	[[ -e "$file" ]] && name=$( grep extlabel "$file" | cut -d: -f2- )
fi

curl -s -X POST 'http://localhost/pub?id=notify' -d '{ "title": "Audio Output Switched", "text": "'"$name"'", "icon": "output" }'
