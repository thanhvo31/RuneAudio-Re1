#!/bin/bash

webradiodir=/srv/http/assets/img/webradios
allfiles=$( find /mnt/MPD/Webradio -type f )
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
