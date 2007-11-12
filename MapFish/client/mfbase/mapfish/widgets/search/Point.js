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
 * @requires core/Searcher/XY.js
 * 
 * Class: mapfish.widgets.search.Point
 */

Ext.namespace('mapfish.widgets');
Ext.namespace('mapfish.widgets.search');

mapfish.widgets.search.Point = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.search.Point.superclass.constructor.call(this);
}

Ext.extend(mapfish.widgets.search.Point, Ext.Panel, {

    /**
     * Property: autoHeight
     * {Boolean}
     */
    autoHeight: true,

    /**
     * Property: autoWidth
     * {Boolean}
     */
    autoWidth: true,

    /**
     * Property: searcher
     * {<mapfish.Searcher.XY>} - The underlying core search object.
     */
    searcher: null,

    /**
     * APIProperty: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * APIProperty: radius
     * {Integer} - The search radius around the clicked point.
     */
    radius: 100,

    /**
     * APIProperty: url
     * {String} - The URL to the search service.
     */
    url: null,

    /**
     * APIProperty: maxFeatures
     * {Integer} - The maximum number of features sent by the search service.
     */
    maxFeatures: 100,

    /**
     * APIPropery: onGotFeatures
     * {Function} - Called when features are received from the search service.
     */
    onGotFeatures: null,

    /**
     * APIProperty: label
     * {String} - The text tabel beside the checkbox.
     */
    label: 'activate search on click',

    /**
     * Method: initComponent
     * Overrides super-class initComponent method. Creates the core search
     * objects and the checkbox element used to enable/disable search.
     */
    initComponent: function() {
        mapfish.widgets.search.Point.superclass.initComponent.call(this);
        // create the core search object
        this.searcher = new mapfish.Searcher.XY(
            this.map, this.radius, null,
            this.url, this.onGotFeatures, this.maxFeatures
        );
        // create a checkbox and add to this panel
        var checkbox = new Ext.form.Checkbox({boxLabel: this.label});
        checkbox.on('check', this._onCheck, this);
        this.add(checkbox);
    },

    /**
     * Method: _onCheck
     * Called when the checkbox is checked or unchecked.
     */
    _onCheck: function(checkbox, checked) {
        if (checked) {
            this.searcher.enable();
        } else {
            this.searcher.disable();
        }
    }
});
