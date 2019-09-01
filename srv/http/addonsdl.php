<?php
exec( '/usr/bin/sudo /usr/bin/wget -q --no-check-certificate https://github.com/rern/RuneAudio_Addons/raw/master/srv/http/addonslist.php -O /srv/http/addonslist.php', $output, $exit );
echo $exit;
