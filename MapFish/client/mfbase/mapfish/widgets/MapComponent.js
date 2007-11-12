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

/**
 * @class mapfish.widgets.MapComponent
 * @extends Ext.Container
 * A map container in order to be able to insert a map into a complex layout
 * Its main interest is to update the map size when the container is resized
 * Simple example usage:
 * <pre><code>
 * var mapcomponent = new mapfish.widgets.MapComponent({map: map});
 * </code></pre>
 * Note that the callback method must return a valid <OpenLayers.Map> object
 * @constructor
 * Create a new MapComponent
 * @param {Object} map the OpenLayers map object
 * @param {Object} config The config object
 */
Ext.namespace('mapfish.widgets');

mapfish.widgets.MapComponent = function(config) {
    Ext.apply(this, config);
    this.contentEl=this.map.div;
    mapfish.widgets.MapComponent.superclass.constructor.call(this);
}

Ext.extend(mapfish.widgets.MapComponent, Ext.Panel, {
    /**
     * The map to display.
     * {OpenLayers.Map}  
     */
    map: null,

    initComponent: function() {
        mapfish.widgets.MapComponent.superclass.initComponent.apply(this, arguments);
        this.on("bodyresize", this.map.updateSize, this.map);
    }
});
Ext.reg('mapcomponent', mapfish.widgets.MapComponent);
