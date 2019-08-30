#!/bin/bash

grep -q '^#dtoverlay=pi3-disable-bt' /boot/config.txt && bluetooth=1 || bluetooth=0
grep -q 'dtparam=audio=on' /boot/config.txt && onboardaudio=on || onboardaudio=off
grep -q '^disable_overscan=1' /boot/config.txt && overscan=0 || overscan=1
grep -q '^#dtoverlay=pi3-disable-wifi' /boot/config.txt && wlan=1 || wlan=0
file='/etc/X11/xorg.conf.d/99-raspi-rotate.conf'
[[ -e $file ]] && rotate=$( grep rotate $file | cut -d'"' -f4 ) || rotate=NORMAL
xinitrc=/etc/X11/xinit/xinitrc

data+=' "airplay":"'$( systemctl is-active shairport-sync )'"'
data+=',"bluetooth":"'$bluetooth'"'
data+=',"cursor":"'$( grep cursor $xinitrc | cut -d' ' -f3 )'"'
data+=',"date":"'$( date +'%F<gr> &bull; </gr>%R' )'"'
data+=',"dlna":"'$( systemctl is-active upmpdcli )'"'
data+=',"globalrandom":"'$( systemctl is-active ashuffle )'"'
data+=',"hardware":"'$( tr -d '\0' < /sys/firmware/devicetree/base/model )'"'
data+=',"hostapd":"'$( systemctl is-active hostapd )'"'
data+=',"ipwebuiap":"'$( grep 'router' /etc/dnsmasq.conf | cut -d',' -f2 )'"'
data+=',"kernel":"'$( uname -r )'"'
data+=',"localbrowser":"'$( systemctl is-active local-browser )'"'
data+=',"onboardaudio":"'$onboardaudio'"'
data+=',"overscan":"'$overscan'"'
data+=',"passphrase":"'$( grep '^wpa_passphrase' /etc/hostapd/hostapd.conf | cut -d'=' -f2 )'"'
data+=',"queowner":"'$( grep '^ownqueue' /etc/upmpdcli.conf | cut -d' ' -f3 )'"'
data+=',"readonlysd":"'$( sed -n '/.mnt.MPD.LocalStorage/ {n;p}' /etc/samba/smb.conf | tr -d '\t' )'"'
data+=',"readonlyusb":"'$( sed -n '/.mnt.MPD.USB/ {n;p}' /etc/samba/smb.conf | tr -d '\t' )'"'
data+=',"rotate":"'$rotate'"'
data+=',"samba":"'$( systemctl is-active smb )'"'
data+=',"screenoff":"'$( grep 'xset dpms .*' $xinitrc | cut -d' ' -f5 )'"'
data+=',"since":"'$( uptime -s | cut -d: -f1-2 | sed 's| |<gr> \&bull; </gr>|' )'"'
data+=',"timezone":"'$( timedatectl | grep zone: | awk '{print $3}' )'"'
data+=',"uptime":"'$( uptime -p | cut -d' ' -f2- | tr -d ',' )'"'
data+=',"wlan":"'$wlan'"'
data+=',"zoom":"'$( grep factor $xinitrc | cut -d'=' -f3 )'"'

echo -e "{$data}"
