#!/bin/bash

if (( $# > 0 )); then
	sudo systemctl start mpd
	sudo /srv/http/enhanceidle
	sudo curl -s -X POST 'http://localhost/pub?id=airplay' -d 0
else
	sudo killall enhanceidle
	sudo systemctl stop mpd
	sudo curl -s -X POST 'http://localhost/pub?id=airplay' -d 1
fi
