#!/bin/sh

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

HERE=`pwd`

# build dojo and friends
cd ../cwbase/util/buildscripts/
sh build.sh profileFile=$HERE/mapfish.profile.js action=release releaseName=mapfish copyTests=false
cd $HERE


rm -fr ../cwbase/release/mapfish/openlayers/*

# patch openlayers
svn revert -R ../cwbase/openlayers/  
cd ../cwbase/openlayers/

for file in `ls $HERE/openlayers_patches/`
do 
  patch -p 0 --forward < $HERE/openlayers_patches/$file
done

# build openlayers

cd $HERE
cd ../cwbase/openlayers/build/
python build.py full
mkdir -p $HERE/../cwbase/release/mapfish/openlayers/
mv OpenLayers.js $HERE/../cwbase/release/mapfish/openlayers/

rm -rf $HERE/../cwbase/release/mapfish/openlayers/img
cp -r ../img $HERE/../cwbase/release/mapfish/openlayers/

mkdir -p $HERE/../cwbase/release/mapfish/openlayers/theme/default/
cp ../theme/default/style.css $HERE/../cwbase/release/mapfish/openlayers/theme/default/style.css
cp -r ../theme/default/img $HERE/../cwbase/release/mapfish/openlayers/theme/default/


