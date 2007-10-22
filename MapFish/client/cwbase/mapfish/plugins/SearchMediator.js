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


dojo.provide("mapfish.plugins.SearchMediator");

dojo.require("mapfish.plugins.MapFish");

MapFish.SearchMediator = OpenLayers.Class.create();
MapFish.SearchMediator.prototype = {
        
    url: null,
    callback: null,
    params: null,
    searchers: null,
    parser: null,
    request: null,

    initialize: function(url, callback, maxFeatures) {
        this.url = url;
        this.callback = callback;
        this.params = {'maxfeatures': maxFeatures};
        this.searchers = [];
        this.parser = new OpenLayers.Format.GeoJSON();
    },

    register: function(searcher) {
        this.searchers.push(searcher);
    },

    onSuccess: function(request) {
        this.request = null;
        // extract features from response
        var features = this.parser.read(request.responseText);
        if (this.callback) {
            // pass features to user callback
            this.callback(features);
        }
    },

    doSearch: function(searcher, params) {
        // build parameters string
        var allParams = this.getSearchParams(searcher, params);
        var paramsString = OpenLayers.Util.getParameterString(allParams);
        // build full request string
        var url = this.url;
        var requestString = url + (url.match(/\?/) ? '&' : '?') + paramsString;
        // send request
        this.request = new OpenLayers.Ajax.Request(
            requestString,
            {
                method: "GET",
                onSuccess: this.onSuccess.bind(this),
                onFailure: function() { alert('Ajax request failed'); }
            }
        );
    },

    cancelSearch: function() {
        if (this.request) {
            this.request.transport.abort();
        }
    },

    getSearchParams: function(searcher, params) {
        var allParams = OpenLayers.Util.extend(this.params, params);
        for (var i = 0; i < this.searchers.length; i++) {
            var s = this.searchers[i];
            if (s == searcher) {
                // we already have our caller's params
                continue;
            }
            OpenLayers.Util.extend(allParams, s.getSearchParams());
        }
        return allParams;
    }
}
