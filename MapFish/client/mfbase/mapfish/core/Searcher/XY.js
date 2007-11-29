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
 * @requires OpenLayers/Events.js
 */

mapfish.Searcher.XY = OpenLayers.Class(mapfish.Searcher, {

    /**
     * APIProperty: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * APIProperty: radius
     * {Integer} - The search radius around the clicked point.
     */
    radius: null,

    /**
     * Property: evt
     * {<OpenLayers.Event>}
     */
    evt: null,

    /**
     * Constructor: mapfish.Searcher.XY
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     * radius - {Integer}
     * mediator - {<mapfish.SearchMediator>}
     * url - {String}
     * callback - {Function}
     * maxFeatures - {Integer}
     */
    initialize: function(map, radius, mediator, url, callback, maxFeatures) {
        mapfish.Searcher.prototype.initialize.apply(
            this, [mediator, url, callback, maxFeatures]);
        this.map = map;
        this.radius = radius;
    },

    /**
     * APIMethod: enable
     *      Enable search.
     */
    enable: function() {
        if (mapfish.Searcher.prototype.enable.call(this)) {
            this.map.events.register("click", this, this._onMapClick);
        }
    },

    /**
     * APIMethod: disable
     *      Disable search.
     */
    disable: function() {
        if (mapfish.Searcher.prototype.disable.call(this)) {
            this.map.events.unregister("click", this, this._onMapClick);
        }
    },

    /**
     * Method: _onMapClick
     *      Called on click on map.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    _onMapClick: function(evt) {
        this.cancelSearch();
        this.doSearch(this.getSearchParams(evt));
        this.evt = evt;
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: onGotFeatures
     *      Default callback invoked upon receiving features from the search
     *      service.
     *
     * Parameters:
     * features - Array({<OpenLayers.Feature.Vector>})
     */
    onGotFeatures: function(features) {
        if (features && features.length > 0) {
            var lonlat = this.map.getLonLatFromViewPortPx(this.evt.xy);
            var popup = new OpenLayers.Popup.AnchoredBubble("__tooltip__", lonlat,
                new OpenLayers.Size(200, 150), null, null, true);
            // build HTML table
            var html = "<div style=\"overflow:auto;width:190px;height:140px\"><table>";
            html += "<tr>";
            for (var k in features[0].attributes) {
                 html += "<th>" + k + "</th>";
            }
            html += "</tr>";
            for (var i = 0; i < features.length; i++) {
                attributes= features[i].attributes;
                html += "<tr>";
                for (var k in attributes) {
                    html += "<td>" +  attributes[k] + "</td>";
                }
                html += "</tr>";
            }
            html += "</table></div>";
            popup.setOpacity(0.8);
            popup.setContentHTML(html);
            this.map.addPopup(popup, true);
        }
        // HACK: reregister onGotFeatures in the mediator. Without this
        // onGotFeatures is called with the same features ever.
        this.mediator.callback = OpenLayers.Function.bind(this.onGotFeatures, this);
    },

    /**
     * Method: getSearchParams
     *      Get the search parameters.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     *
     * Returns:
     * {Object} The params object
     */
    getSearchParams: function(evt) {
        var lonlat = this.map.getLonLatFromViewPortPx(evt.xy);
        var params = {'lon': lonlat.lon, 'lat': lonlat.lat, 'radius': this.radius};
        return OpenLayers.Util.extend(this.params, params);
    }
});
