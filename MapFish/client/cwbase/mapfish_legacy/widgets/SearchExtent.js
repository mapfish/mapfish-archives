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


dojo.provide("mapfish.widgets.SearchExtent");

dojo.require("mapfish.MapControl");
dojo.require("dijit._Templated");
dojo.require("mapfish.plugins.Searcher.Extent");

dojo.declare("mapfish.widgets.SearchExtent", [mapfish.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("mapfish.widgets", "SearchExtent.html"),
    searchUrl: null,
    maxFeatures: 100,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        var mediator = new MapFish.SearchMediator(this.searchUrl, cb, this.maxFeatures);
        this.query = new MapFish.Searcher.Extent(this.map, mediator);
    },

    onGotFeatures: function(features) {},

    toggle: function() {
        if (this.query.enabled) {
            this.query.disable();
        } else {
            this.query.enable();
        }
    }
});
