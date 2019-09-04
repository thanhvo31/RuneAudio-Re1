#!/bin/bash

. /srv/http/addonstitle.sh

webradiodir=/srv/http/assets/img/webradios
allfiles=$( find /mnt/MPD/Webradio -type f )

if [[ -z $allfiles ]]; then
	title "$info No webradio files found in $( tcolor /mnt/MPD/Webradio )"
	exit
fi

readarray -t files <<<"$allfiles"
for file in "${files[@]}"; do
	if [[ ${file##*.} == pls ]]; then
		name=$( grep "^Title$i" "$file" | cut -d '=' -f2 )
		url=$( grep "^File$i" "$file" | cut -d '=' -f2 )
		# no name
		[[ -z $name ]] && name="noName"
		printf "%-30s : $url\n" "$name"
		
		echo $name > $webradiodir/${url//\//|/}
	else
		# *.m3u
		cat $file | while read line; do
			[[ ${line:0:4} != http ]] && continue
			
			linenohttp=${line:7}
			if [[ $linenohttp =~ '/' ]]; then
				filename=${linenohttp##*/}
				name=${filename%.*}
			else
				name="noName"
			fi
			printf "%-30s : $line\n" "$name"
			
			echo $name > $webradiodir/${line//\//|/}
		done
	fi
done

title "$bar Import webradios successfully."
