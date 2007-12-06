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
     * {Integer} - The search radius.
     */
    radius: 100,

    /**
     * APIProperty: hover
     * {Boolean} - Specifies if hover must be used instead of click.
     */
    hover: false,

    /**
     * APIProperty: hoverTimeout
     * {Integer} - Number of milliseconds the mouse should not move
     *      for search to be triggered. Default is 1000 ms. This
     *      option only applies if the "hover" option is set.
     */
    hoverTimeout: 1000,

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
            this.map, null, {
                'hover': this.hover,
                'hoverTimeout': this.hoverTimeout
            }, {
                'url': this.url,
                'callback': this.onGotFeatures,
                'params': {
                    'maxfeatures': this.maxFeatures,
                    'radius': this.radius
                }
            }
        );
        // create a checkbox and add it to this panel
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
Ext.reg('point', mapfish.widgets.search.Point);
