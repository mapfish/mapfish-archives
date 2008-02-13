#!bin/sh
# 
# Copyright (C) 2007  Camptocamp
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
#

set -e

#
# Variables
#
buildpath="$(cd $(dirname $0); pwd)"
releasepath="${buildpath}/../mfbase/release"

#
# Command path definitions
#
python="/usr/bin/python"
mkdir="/bin/mkdir"
rm="/bin/rm"
sh="/bin/sh"
cp="/bin/cp"

#
# MapFish.js build
#
mapfishpath="${buildpath}/../mfbase/mapfish"
if [ -d ${releasepath} ]; then
    ${rm} -rf ${releasepath}
fi

mapfishreleasepath="${releasepath}/mapfish"
${mkdir} -p ${mapfishreleasepath}
(cd ${buildpath} && ${python} build.py -c mapfish-widgets.cfg -o ${mapfishreleasepath}/MapFish.js)

# MapFish resources
${cp} -r "${mapfishpath}/img" ${mapfishreleasepath}

# OpenLayers resources
openlayerspath="${buildpath}/../mfbase/openlayers"
openlayersreleasepath="${releasepath}/openlayers"

mkdir ${openlayersreleasepath}
${cp} -r "${openlayerspath}/img" ${openlayersreleasepath}
${cp} -r "${openlayerspath}/theme" ${openlayersreleasepath}

#
# Dojo build (old stuff, to be removed)
#
(cd ${buildpath} && ${sh} build-dojo.sh)

exit 0
