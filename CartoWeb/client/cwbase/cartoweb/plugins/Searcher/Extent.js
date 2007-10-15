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


dojo.provide("cartoweb.plugins.Searcher.Extent");

dojo.require("cartoweb.plugins.Searcher");

CartoWeb.Searcher.Extent = OpenLayers.Class.create();
CartoWeb.Searcher.Extent.prototype =
    OpenLayers.Class.inherit(CartoWeb.Searcher, {

    map: null,
    
    initialize: function(map, mediator, url, callback, maxFeatures) {
        CartoWeb.Searcher.prototype.initialize.apply(this, [mediator, url, callback, maxFeatures]);
        this.map = map;
    },
    
    enable: function() {
        if (CartoWeb.Searcher.prototype.enable.call(this)) {
            this.map.events.register('moveend', this, this._onMoveend);
        }
    },
    
    disable: function() {
        if (CartoWeb.Searcher.prototype.disable.call(this)) {
            this.map.events.unregister('moveend', this, this._onMoveend);
        }
    },
        
    _onMoveend: function(e) {
        this.doSearch(this.getSearchParams());
        OpenLayers.Event.stop(e);
    },

    getSearchParams: function() {
        var bbox = this.map.getExtent().toBBOX();
        var params = {'box': bbox};
        return OpenLayers.Util.extend(this.params, params);
    }
});
