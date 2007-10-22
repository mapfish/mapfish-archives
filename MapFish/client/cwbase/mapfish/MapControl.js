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


dojo.provide("mapfish.MapControl");

dojo.require("dijit._Widget");

dojo.declare("mapfish.MapControl", [dijit._Widget], {
    // The Map widget id.
    // Can be left blank if there is only one map in the page.
    mapId: "",

    postCreate: function() {
        // Listen to the 'map.created' event. 
        // This event is triggered by the 'mainmap' widget
        dojo.subscribe("map.created", this, this._mapCreated);
    },

    _mapCreated: function(o) {
        // assign the OpenLayers.Map object.
        if (!this.mapId || (this.mapId == o.mapId)) {
            this.map = o.map;
            this.mapCreated();
        }
    },

    // called when the mainmap is ready
    // implemented by sub-classes
    mapCreated: function() {}
});
