/*
 * Copyright (C) 2007  Camptocamp
 *
 * This file is part of CartoWeb
 *
 * CartoWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CartoWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CartoWeb.  If not, see <http://www.gnu.org/licenses/>.
 */


dojo.provide("cartoweb.plugins.GeoStat.ColorLookUpTable");

dojo.require("cartoweb.plugins.CartoWeb");

/**
 * Colors related classes
 */
CartoWeb.GeoStat.ColorLookUpTable = OpenLayers.Class({
    /**
     * Property: initialColors
     * {Array} Colors Array of <CartoWeb.Colors>
     *    Each methods need to be initialized with a given
     *    number of colors. In general, this number is 2.
     */
    initialColors: null,
    
    initialize: function(initialColors) {
        this.initialColors = initialColors;
    },
    
    getColorsArrayByRgbInterpolation: function(nbColors) {
        var resultColors = [];
        var colorA = this.initialColors[0].getColorRgb();
        var colorB = this.initialColors[1].getColorRgb();
        var colorAVal = colorA.getRgbArray();
        var colorBVal = colorB.getRgbArray();
        
        if (nbColors == 1) {
            return [colorA];
        }
        
        for (var i = 0; i < nbColors; i++) {
            var rgbTriplet = [];
            rgbTriplet[0] = colorAVal[0] + 
                i * (colorBVal[0] - colorAVal[0]) / (nbColors - 1);
            rgbTriplet[1] = colorAVal[1] + 
                i * (colorBVal[1] - colorAVal[1]) / (nbColors - 1);
            rgbTriplet[2] = colorAVal[2] + 
                i * (colorBVal[2] - colorAVal[2]) / (nbColors - 1);
            resultColors[i] = new CartoWeb.ColorRgb(parseInt(rgbTriplet[0]), 
                parseInt(rgbTriplet[1]), parseInt(rgbTriplet[2]));
        }
        
        return resultColors;
    },
    
    CLASS_NAME: "CartoWeb.GeoStat.ColorLookUpTable"
});