/*
 * Copyright (C) 2007  Camptocamp
 *
 * This file is part of MapFish
 *
 * MapFish is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with MapFish.  If not, see <http://www.gnu.org/licenses/>.
 */


function c2corgCreateMap(mapDiv) {

    var options = {
        projection: "EPSG:4326",
        controls: [new OpenLayers.Control.MouseDefaults()],
        'numZoomLevels': 20
    };

    var map = new OpenLayers.Map(mapDiv , options);

    var wms = new OpenLayers.Layer.WMS("OpenLayers WMS", 
        "http://labs.metacarta.com/wms/vmap0",
        {layers: 'basic'},
        {isBaseLayer: true}
    );
    wms.setVisibility(false);
    map.addLayer(wms);

    var twms = new OpenLayers.Layer.WMS("World Map", 
        "http://world.freemap.in/cgi-bin/mapserv?", 
        {
            map: '/www/freemap.in/world/map/factbooktrans.map',
            transparent: true,
            layers: 'factbook',
            format: 'image/png'
        }
    );
    twms.setVisibility(false);
    map.addLayer(twms);

    c2cwmsLayers = ['parkings', 'summits', 'refuges', 'sites',
                    'countries', 'departements_fr', 'cantons_ch',
                    'massifs'];
    c2cwms = new OpenLayers.Layer.WMS("C2C Objects",
        "http://demo.mapfish.org/cgi-bin/mapserv-c2corg-v0.2?",
        {
            singleTile: true,
            layers: c2cwmsLayers,
            format: 'image/png',
            transparent: true
        }
    );
    c2cwms.setVisibility(false);
    map.addLayer(c2cwms);

    map.setCenter(new OpenLayers.LonLat(5,45), 6);
    map.addControl(new OpenLayers.Control.PanZoomBar());

    return map;
}
