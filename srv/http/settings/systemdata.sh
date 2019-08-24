#!/bin/bash
data+='{"kernel":"'$( uname -r )'"'
data+='\n,"hardware":"'$( tr -d '\0' < /sys/firmware/devicetree/base/model )'"'
data+='\n,"date":"'$( date +'%F<gr> &bull; </gr>%R' )'"'
data+='\n,"uptime":"'$( uptime -p | cut -d' ' -f2- | tr -d ',' )'"'
data+='\n,"since":"'$( uptime -s | cut -d: -f1-2 | sed 's| |<gr> \&bull; </gr>|' )'"'
data+='\n,"timezone":"'$( timedatectl | grep zone: | awk '{print $3}' )'"'
data+='\n,"onboardaudio":"'$( grep 'dtparam=audio=' /boot/config.txt | cut -d= -f3 )'"'
data+='\n,"hostapd":"'$( systemctl is-active hostapd )'"'
data+='\n,"passphrase":"'$( grep '^wpa_passphrase' /etc/hostapd/hostapd.conf | cut -d'=' -f2 )'"'
data+='\n,"ipwebuiap":"'$( grep 'router' /etc/dnsmasq.conf | cut -d',' -f2 )'"'
data+='\n,"airplay":"'$( systemctl is-active shairport-sync )'"'
data+='\n,"globalrandom":"'$( systemctl is-active ashuffle )'"'
data+='\n,"localbrowser":"'$( systemctl is-active local-browser )'"'
data+='\n,"samba":"'$( systemctl is-active smb )'"'
data+='\n,"readonlyusb":"'$( sed -n '/.mnt.MPD.USB/ {n;p}' /etc/samba/smb.conf | tr -d '\t' )'"'
data+='\n,"readonlysd":"'$( sed -n '/.mnt.MPD.LocalStorage/ {n;p}' /etc/samba/smb.conf | tr -d '\t' )'"'
data+='\n,"dlna":"'$( systemctl is-active upmpdcli )'"'
data+='\n,"queowner":"'$( grep '^ownqueue' /etc/upmpdcli.conf | cut -d' ' -f3 )'"'
grep '^#dtoverlay=pi3-disable-bt' /boot/config.txt && bluetooth=1 || bluetooth=0
data+='\n,"bluetooth":"'$bluetooth'"'
grep -q '^#dtoverlay=pi3-disable-wifi' /boot/config.txt && wlan=1 || wlan=0
data+='\n,"wlan":"'$wlan'"'
file=/etc/X11/xinit/xinitrc
data+='\n,"zoom":"'$( grep factor $file | cut -d'=' -f3 )'"'
data+='\n,"screenoff":"'$( grep 'xset dpms .*' $file | cut -d' ' -f5 )'"'
data+='\n,"cursor":"'$( grep cursor $file | cut -d' ' -f3 )'"'
file='/etc/X11/xorg.conf.d/99-raspi-rotate.conf'
[[ -e $file ]] && rotate=$( grep rotate $file | cut -d'"' -f4 ) || rotate=NORMAL
data+='\n,"rotate":"'$rotate'"'
grep -q '^disable_overscan=1' /boot/config.txt && overscan=0 || overscan=1
data+='\n,"overscan":"'$overscan'"}'

echo -e "$data"
