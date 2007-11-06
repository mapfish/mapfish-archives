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


dojo.provide("mapfish_legacy.widgets.Map");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("mapfish_legacy.widgets.Map", [dijit._Widget, dijit._Templated], {
    
    templateString: "<div class='mapContainer'></div>",

    postMixInProperties: function() {
        dojo.addOnLoad(this, "_createMap");
    },

    _createMap: function() {
        this.map = this.createMap(this.domNode);

        // the map if ready: inform all the controls
        dojo.publish("map.created", [{'mapId': this.id, 'map': this.map}]);
    },

    // static function
    createMap: function(mapDiv) {
        var map = new OpenLayers.Map(mapDiv);
        var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                                         "http://labs.metacarta.com/wms/vmap0",
                                         {layers: 'basic'} );
        map.addLayer(layer);
        map.setCenter(new OpenLayers.LonLat(5, 40), 5);

        return map;
    }

});
