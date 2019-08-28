#!/bin/bash

/srv/http/settings/mpdconf.sh

if (( $# > 0 )); then
	name=$( aplay -l | grep card | tail -1 | awk -F'[][]' '{print $2}' )
	audiooutput0=$( redis-cli get audiooutput )
	redis-cli mset audiooutput0 "$audiooutput0" audiooutput "$name"
else
	name=$( redis-cli get audiooutput0 )
	redis-cli set audiooutput "$name"
	file="/srv/http/settings/i2s/$name"
	[[ -e "$file" ]] && name=$( grep extlabel "$file" | cut -d: -f2- )
fi

curl -s -X POST 'http://localhost/pub?id=notify' -d '{ "title": "Audio Output Switched", "text": "'"$name"'", "icon": "output" }'
