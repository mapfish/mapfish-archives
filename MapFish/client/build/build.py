#!/usr/bin/env python

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

#
# Some code taken from the OpenLayers code base
#
# Copyright (c) 2006-2007 MetaCarta, Inc., published under the Clear BSD
# license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
# full text of the license.
#

import sys
sys.path.append("./")

import jsmin, mergejs

configDict = {
    'OpenLayers.js' : '../mfbase/openlayers/lib',
    'OpenLayers'    : '../mfbase/openlayers/lib',
    'Rico'          : '../mfbase/openlayers/lib',
    'SingleFile.js' : '../mfbase/mapfish',
    'MapFish.js'    : '../mfbase/mapfish',
    'widgets'       : '../mfbase/mapfish',
    'core'          : '../mfbase/mapfish'
}

configFilename = "mapfish-widgets.cfg"
outputFilename = "MapFish.js"

if len(sys.argv) > 1:
    configFilename = sys.argv[1]
    extension = configFilename[-4:]

    if extension  != ".cfg":
        configFilename = sys.argv[1] + ".cfg"

if len(sys.argv) > 2:
    outputFilename = sys.argv[2]

print "Merging libraries."
merged = mergejs.run(configDict, None, configFilename)
print "Compressing."
minimized = jsmin.jsmin(merged)
print "Adding license file."
minimized = file("license.txt").read() + minimized

print "Writing to %s." % outputFilename
file(outputFilename, "w").write(minimized)

print "Done."
