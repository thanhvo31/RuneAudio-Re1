#!/bin/bash

# run on startup and usb dac detected

aplay=$( aplay -l | grep '^card' )

# reenable on-board audio if nothing available for aplay
if [[ -z $aplay ]]; then
	sed -i 's/dtparam=audio=.*/dtparam=audio=on/' /boot/config.txt
	shutdown -r now
fi

file=/etc/mpd.conf
mpdconf=$( sed '/audio_output/,/}/ d' $file ) # remove all outputs

readarray -t lines <<<"$aplay"
for line in "${lines[@]}"; do
	device=$( echo $line | sed 's/card \(.*\):.*device \(.*\):.*/hw:\1,\2/' )
	index=${device:3:1}
	subdevice=${device: -1}
	name=$( echo $line | awk -F'[][]' '{print $2}' )
	nameL=$( echo "$aplay" | grep "$name" | wc -l )
	if (( $nameL > 1 ));then
		sysname="$name"_$(( subdevice + 1 ))
	else
		sysname=$name
	fi
	i2sfile="/srv/http/settings/i2s/$sysname"
	[[ -e "$i2sfile" ]] && mixer_control=$( grep mixer_control "$i2sfile"  | cut -d: -f2- )
	
	mpdconf+='

audio_output {
	name              "'$sysname'"
	device            "'$device'"
	type              "alsa"
	auto_resample     "no"
	auto_format       "no"'
	
	if [[ -n $mixer_control ]]; then
		mixer_type=hardware
		
		mpdconf+='
	mixer_control     "'$mixer_control'"
	mixer_device      "hw:'$index'"'
	
	else
		mixer_type=software
	fi
	[[ $( redis-cli get mixer_type ) == none ]] && mixer_type=none
	
	mpdconf+='
	mixer_type        "'$mixer_type'"'
	
	if [[ $( redis-cli get dop ) == 1 ]]; then
		mpdconf+='
	dop               "yes"'
	fi
	
	mpdconf+='
}'

done

echo "$mpdconf" > $file

systemctl restart mpd mpdidle
