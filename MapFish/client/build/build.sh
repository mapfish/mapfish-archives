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

# MapFish path
MAPFISHPATH=/path/to/MapFish


#
# Variables
#

buildpath="${MAPFISHPATH}/client/build"


#
# Command path definitions
#

python="/usr/bin/python"
mkdir="/bin/mkdir"
sh="/bin/sh"


#
# MapFish.js build
#

releasepath="${MAPFISHPATH}/client/mfbase/release"

${mkdir} ${releasepath}
(cd ${buildpath} && ${python} build.py mapfish-widgets.cfg  ${releasepath}/MapFish.js)


#
# Dojo build (old stuff, to be removed)
#

(cd ${buildpath} && ${sh} build-dojo.sh)


exit 0
