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
SETUPTOOLS_SVN="http://svn.python.org/projects/sandbox/branches/setuptools-0.6"

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
    (cd $PYTHON_ENV && \
     wget http://svn.colorstudy.com/virtualenv/trunk/virtualenv.py && \
     python virtualenv.py .)

    # because of a bug in setuptools we need to check it out
    # from svn and setup.py-install it
    # see https://trac.mapfish.org/trac/mapfish/ticket/226
    # for an explanation
    echo "Installing setuptools in $PYTHON_ENV"

    rm -rf $PYTHON_ENV/setuptools
    (cd $PYTHON_ENV && \
     $SVN co $SETUPTOOLS_SVN setuptools && \
     cd setuptools && \
     $PYTHON_ENV/bin/python setup.py install)
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
    run_hook pre_subst_in_files

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

    run_hook after_import_subst_in_files

    if [ -d "$PROJECT_DIR/$PROJECT/$PROJECT/public" ]; then
        PROCESSED_HTML=$(find $PROJECT_DIR/$PROJECT/$PROJECT/public -name "*.html.in" \
                         -exec grep -l PROD_COMMENT_START {} \;)
    else
        PROCESSED_HTML=""
    fi

    if [ "$DEBUG" = "true" ]; then
        export PROD_COMMENT_START="<!--"
        export PROD_COMMENT_END="-->"
    else
        export DEBUG_COMMENT_START="<!--"
        export DEBUG_COMMENT_END="-->"
    fi

    for f in $PROCESSED_HTML; do
        # Create map_debug.html and map_prod.html files
        perl -pne 's/DEBUG_COMMENT/__/g; s/%PROD_COMMENT_START%/<!--/g; s/%PROD_COMMENT_END%/-->/g' \
                $f > ${f%%.html.in}_debug.html.in
        perl -pne 's/PROD_COMMENT/__/g; s/%DEBUG_COMMENT_START%/<!--/g; s/%DEBUG_COMMENT_END%/-->/g' \
                $f > ${f%%.html.in}_prod.html.in
    done

    echo "Substituting config variables"

    find $PROJECT_DIR -name '*.in' | while read i; do
        echo "Replacing $i"
        perl -pne 's/%(?!\\)([\w]+)%/$ENV{$1}/ge; s/%\\([\w]+)%/%$1%/g' $i > ${i%%.in};
    done

    # This script may be generated from a .in, so we need to chmod it afterwards
    if [ -f $PROJECT/run_standalone.sh ]; then
        chmod +x $PROJECT/run_standalone.sh
    fi

    run_hook post_subst_in_files

    for f in $PROCESSED_HTML; do
        python $BASE/deploy/merge_js.py ${f%%.in} ${f%%.html.in}_merged.js
    done
}

init_mapfish() {
    run_hook pre_fetch_mapfish

    if [ "$HAS_MAPFISH" != "1" -o "$SKIP_INIT_MAPFISH" = "1" ]; then
        return
    fi

    if [ -z $PROJECT_MAPFISH_DIR ]; then
        PROJECT_MAPFISH_DIR=$PROJECT/MapFish
    fi

    if [ ! -d $PROJECT_MAPFISH_DIR ]; then
        echo "Error: no MapFish directory in project, but HAS_MAPFISH is set to 1"
        exit 1
    fi

    CFG_FILE=""
    if [ -f "$PROJECT/mapfish.cfg" ]; then
        # This is relative to the build.sh file
        CFG_FILE="../../../mapfish.cfg"
    fi

    (cd $PROJECT_MAPFISH_DIR/client/build/ && sh ./build.sh $CFG_FILE)

    # Install MapFish in env if fetched
    if [ "$FETCH_PYTHON_ENV" = "1" ]; then
        (cd $PROJECT_MAPFISH_DIR/server/python && $PYTHON_ENV/bin/python setup.py develop)
    fi

    run_hook post_fetch_mapfish
}

fetch_project() {
    run_hook pre_fetch_project

    echo "Fetching/updating project"
    if [ -d "project_source/$PROJECT" ]; then
        echo "Detected directory project_source/$PROJECT, using it instead of SVN"
        rsync -av project_source/$PROJECT .
    else
        $SVN co $SVN_CO_OPTIONS ${PROJECT_SVN_BASE}
    fi
    init_mapfish

    # Launch project setup.py to install project dependencies if needed
    if [ -f $PROJECT/$PROJECT/setup.py -a "$HAS_MAPFISH" = "1" \
         -a "$SKIP_INIT_MAPFISH" != "1" -a "$FETCH_PYTHON_ENV" = "1" ]; then
        (cd $PROJECT/$PROJECT && $PYTHON_ENV/bin/python setup.py develop)
    fi

    subst_in_files

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

    while getopts ijurh OPT; do
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
        r)
            echo "Replace .in files"
            subst_in_files
            ;;
        \?|h)
            echo "Usage: $0 OPTION"
            echo " -h: help"
            echo -n " -i: initialize everything "
            echo "(WARNING: this deletes existing directories)"
            echo -n " -j: initialize MapFish and project "
            echo "(WARNING: this deletes existing project and MapFish)"
            echo " -u: update project"
            echo " -r: replace .in files"
            exit 1
            ;;
        esac
    done
    echo "Done."
}
