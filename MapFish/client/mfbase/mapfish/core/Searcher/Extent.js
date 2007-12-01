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
 * @requires OpenLayers/Map.js
 * @requires OpenLayers/Events.js
 * @requires OpenLayers/Util.js
 */

mapfish.Searcher.Extent = OpenLayers.Class(mapfish.Searcher, {

    /**
     * Property: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * Constructor: mapfish.Searcher.Extent
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
            this.map.events.register('moveend', this, this._onMoveend);
        }
    },

    /**
     * APIMethod: disable
     *      Disable search.
     */
    disable: function() {
        if (mapfish.Searcher.prototype.disable.call(this)) {
            this.map.events.unregister('moveend', this, this._onMoveend);
        }
    },

    /**
     * Method: _onMoveend
     *      Called when user is done panning the map.
     *
     * Parameters:
     * e - {<OpenLayers.Event>}
     */
    _onMoveend: function(e) {
        this.doSearch(this.getSearchParams());
        OpenLayers.Event.stop(e);
    },

    /**
     * Method: getSearchParams
     *      Get the search parameters.
     *
     * Returns:
     * {Object} The params object
     */
    getSearchParams: function() {
        var bbox = this.map.getExtent().toBBOX();
        var params = {'box': bbox};
        return OpenLayers.Util.extend(this.params, params);
    }
});
