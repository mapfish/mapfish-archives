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


dojo.provide("mapfish_legacy.plugins.Routing");

dojo.require("mapfish_legacy.plugins.ServerCaller");

MapFish.Routing = OpenLayers.Class(MapFish.ServerCaller, {

    /**
     * {<OpenLayers.Layer.Vector>} Layer for rendering features.
     */
    vector: null,

    /**
     * {<OpenLayers.Format.GeoJSON>} GeoJSON parser
     */
    parser: null,

    /**
     * {<OpenLayers.Control.SelectFeature>} Select control
     */
    select: null,

    /**
     * Create a new MapFish.Routing 
     *
     * Parameters:
     * url - {String} URL for service.
     * options - {Object} An optional object whose properties will be used
     *     to extend the plugin.
     */
    initialize: function(url, options) {
        MapFish.ServerCaller.prototype.initialize.apply(this,
                                                         [url, options]);
        this.parser = new OpenLayers.Format.GeoJSON();

        this.vector = new OpenLayers.Layer.Vector("Routing");
        this.map.addLayer(this.vector);

        this.select = new OpenLayers.Control.SelectFeature(this.vector,
                                                           {selectStyle: null,
                                                            onSelect: this.onSelect,
                                                            onUnselect:this.onUnselect});
        this.map.addControl(this.select);
        this.select.activate();
    },

    onSelect: function(f) {
        // TODO
    },

    onUnselect: function(f) {
        // TODO
    },

    onSuccess: function(result) {
        this.vector.destroyFeatures();

        var features = this.parser.read(result.responseText);

        var bounds = features[0].geometry.getBounds();

        for (var i = 0; i < features.length; i++) {
            if (features[i].attributes._isSourceNode) {
                features[i].style = MapFish.Routing.firstPointStyle;
            } else if (features[i].attributes._isTargetNode) {
                features[i].style = MapFish.Routing.lastPointStyle;
            } else {
                bounds.extend(features[i].geometry.getBounds());
                features[i].style = MapFish.Routing.routeStyle;
            }
        }
        this.vector.addFeatures(features);

        if (!this.map.getExtent().containsBounds(bounds)) {
            this.map.zoomToExtent(bounds);
        }
    },

    onFailure: function(result) {}
});


// default style for route
MapFish.Routing.routeStyle = {
    strokeColor: "blue",
    strokeWidth: 6,
    strokeOpacity: 0.4
};

OpenLayers.Util.applyDefaults(MapFish.Routing.routeStyle,
                              OpenLayers.Feature.Vector.style['default']);

MapFish.Routing.firstPointStyle = {
    externalGraphic: "../../cwbase/mapfish_legacy/widgets/routing/start.png",
    graphicWidth: 18,
    graphicHeight: 26,
    graphicYOffset: -26,
    fillOpacity: 1,
    cursor: 'pointer'
};
OpenLayers.Util.applyDefaults(MapFish.Routing.firstPointStyle,
                              OpenLayers.Feature.Vector.style['default']);


MapFish.Routing.lastPointStyle = {
    externalGraphic: "../../cwbase/mapfish_legacy/widgets/routing/stop.png",
    graphicWidth: 18,
    graphicHeight: 26,
    graphicYOffset: -26,
    fillOpacity: 1,
    cursor: 'pointer'
};

OpenLayers.Util.applyDefaults(MapFish.Routing.lastPointStyle,
                              OpenLayers.Feature.Vector.style['default']);

