#!/bin/sh

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


