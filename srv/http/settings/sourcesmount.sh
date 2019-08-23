#!/bin/bash

mountpoint=$1
ip=$2
source=$3
cifsnfs=$4
options=$5

! ping -c 1 -w 1 $ip &> /dev/null && echo 'IP not found.' && exit

[[ -e "$mountpoint" ]]  && echo 'Mount name already exists.' && exit

mkdir -p "$mountpoint"
chown mpd:audio "$mountpoint"
[[ -n $options ]] && optmount="-o $options"
mount -t $cifsnfs "$source" "$mountpoint" $optmount
if ! mountpoint -q "$mountpoint"; then
	echo 'Mount failed.'
	rmdir "$mountpoint"
	exit
fi

source=${source// /\\040}         # escape spaces in fstab
mountpoint=${mountpoint// /\\040}
[[ -n $options ]] && optfstab=",$options"
cat << EOF >> /etc/fstab
$source $mountpoint $cifsnfs x-systemd.automount$optfstab 0 0
EOF
