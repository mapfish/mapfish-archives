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


dojo.provide("mapfish.plugins.GeoStat.ProportionalSymbol");

dojo.require("mapfish.plugins.MapFish");
dojo.require("mapfish.plugins.GeoStat");
dojo.require("mapfish.plugins.GeoStat.Distribution");


MapFish.GeoStat.ProportionalSymbol = OpenLayers.Class(MapFish.GeoStat, {
    
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
     * APIMethod: applyClassification
     * This function loops into the layer's features
     *    and updates sizes
     */
    updateFeatures: function () {
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicatorAttribute];
            var size = (value - this.minVal) / (this.maxVal - this.minVal) * 
                (this.maxSize - this.minSize) + this.minSize;
            feature.style.pointRadius = size;
        }
        
        this.layer.renderer.clear();
        this.layer.moveTo(null, true);
        this.updateLegend();
    },
    
    /**
     * Method: updateLegend
     *    Update the legendDiv content with new bins label
     */
    updateLegend: function() {
        if (!this.legendDiv) {
            return;
        }
        
        this.legendDiv.innerHTML = "Needs to be done !";
        
        // TODO use css classes instead

    },
    
    CLASS_NAME: "MapFish.GeoStat.ProportionalSymbol"
});
