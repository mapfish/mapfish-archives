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


dojo.provide("mapfish_legacy.plugins.GeoStat.Choropleth");

dojo.require("mapfish_legacy.plugins.MapFish");
dojo.require("mapfish_legacy.plugins.GeoStat");
dojo.require("mapfish_legacy.plugins.GeoStat.Distribution");
dojo.require("mapfish_legacy.plugins.GeoStat.ColorLookUpTable");


MapFish.GeoStat.Choropleth = OpenLayers.Class(MapFish.GeoStat, {
    
    /**
     * Property: colors
     * {Array(<MapFish.Color>} Array of colors to be applied to features
     *     We should use styles instead
     */
    colors: [],
    
    /** 
     * Property: classification 
     * {<MapFish.GeoStat.Classification>} Defines the different classification to use
     */
    classification: null,
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(layer, options) {
        MapFish.GeoStat.prototype.initialize.apply(this, arguments);
    },
    
    /**
     * APIMethod: updateFeatures
     * This function loops into the layer's features
     *    and apply already given classification
     */
    updateFeatures: function () {
        var boundsArray = this.classification.getBoundsArray();
        
        if (this.colors.length != this.classification.bins.length) {
            OpenLayers.Console.error("Given number of colors doesn't match");
        };
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicatorAttribute];
            for (var j = 0; j < boundsArray.length - 1; j++) {
                if (value >= boundsArray[j]
                    && value <= boundsArray[j + 1]) {
                    feature.style.fillOpacity = 1;
                    feature.style.fillColor = this.colors[j].toHexString();
                }
            }
        }
        this.layer.renderer.clear();
        this.layer.moveTo(null, true);
        this.updateLegend();
    },
    
    /**
     * APIMethod: createColorInterpolation
     *    Generates color interpolation in regard to classification
     */
    createColorInterpolation: function(minColor, maxColor) {
        var initialColors = [minColor, maxColor];
        var colorLut = new MapFish.GeoStat.ColorLookUpTable(initialColors);
        var nbColors = this.classification.bins.length;
        return colorLut.getColorsArrayByRgbInterpolation(nbColors);
    },
    
    /**
     * Method: updateLegend
     *    Update the legendDiv content with new bins label
     */
    updateLegend: function() {
        if (!this.legendDiv) {
            return;
        }
        
        this.legendDiv.innerHTML = "";
        
        // TODO use css classes instead
        
        for (var i = 0; i < this.classification.bins.length; i++) {
            var element = document.createElement("div");
            element.style.backgroundColor = this.colors[i].toHexString();
            element.style.width = "30px";
            element.style.height = "15px";
            element.style.cssFloat = "left";
            element.style.marginRight = "10px";
            this.legendDiv.appendChild(element);
            
            var element = document.createElement("div");
            element.innerHTML = this.classification.bins[i].label;
            element.innerHTML +=  " (" + this.classification.bins[i].nbVal + ")";
            this.legendDiv.appendChild(element);
            
            var element = document.createElement("div");
            element.style.clear = "left";
            this.legendDiv.appendChild(element);
        }
    },
    
    CLASS_NAME: "MapFish.GeoStat.Choropleth"
});
