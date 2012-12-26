#!/bin/bash
cd /home/8bit/www_node/
pidfile="pull.pid"
if [ -e $pidfile ]; then
pid=`cat $pidfile`
if ps -p $pid > /dev/null 2>&1; then
echo "Pull is still running."
exit 1
else
rm $pidfile
fi
fi

echo $$ > $pidfile

# useful stuff goes after this line

echo "Pulling..."
cd /home/8bit/www_node/
/usr/bin/git pull

if [ $? -eq 0 ]; then
echo "Hey! Everything clonned!"
else
echo "Shit just happend.."
exit 2
fi

#echo "Running SASS.."
#cd /home/8bit/www/static
#scss --compass -I /usr/lib/ruby/gems/1.8/gems/compass-0.12.2/frameworks/blueprint/stylesheets -I /usr/lib/ruby/gems/1.8/gems/compass-0.12.2/frameworks/compass/stylesheets -I /usr/lib/ruby/gems/1.8/gems/bootstrap-sass-2.2.1.1/vendor/assets/stylesheets --update scss:css

#cd /home/8bit/www_node/


rm $pidfile
