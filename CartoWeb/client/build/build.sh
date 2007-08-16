#!/bin/sh

HERE=`pwd`

# build dojo and friends
cd ../htdocs/cwbase/util/buildscripts/
sh build.sh profileFile=$HERE/cartoweb.profile.js action=release releaseName=cartoweb copyTests=false
cd $HERE


rm -fr ../htdocs/cwbase/release/cartoweb/openlayers/*

# patch openlayers
cd ../htdocs/cwbase/openlayers/

for file in `ls $HERE/openlayers_patches/`
do 
  patch -p 0 --forward < $HERE/openlayers_patches/$file
done

# build openlayers

cd $HERE
cd ../htdocs/cwbase/openlayers/build/
python build.py full
mkdir -p $HERE/../htdocs/cwbase/release/cartoweb/openlayers/
mv OpenLayers.js $HERE/../htdocs/cwbase/release/cartoweb/openlayers/

rm -rf $HERE/../htdocs/cwbase/release/cartoweb/openlayers/img
cp -r ../img $HERE/../htdocs/cwbase/release/cartoweb/openlayers/

mkdir -p $HERE/../htdocs/cwbase/release/cartoweb/openlayers/theme/
mkdir -p $HERE/../htdocs/cwbase/release/cartoweb/openlayers/theme/default
cp ../theme/default/style.css $HERE/../htdocs/cwbase/release/cartoweb/openlayers/theme/default/style.css

