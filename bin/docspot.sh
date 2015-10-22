#!/bin/bash
#
# chkconfig: 345 80 20
#
# description: docspot node.js app (managed by pm2)
# processname: docspot
#
# http://linuxexplore.com/2014/03/19/use-of-subsystem-lock-files-in-init-script/
# http://www.nico.schottelius.org/blog/why-centos-does-not-stop-your-init-script/
# https://wiki.debian.org/LSBInitScripts

# ------------------------------------------------------------
### BEGIN INIT INFO
# Provides:          docspot
# Required-Start: $local_fs $network
# Required-Stop: $local_fs $network
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description: docspot node-pm2 init script
# Description: Console Style Service is the whitelabel information provider.
### END INIT INFO
# ------------------------------------------------------------

# ------------------------------------------------------------
# Application Info
# ------------------------------------------------------------
NAME=docspot
APP_USER=resin
APP=/usr/local/adnxs/$NAME/current/bin/start.js

# Log files (note: LOGFILE includes err and out messages)
# OUTFILE & ERRFILE are just duplicate logs which are by default written to ~/.pm2/logs which we want to avoid)
OUTFILE=/dev/null
ERRFILE=/var/log/adnexus/$NAME/pm2.log
LOGFILE=/var/log/adnexus/$NAME/pm2.log

# ------------------------------------------------------------
# Process: PM2 & Node Info
# ------------------------------------------------------------
# pm2 command which will be executed as application user
PM2="runAsAppUser pm2"
# silent PM2
PM2s="$PM2 -s"

# init.d/service lock file used by system - note this is owned by root typically
LOCKFILE=/var/lock/subsys/$NAME

# ------------------------------------------------------------
# Utility Functions
# ------------------------------------------------------------

# Get function from functions library
. /etc/rc.d/init.d/functions

# Execute as application user
runAsAppUser() {
    su - $APP_USER -c "$*"
}

##################### Logging Functions ######################

# log a success info message
logInfo() {
    echo "[INFO][$NAME]: $*";
}

# log and error message
logError() {
    echo "[ERROR][$NAME]: $*";
}

# helper to save the previous exit code as the RETVAL and appropriately print redhat/centos [ OK ] or [ FAILED ] message
returnStatus() {
    RETVAL=$?
    if [ $RETVAL -eq 0 ]; then
        success
    else
        failure
    fi
    # clear up buffer from previous echo -n (if we don't do this all subsequent echoes will override the current line)
    echo
    return $RETVAL
}

################## Check if App is Running ###################

# status variables - default to -1
lockfile_exists=-1
app_running=-1
pm2_running=-1
app_in_pm2=-1
instances_online=0
instances_offline=0

# check if lock file is present
checkLock() {
    test -f $LOCKFILE
}

# check and update all app status variables
checkRunning() {
    # Check if Lock File exists
    checkLock
    lockfile_exists=$?

    # Check if $NAME app process is running from $APP (beware of pgrep matching the runAsAppUser su call. using inline variable to avoid this)
    runAsAppUser "app=$APP; pgrep -f \"(node|PM2).*\$app\" > /dev/null"
    app_running=$?

    # Check if PM2 deamon is running
    runAsAppUser "pgrep -u $APP_USER PM2 > /dev/null"
    pm2_running=$?

    # init default values for pm2 variables
    app_in_pm2=-1
    instances_online=0
    instances_offline=0

    # only query pm2 if it is running. don't start pm2 if it is down. populate default values for below flags
    if [ $pm2_running -eq 0 ]; then
        # Check if App is loaded in PM2
        $PM2s "show $NAME > /dev/null"
        app_in_pm2=$?

        if [ $app_in_pm2 -eq 0 ]; then
            # Check if App is online in PM2
            instances_online=$($PM2 "show $NAME | grep -c 'status.*online'")

            # Check if App is offline (stopped, error, etc. basically not 'online') in PM2
            instances_offline=$($PM2 "show $NAME | grep 'status'| grep -c -v 'online'")
        fi
    fi
}

# return appropriate status code based on the values of the app status variables.
# 0 is success - anything else is failure
running() {
    checkRunning

    # TODO: match linux LSB spec http://refspecs.linuxfoundation.org/LSB_4.1.0/LSB-Core-generic/LSB-Core-generic/iniscrptact.html
    # Return value must indicate the highest level logError
    if [ $lockfile_exists -ne 0 ]; then
        return 1; # No lock file is present at [$lockfile]
    elif [ $app_running -ne 0 ]; then
        return 2; # No app process is running
    elif [ $pm2_running -ne 0 ]; then
        return 3; # pm2 daemon is not running
    elif [ $app_in_pm2 -ne 0 ]; then
        return 4; # app is not registered in pm2
    elif [ $instances_online -lt 1 ]; then
        return 5; # app is setup but not online - probably has startup errors
    elif [ $instances_offline -gt 0 ]; then
        return 6; # there are non-online statuses for app - (probably in addition to online status)
    else
        return 0; # all checks passed
    fi
}

# determine if the app is completely down and not running (from the app status variables)
notRunning() {
    checkRunning

    # even if one of these indicators is active - it means that the app is not completely down.
    if [ $lockfile_exists -ne 0 ] && [ $app_running -ne 0 ] && [ $app_in_pm2 -ne 0 ]; then
        return 0;
    fi

    return 1;
}

# log verbose information with regards to the app status
logAppProcessInfo() {
    running
    local retval=$?

    if [ $lockfile_exists -eq 0 ]; then
        logInfo "lock file is present at [$LOCKFILE]"
    else
        logError "lock file is not present at [$LOCKFILE]"
    fi

    if [ $app_running -eq 0 ]; then
        logInfo "app process is running"
    else
        logError "app process is not running"
    fi

    if [ $pm2_running -eq 0 ]; then
        logInfo "pm2 daemon is running"

        if [ $app_in_pm2 -eq 0 ]; then
            logInfo "app is registered in pm2"

            if [ $instances_online -lt 1 ]; then
                logError "app is setup but not online - probably has startup errors with $instances_offline offline instances"
            elif [ $instances_offline -gt 0 ]; then
                logError "app has $instances_offline offline instances (in addition to $instances_online online instances in cluster)"
            else
                logInfo "app has $instances_online online instances and $instances_offline offline instances"
            fi
        else
            logError "app is not registered in pm2"
        fi

        $PM2 list
    else
        logError "pm2 daemon is not running"
    fi

    # send status to system
    if [ $retval -eq 0 ]; then
        success;
    else
        failure;
    fi

    return $retval;
}



# ------------------------------------------------------------
# Lifecycle Functions
# ------------------------------------------------------------

start() {
    echo -n "Starting $NAME"
    if notRunning; then
        # install and start the app in pm2 utilizing all the cpu cores available
        $PM2s --merge-logs --log $LOGFILE --output $OUTFILE --error $ERRFILE --no-vizion start $APP --instances 0 --name $NAME
        RETVAL=$?

        # if successfully started - create a lock file and return running status
        if [ $RETVAL -eq 0 ]; then
            touch $LOCKFILE

            running
            returnStatus
        else
            failure
            echo
        fi
    else
        # if app is already started - should exit code be 0 or error? - 0 if it is in the desired state
        RETVAL=0
        failure
        echo
        logError "app seems to be running already. please check status and restart if necessary"
    fi
}

stop() {
    echo -n "Stopping $NAME"

    if notRunning; then
        # if app is already stopped - should exit code be 0 or error? - 0 if it is in the desired state
        RETVAL=0
        failure
        echo
        logError "app is already stopped"
    else
        # stop the app now
        # stop pm2 if running # edge case not covered - if app is registered in pm2 and pm2 is stopped. (alternative is to start pm2 just to check and delete the app)
        if [ $pm2_running -eq 0 ]; then
            $PM2s delete $NAME
            $PM2s kill
        fi

        rm -f $LOCKFILE

        notRunning
        returnStatus
    fi
}

restart() {
    echo "Restart $NAME:"
    if notRunning; then
        # is completely down - start
        start
    elif running; then
        # is already up - reload
        reload
    else
        # neither completely up or down - go the full cycle
        stop
        start
    fi
}

reload() {
    echo -n "Reloading $NAME"

    # reload the app gracefully without dropping any traffic
    $PM2s gracefulReload $NAME
    RETVAL=$?

    if [ $RETVAL -eq 0 ]; then
        running
        returnStatus
    else
        failure
    fi
}

# print short message and return status code based on whether the app is running or not
# these messages have been inspired by core service messages `service --status-all`
status() {
    if running; then
        echo "$NAME is running..."
        RETVAL=0
    elif notRunning; then
        echo "$NAME is stopped"
        RETVAL=1
    else
        logError "app is in an inconsistent startup state. please run \`sudo service $NAME info\` for more details"
        RETVAL=2
    fi
}

# display verbose status information
info() {
    echo "Status Info for $NAME:"
    logAppProcessInfo
    returnStatus
}

# ------------------------------------------------------------
# Main Parameter Parsing Logic
# ------------------------------------------------------------
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    reload)
        reload
        ;;
    info)
        info
        ;;
    *)
        echo "Usage: {start|stop|status|restart|reload|info}"
        exit 1
        ;;
esac
exit $RETVAL
