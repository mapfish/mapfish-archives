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


/*
 * @requires core/Searcher.js
 * @requires core/SearchMediator.js
 * @requires OpenLayers/Map.js
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Handler/Box.js
 */

mapfish.Searcher.Box = OpenLayers.Class(mapfish.Searcher, {

    /**
     * APIProperty: boxDivClassName
     * {String} The CSS class to use for drawing the box. Default is
     *     olHandlerBoxZoomBox
     */
    boxDivClassName: 'olHandlerBoxZoomBox',

    /**
     * APIMethod: onGotFeatures
     * {Function} - Called upon receiving features from the server.
     */
    onGotFeatures: function(bounds) {},

    /**
     * Property: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * Propery: handler
     * {<OpenLayers.Handler>} - The Hover or Click handler
     */
    handler: null,

    /**
     * Constructor: mapfish.Searcher.Box
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     * mediator - {<mapfish.SearchMediator>}
     * options - {Object}
     * mediatorOptions - {Object}
     */
    initialize: function(map, mediator, options, mediatorOptions) {
        mapfish.Searcher.prototype.initialize.apply(
            this,
            [mediator, options, mediatorOptions]
        );
        this.map = map;
    },

    /**
     * APIMethod: enable
     *      Enable search.
     */
    enable: function() {
        if (mapfish.Searcher.prototype.enable.call(this)) {
            /* HACK: the constructors of OpenLayers handlers expect a
             * control as their first argument. Actually they expect
             * an object with a map property. So we just pass "this".
             */
            var handler = new OpenLayers.Handler.Box(
                this,
                {'done': this._triggerSearch},
                {'boxDivClassName': this.boxDivClassName}
            );
            handler.activate();
            this.handler = handler;
        }
    },

    /**
     * APIMethod: disable
     *      Disable search.
     */
    disable: function() {
        if (mapfish.Searcher.prototype.disable.call(this)) {
            var handler = this.handler;
            handler.deactivate();
            handler.destroy();
            this.handler = null;
        }
    },

    /**
     * Method: _triggerSearch
     *      Called when box is drawn.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     */
    _triggerSearch: function(bounds) {
        this.cancelSearch();
        this.doSearch(this.getSearchParams(bounds));
    },

    /**
     * Method: getSearchParams
     *      Get the search parameters.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds>}
     *
     * Returns:
     * {Object} The params object
     */
    getSearchParams: function(bounds) {
        var map = this.map;
        var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom)); 
        var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top)); 
        var box = ll.lon.toFixed(4) + ", " + ll.lat.toFixed(4) + ", " + 
                  ur.lon.toFixed(4) + ", " + ur.lat.toFixed(4);
        var params = {'box': box};
        return OpenLayers.Util.extend(this.params, params);
    }
});
