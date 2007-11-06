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


dojo.provide("mapfish.widgets.Routing");

dojo.require("mapfish.MapControl");
dojo.require("dijit._Templated");

dojo.require("mapfish.plugins.Routing");

dojo.declare("mapfish.widgets.Routing", [mapfish.MapControl, dijit._Templated], {
    remoteUrl: "",

    templatePath: dojo.moduleUrl("mapfish.widgets", "routing/Routing.html"),

    mapCreated: function() {
        this.routing = new MapFish.Routing(this.remoteUrl, 
                                            {map: this.map, 
                                             params: {hello: 'world', foo: 'bar'}});
    },

    getRoute: function(e) {
        this.routing.call(dojo.formToObject(this.domNode));
    }
});
