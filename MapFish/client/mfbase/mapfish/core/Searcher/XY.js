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
 * @requires OpenLayers/Handler/Click.js
 * @requires OpenLayers/Handler/Hover.js
 */

mapfish.Searcher.XY = OpenLayers.Class(mapfish.Searcher, {

    /**
     * APIProperty: hover
     * {Boolean} - Trigger search on hover as opposed to click.
     */
    hover: false,

    /**
     * APIProperty: pixelTolerance
     * {Integer} - The meaning of this property depends whether
     *      hover is true or false. If hover is false, pixelTolerance
     *      is the maximum number of pixels between mouseup and mousedown
     *      for an event to be considered a click. If hover is true,
     *      pixelTolerance is the maximum number of pixels between
     *      mousemoves for an event to be considered a pause.
     *      Default is 2 pixels.
     */
    pixelTolerance: 2,

    /**
     * APIProperty: delay
     * {Integer} - The meaning of this property depends whether
     *      hover is true or false. If hover is false, delay is
     *      the number of milliseconds between clicks before the
     *      event is considered a double-click. If hover is true,
     *      delay is the number of milliseconds between mousemoves
     *      before the event is considered a pause.
     *      Default is 300.
     */
    delay: 300,

    /**
     * APIMethod: onMouseMove
     * {Function} - Method called in hover mode, when the mouse moves. Can be
     *      used to close a tooltip, for example. The event is passed in
     *      parameter and "this" will be the XY instance.   
     */
    onMouseMove: function(evt) {},

    /**
     * Property: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * Property: evt
     * {<OpenLayers.Event>} - The last mouse click or move event that occured  
     */
    evt: null,

    /**
     * Propery: handler
     * {<OpenLayers.Handler.Click>|<OpenLayers.Handler.Hover>} - The Hover or Click handler
     */
    handler: null,

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
            var handler;
            /* HACK: the constructors of OpenLayers handlers expect a
             * control as their first argument. Actually they expect
             * an object with a map property. So we just pass "this".
             */
            if (this.hover) {
                handler = new OpenLayers.Handler.Hover(
                    this,
                    {'pause': this._triggerSearch, 'move': this._cancelSearch},
                    {'delay': this.delay, 'pixelTolerance': this.pixelTolerance}
                );
            } else {
                handler = new OpenLayers.Handler.Click(
                    this,
                    {'click': this._triggerSearch},
                    {'delay': this.delay, 'pixelTolerance': this.pixelTolerance}
                );
            }
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
     *      Called on click or pause.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    _triggerSearch: function(evt) {
        this.cancelSearch();
        this.evt = evt;
        this.doSearch(this.getSearchParams(evt));
    },

    /**
     * Method: _cancelSearch
     *      Called on mousemove.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    _cancelSearch: function(evt) {
        this.cancelSearch();
        this.onMouseMove();
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
