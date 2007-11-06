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


dojo.provide("mapfish_legacy.widgets.GeoStat");

dojo.require("mapfish_legacy.MapControl");

dojo.declare("mapfish_legacy.widgets.GeoStat", [mapfish_legacy.MapControl], {

    /**
     * url to get the vector features
     */
    geoStatUrl: "",
    
    /**
     * Id attribute field
     */
    idAttribute: "",
    
    /**
     * list on indicators available for the layer
     */
    indicators: null,
    
    mapCreated: function() {},
    
    /**
     * Method: parseData
     *    Parses the data returned by loadUrl
     *    reads the returned JSON and adds corresponding features
     *    to the geostat layer
     *    
     * Parameters:
     * request - {XMLHttpRequest}
     */
    parseData: function(request) {
        var parser = new OpenLayers.Format.GeoJSON();
        var doc = request.responseText;
        var features = parser.read(doc);
        this.layer.addFeatures(features);
    },
    
    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for attributeName 
     *    Creates a new Distribution and related Classification
     *    Should be implemented by subclasses.
     */
    classify: function() {},
    
    /**
     * Method: fillTemplate
     *    Adds some form elements to the template
     */
    fillTemplate: function() {
        for (var i = 0; i < this.indicators.length; i++) {
            var option = document.createElement("option");
            option.value = this.indicators[i];
            // TODO use i18n
            option.innerHTML = this.indicators[i];
            this.attributeName.appendChild(option);
        }
    }
});
