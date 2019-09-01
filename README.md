RuneAudio+R e1
---
*(Tested on RPi 2B, 3B)*

### An improved version of RuneAudio.
- Complete frontend redesigned
- Leaner revised backend
- Improved performance and response
- Extra features of RuneUI Enhancement

![playback](https://github.com/rern/_assets/raw/master/RuneUI_enhancement/xtreme/playback.gif)

### Integrated addons and upgraded packages.
- Addons
- RuneUI Enhancement
- RuneUI Lyrics
- RuneUI Metadata Tag Editor
- USB DAC Hot Plug
- Chromium 76.0.3809.132
- MPD 0.21.14
- NGINX 1.14
- Redis 5.0.5
- Samba 4.10.6
- Shairport Sync 3.3.2

### Download
- Image file: [RuneAudio+R_e1.1.img.xz](https://www.mediafire.com/file/kbkxcaap19gkrh8/RuneAudio+R_e1.1.img.xz/file)
- Decompress to **RuneAudio+R_e1.1.img** with [7-zip](https://www.7-zip.org/), [WinRAR](https://www.rarlab.com/download.htm) or [WinZip](https://www.winzip.com/win/en/]WinZip)
- Write the file to a micro SD card, 4GB or more, with something like [Win32 Disk Imager](https://sourceforge.net/projects/win32diskimager/).

### Before power on
- New users:
	- Connect a TV/monitor and a mouse to RPi.
	- Connect wired LAN to RPi if available.
- A USB drive in the system is strongly recommended.
	- For persistent data and Library databases.
	- Extra directories in NAS must be imported manually.
	- If music files are in NAS only, plug in a small USB thumb drive for extra directories, 1GB is more than enough.

(New users: skip this migration.)  
- Migrate existing data if it had taken a long time to build.
	- Library database
		- Create directory /mnt/MPD/USB/<label>/mpd (or USB root on PC)
		- Copy /var/lib/mpd/mpd.db to this directory
	- NAS based RuneUI Enhancement extra directories
		- Copy the directories to /mnt/MPD/USB/<label>/ (or USB root on PC): bookmarks, coverarts, lyrics, playlists webradiopl and webradios
	
### Run automatically on initial boot
- Greeting dialog with options for new user to go to Network page
- Expand micro SD card partition to full.
- Import extra directories or create new ones if not exist.
- Update MPD library if migrate database not exist.

### Recommendations
- User interface for minimalists
	- Menu > Playback Tools:
	- Hide top-bottom bars, Time, Volume, Buttons 
	- Enable Large coverart
	- Use Coverart for playback controls instead - tap top-center of Coverart for guide.
- Settings > Library Tools:
	- Hide unused blocks, text Label
	- Drag Library home blocks to arrange order
- Best sound quality:
	- Enable Bit-perfect.
	- Use only amplifier volume.
- RPi to router connection:
	- With wired LAN if possible.
	- Use Wi-Fi instead of wired LAN if necessary.
	- Less than optimum Wi-Fi slow down everything.
	- With RPi accesspoint only if there's no router/Wi-Fi to connect.
- Connect to RuneAudio with IP address instead of runeaudio.local
	- Get IP address: Settings > Network > Network Interfaces list
	- Set reserved IP for RPi on router to a fixed address.
- Disable if not use:
	- Bluetooth
	- Wi-Fi
	- Access point
	- AirPlay
	- Browser on RPi
	- File sharing
	- Password login
	- uPnP / DLNA
---

## Features

### UI Frontend
- RuneUI Enhancement

### Settings Backend
- Enable / disable / options: applied immediately, no more Ok buttons.
- No reboot needed. (except enable/disable audio devices)
- Options visible/accessible only when features enabled.
- Toggle descriptions with question mark button.

**MPD**
- I2S audio output selected automatically after setup in System and reboot.
- Hardware/software volume set automatically. (optional: software, none)
- Bit-perfect setting.

**Sources**
- Improved mount / unmount / remount / remove mount

**Network**
- Improved status info
- Complete IP address info with QR codes.
- Wi-Fi:
	- Faster scan available Wi-Fi.
	- Icons indicate signal level.
	- Improved connect / reconnect / forget
	
**System**
- Unified hostname for all services: System, Access point, AirPlay, Samba, uPnP/DLNA
- i2s module setup with auto select MPD output on reboot
- Wi-Fi and Bluetooth disable option
- Samba option to set write permissions
- Faster scan available Wi-Fi.
- Icons indicate signal level.
- Improved connect / reconnect / forget

**System**
- Unified hostname for all services: System, Access point, AirPlay, Samba, uPnP/DLNA
- i2s module setup with auto select MPD output on reboot
- Wi-Fi and Bluetooth disable option
- Samba option to set write permissions
