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


dojo.provide("mapfish_legacy.plugins.Searcher");

dojo.require("mapfish_legacy.plugins.MapFish");
dojo.require("mapfish_legacy.plugins.SearchMediator");

MapFish.Searcher = OpenLayers.Class.create();
MapFish.Searcher.prototype = {
        
    mediator: null,

    enabled: false,
    
    params: null,

    initialize: function(mediator, url, callback, maxFeatures) {
        if (mediator) {
            this.mediator = mediator;
        } else if (url) {
            var cb = callback ? callback : this.onGotFeatures.bind(this);
            this.mediator = new MapFish.SearchMediator(url, cb, maxFeatures);
        }
        // register ourself in the mediator
        this.mediator.register(this);
        this.params = {};
    },
    
    enable: function() {
        if (this.enabled) {
            return false;
        }
        this.enabled = true;
        return true;
    },
    
    disable: function() {
        if (!this.enabled) {
            return false;
        }
        this.enabled = false;
        return true;
    },
    
    doSearch: function(params) {
        this.mediator.doSearch(this, params);
    },

    cancelSearch: function() {
        this.mediator.cancelSearch();
    },
    
    addLayers: function(layers) {
        if (!(layers instanceof Array)) {
            layers = [layers];
        }
        this.addParams({'layers': layers.join(',')});
    },
    
    removeLayers: function(layers) {
        if (!this.params['layers']) {
            return;
        }
        if (!layers) {
            // remove all
            this.params['layers'] = null;
        } else {
            // remove specified layers
            if (!(layers instanceof Array)) {
                layers = [layers];
            }
            var layerArray = this.params['layers'].split(',');
            for (var i = 0; i < layers.length; i++) {
                OpenLayers.Util.removeItem(layerArray, layers[i]);
            }
        }
    },

    addParams: function(params) {
        return OpenLayers.Util.extend(this.params, params);
    },
        
    /* to be overriden by subclasses */
    getSearchParams: function() {},

    /* to be overriden by subclasses */
    onGotFeatures: function() {}
}
