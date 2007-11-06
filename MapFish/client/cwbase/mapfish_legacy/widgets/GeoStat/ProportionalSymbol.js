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


dojo.provide("mapfish.widgets.GeoStat.ProportionalSymbol");

dojo.require("mapfish.widgets.GeoStat");
dojo.require("mapfish.plugins.GeoStat.ProportionalSymbol");
dojo.require("dijit._Templated");

dojo.declare("mapfish.widgets.GeoStat.ProportionalSymbol", [mapfish.widgets.GeoStat, dijit._Templated], {

    templatePath: dojo.moduleUrl("mapfish.widgets.GeoStat", "ProportionalSymbol.html"),
    
    mapCreated: function() {
        // fill the template with variables
        this.fillTemplate();
                
        this.layer = new OpenLayers.Layer.Vector("ProportionalSymbol");
        this.layer.setVisibility(false, true);
        this.map.addLayer(this.layer);
        OpenLayers.loadURL(this.geoStatUrl, "", this, this.parseData);
    },
    
    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for attributeName 
     *    Creates a new Distribution and related Classification
     *    Then creates an new Choropleths and applies classification
     */
    classify: function() {
        var indicatorAttribute = this.attributeName.value;
        
        var values = [];
        var features = this.layer.features;
        for (var i = 0; i < features.length; i++) {
            values.push(features[i].attributes[indicatorAttribute]);
        }
        var dist = new MapFish.GeoStat.Distribution(values);
        
        var stat = new MapFish.GeoStat.ProportionalSymbol(this.layer, {
            minVal: dist.minVal,
            maxVal: dist.maxVal,
            minSize: parseInt(this.sizeA.value),
            maxSize: parseInt(this.sizeB.value),
            idAttribute: this.idAttribute,
            indicatorAttribute: indicatorAttribute,
            legendDiv: this.legend
        });
        
        stat.updateFeatures();
        
        var select = new OpenLayers.Control.SelectFeature(this.layer, {
            hover: true,
            callbacks: {
               over: stat.showDetails.bind(stat),
               out: stat.hideDetails.bind(stat)
            }
        });
        this.map.addControl(select);
        
        select.activate();
        this.layer.setVisibility(true, true);
    }
});