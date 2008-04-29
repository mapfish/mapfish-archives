/*
 * Copyright (C) 2007-2008  Camptocamp
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

mapfish.Util = {};

mapfish.Util.sum = function(array) {
    for (var i=0, sum=0; i < array.length; sum += array[i++]);
    return sum;
};

mapfish.Util.max = function(array) {
    return Math.max.apply({}, array);
};

mapfish.Util.min = function(array) {
    return Math.min.apply({}, array);
};

/**
 * Function: getIconUrl
 * Builds the URL for a layer icon, based on a WMS GetLegendGraphic request.
 * 
 * Parameters:
 * wmsUrl - {String} The URL of a WMS server.
 * options - {Object} The options to set in the request:
 *                    'layer' - the name of the layer for which the icon is requested (required)
 *                    'rule' - the name of a class for this layer (this is set to the layer name if not specified)
 *                    'format' - "image/png" by default
 *                    ... 
 * 
 * Returns:
 * {String} The URL at which the icon can be found.
 */
mapfish.Util.getIconUrl = function(wmsUrl, options) {
    if (!options.layer) {
        OpenLayers.Console.warn(
            'Missing required layer option in mapfish.Util.getIconUrl');
        return '';
    }
    if (!options.rule) {
        options.rule = options.layer;
    }
    var url = wmsUrl + ((wmsUrl.indexOf('?') != (wmsUrl.length - 1)) ? '?' : '');
    var options = OpenLayers.Util.extend({
        layer: "",
        rule: "",
        service: "WMS",
        version: "1.1.1",
        request: "GetLegendGraphic",
        format: "image/png",
        width: 16,
        height: 16
    }, options);
    options = OpenLayers.Util.upperCaseObject(options);
    return url + OpenLayers.Util.getParameterString(options);
};
