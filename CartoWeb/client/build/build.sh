#!/bin/sh

# 
# Copyright (C) 2007  Camptocamp
#  
# This file is part of CartoWeb
#  
# CartoWeb is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#  
# CartoWeb is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#  
# You should have received a copy of the GNU Lesser General Public License
# along with CartoWeb.  If not, see <http://www.gnu.org/licenses/>.
#

HERE=`pwd`

# build dojo and friends
cd ../cwbase/util/buildscripts/
sh build.sh profileFile=$HERE/cartoweb.profile.js action=release releaseName=cartoweb copyTests=false
cd $HERE


rm -fr ../cwbase/release/cartoweb/openlayers/*

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
mkdir -p $HERE/../cwbase/release/cartoweb/openlayers/
mv OpenLayers.js $HERE/../cwbase/release/cartoweb/openlayers/

rm -rf $HERE/../cwbase/release/cartoweb/openlayers/img
cp -r ../img $HERE/../cwbase/release/cartoweb/openlayers/

mkdir -p $HERE/../cwbase/release/cartoweb/openlayers/theme/default/
cp ../theme/default/style.css $HERE/../cwbase/release/cartoweb/openlayers/theme/default/style.css
cp -r ../theme/default/img $HERE/../cwbase/release/cartoweb/openlayers/theme/default/


