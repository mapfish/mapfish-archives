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
     * APIProperty: hover
     * {Boolean} - Trigger search on hover as opposed to click.
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
     * Property: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * Property: evt
     * {<OpenLayers.Event>}
     */
    evt: null,

    /**
     * Property: timerId
     * {Integer} - The timer id returned by setTimeout.
     */
    timerId: null,

    /**
     * Constructor: mapfish.Searcher.XY
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
            if (!this.hover) {
                this.map.events.register("click", this, this._onMapClick);
            } else {
                this.map.events.register("mousemove", this, this._onMoveOverMap);
                this.map.events.register("mouseout", this, this._onMapOut);
            }
        }
    },

    /**
     * APIMethod: disable
     *      Disable search.
     */
    disable: function() {
        if (mapfish.Searcher.prototype.disable.call(this)) {
            if (!this.hover) {
                this.map.events.unregister("click", this, this._onMapClick);
            } else {
                this.map.events.unregister("mousemove", this, this._onMoveOverMap);
                this.map.events.unregister("mouseout", this, this._onMapOut);
            }
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
        return false;
    },

    /**
     * Method: _onMoveOverMap
     *      Called on move over map.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    _onMoveOverMap: function(evt) {
        if (this.evt == null ||
            Math.abs(evt.xy.x - this.evt.xy.x) > 2 ||
            Math.abs(evt.xy.y - this.evt.xy.y) > 2) {
            this.cancelTimer();
            // Note: with current OpenLayers code (r5333) aborting Ajax
            // requests results in exceptions. pgiraud's patch for ticket #1170
            // fixes that (<http://trac.openlayers.org/ticket/1170>).
            this.cancelSearch();
            this.evt = evt;
            this.timerId = setTimeout(
                OpenLayers.Function.bind(this._onTimedOut, this), this.hoverTimeout);
        }
        return true;
    },

    /**
     * Method: _onMapOut
     *      Called when mouse moves out of map.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    _onMapOut: function(evt) {
        if (OpenLayers.Util.mouseLeft(evt, this.map.div)) {
            this.cancelTimer();
        }
        return true;
    },

    /**
     * Method: _onTimedOut
     *      Called when user hasen't moved the mouse for 1 sec. Triggers
     *      search request.
     */
    _onTimedOut: function() {
        this.cancelSearch();
        this.doSearch(this.getSearchParams(this.evt));
    },

    /**
     * Method: cancelTimer
     *      Cancels the timer.
     */
    cancelTimer: function() {
        // warning: timerId can possibly be 0
        if (this.timerId != null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
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
        var params = {'lon': lonlat.lon, 'lat': lonlat.lat};
        return OpenLayers.Util.extend(this.params, params);
    }
});
