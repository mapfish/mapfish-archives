#
# Copyright (C) 2008  Camptocamp
#
# This file is part of MapFish
#
# MapFish is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# MapFish is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with MapFish.  If not, see <http://www.gnu.org/licenses/>.

# MapFish deploy scripts
#
# This file should be sourced from the project deploy file.
# See http://trac.mapfish.org/trac/mapfish/wiki/deployment for documentation
#

UPSTREAM_COMPAT_VERSION=1

if [ "$COMPAT_VERSION" != "$UPSTREAM_COMPAT_VERSION" ]; then
    echo "Your deployment file is not compatible with the latest deploy"
    echo "script. Please check the MapFish trac for information."
    echo " (deployment version: $COMPAT_VERSION, upstream version: $UPSTREAM_COMPAT_VERSION)"
    exit 1
fi

# Default variable definitions, these can be overridden in the deploy file.
# See deploy-sample.sh for explanation

HAS_MAPFISH=1

# Internal definitions, shouldn't be overridden

BASE=$(cd $(dirname $0); pwd)
SVN="svn -q"
PYTHON_ENV=$BASE/env

#
# Global and Initialization functions
#

run_hook() {
    if [ "$(type -t $1)" = "function" ]; then
        echo "Running $1 hook"
        $1
    fi
}

create_python_env() {
    if [ "$FETCH_PYTHON_ENV" != "1" ]; then
        return
    fi

    echo "Installing python env in $PYTHON_ENV"

    rm -rf $PYTHON_ENV
    mkdir $PYTHON_ENV
    (cd $PYTHON_ENV && wget http://svn.colorstudy.com/virtualenv/trunk/virtualenv.py)
    (cd $PYTHON_ENV && python virtualenv.py .)
    # FIXME: This shouldn't be needed, as MapFish should fetch the requirements with setup.py
    # However this isn't working right now (failure in simplejson), so let's do this for now.
    $PYTHON_ENV/bin/easy_install Pylons psycopg2 sqlalchemy shapely geojson
}

init_light() {
    run_hook pre_init_light

    if [ -d $PROJECT ]; then
        rm -rf $PROJECT
    fi
    fetch_project

    run_hook post_init_light
}

init_all() {
    run_hook pre_init_all

    create_python_env
    init_light

    run_hook post_init_all
}

#
# Project functions
#

subst_in_files() {
    export PROJECT_DIR=$BASE/$PROJECT
    echo "PROJECT_DIR: $PROJECT_DIR"

    for f in \
        $BASE/deploy/config-defaults \
        $PROJECT_DIR/configs/defaults \
        $PROJECT_DIR/configs/$(hostname -f) \
        $PROJECT_DIR/configs/$(hostname -f)$(echo $PROJECT_DIR | sed s@/@-@g)\
        ; do
        if [ -f $f ]; then
            echo "Importing $f"
            . $f
        else
            echo "Tried to import $f"
        fi
    done

    echo "Substituting config variables"

    find $PROJECT_DIR -name '*.in' | while read i; do
        echo "Replacing $i"
        perl -pne 's/%([\w]+)%/$ENV{$1}/ge' $i > ${i%%.in};
    done
}

init_mapfish() {
    run_hook pre_fetch_mapfish

    if [ "$HAS_MAPFISH" != "1" -o "$SKIP_INIT_MAPFISH" = "1" ]; then
        return
    fi

    if [ ! -d $PROJECT/MapFish ]; then
        echo "Error: no MapFish directory in project, but HAS_MAPFISH is set to 1"
        exit 1
    fi

    (cd $PROJECT/MapFish/client/build/ && sh ./build.sh)

    # Install MapFish in env if fetched
    if [ "$FETCH_PYTHON_ENV" = "1" ]; then
        (cd $PROJECT/MapFish/server/python && $PYTHON_ENV/bin/python setup.py develop)
    fi

    run_hook post_fetch_mapfish
}

fetch_project() {
    run_hook pre_fetch_project

    echo "Fetching/updating project"
    $SVN co $SVN_CO_OPTIONS ${PROJECT_SVN_BASE}

    init_mapfish

    subst_in_files

    # This script may be generated from a .in, so we need to chmod it afterwards
    if [ -f $PROJECT/run_standalone.sh ]; then
        chmod +x $PROJECT/run_standalone.sh
    fi

    run_hook post_fetch_project
}

#
# Main function
#

main() {

    # sanity checks
    if [ -z "$PROJECT" ]; then
        echo "You must declare a PROJECT variable"
        exit 1
    fi

    while getopts ijuh OPT; do
        case $OPT in
        i)
            echo "Initializing everything"
            init_all
            ;;
        j)
            echo "Initializing MapFish and project"
            init_light
            ;;
        u)
            echo "Updating project"
            fetch_project
            ;;
        \?|h)
            echo "Usage: $0 OPTION"
            echo " -h: help"
            echo " -i: initialize everything"
            echo " -j: initialize MapFish and project"
            echo " -u: update project"
            exit 1
            ;;
        esac
    done
}

