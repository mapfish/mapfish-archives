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


dojo.provide("mapfish_legacy.plugins.ServerCaller");
dojo.require("mapfish_legacy.plugins.MapFish");

MapFish.ServerCaller = OpenLayers.Class({
    // remote service url
    url: '',
    
    // the request default params
    params: {},

    onSuccess: function() {},
    onFailure: function() {},

    initialize: function(url, options) {
        this.url = url;
        OpenLayers.Util.extend(this, options);
    },

    onBeforeCall: function(params) {
        return true;
    },

    call: function(params) {
        if (this.onBeforeCall(params)) {
            var parameters = OpenLayers.Util.extend(this.params, params);
            new OpenLayers.Ajax.Request(this.url, 
                                        {method: 'get',
                                         parameters: OpenLayers.Util.getParameterString(parameters), 
                                         onSuccess: this.onSuccess.bind(this),
                                         onFailure: this.onFailure.bind(this)});
        }
    }
});
