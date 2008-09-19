/*
 * Copyright (C) 2007-2008  Camptocamp
 *
 * This file is part of MapFish Client
 *
 * MapFish Client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish Client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MapFish Client.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Ajax.js
 * @requires OpenLayers/Filter/Logical.js
 */

/**
 * Class: mapfish.SearchMediator
 * A SearchMediator object is to be used when multiple searchers must be coupled
 * (e.g. coupling a search form with a BBOX searcher).
 */
mapfish.SearchMediator = OpenLayers.Class({

    /**
     * Property: searchers
     * Array({<mapfish.Searcher>} Array of searchers controlled by this
     *      mediator.
     */
    searchers: null,

    /**
     * Property: protocol
     * {<OpenLayers.Protocol>} The protocol to use for sending search
     *     requests.
     */
    protocol: null,

    /**
     * Property: response
     * {<OpenLayers.Protocol.Response>} The response got from the protocol.
     */
    response: null,

    /**
     * Property: events
     * {<OpenLayers.Events>}
     */
    events: null,

    /**
     * Constant: EVENT_TYPES
     * {Array(String)}
     */
    EVENT_TYPES: ["searchtriggered", "searchfinished", "searchcanceled", "clear"],

    /**
     * Constructor: mapfish.SearchMediator
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options);
        this.searchers = [];
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
    },

    /**
     * Method: destroy
     */
    destroy: function () {
        if (this.protocol.autoDestroy) {
            this.protocol.destroy();
        }
        this.protocol = null;

        this.searchers = null;

        if (this.events) {
            this.events.destroy();
            this.events = null;
        }
    },

    /**
     * Method: triggerSearch
     *      Trigger search request to the search service.
     */
    triggerSearch: function() {
        var filter = null, f = null, params = null;
        for (var i = 0, len = this.searchers.length; i < len; i++) {
            if (f = this.searchers[i].getFilter())
                filter = this.toFilter(f, filter);
        }

        this.events.triggerEvent("searchtriggered", {filter: filter});

        // workaround a bug in OpenLayers
        params = OpenLayers.Util.extend(
            {}, this.protocol.options.params);

        this.response = this.protocol.read({
            filter: filter,
            callback: this.finishSearch,
            params: params,
            scope: this
        });
    },

    /**
     * Method: finishSearch
     *      Called with we get a response from the search service.
     *
     * Parameters:
     * {<OpenLayers.Protocol.Response>} The protocol response.
     */
    finishSearch: function(response) {
        this.response = null;
        this.events.triggerEvent("searchfinished", response);
    },

    /**
     * Method: cancelSearch
     *     Cancel ongoing search.
     */
    cancelSearch: function() {
        if (this.response) {
            var response = this.response;
            if (response.priv &&
                typeof response.priv.abort == "function") {
                response.priv.abort();
                this.response = null;
                this.events.triggerEvent("searchcanceled", response);
            }
        }
    },

    /**
     * Method: toFilter
     *
     * Parameters:
     * obj - {Object}
     * filter - {<OpenLayers.Filter>}
     *
     * Returns:
     * {<OpenLayers.Filter.Logical>}
     */
    toFilter: function(obj, filter) {
        filter = filter || new OpenLayers.Filter.Logical(
            {type: OpenLayers.Filter.Logical.AND});

        var filters = filter.filters;

        if (this.isFilter(obj)) {
            filters.push(obj);
        } else {
            for (var key in obj) {
                filters.push(
                    new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: key,
                        value: obj[key]
                    })
                );
            }
        }
        return filter;
    },

    /**
     * Method: isFilter
     * Check if the object passed is a <OpenLayers.Filter> object.
     *
     * Parameters:
     * obj - {Object}
     */
    isFilter: function(obj) {
        return !!obj.CLASS_NAME &&
               !!obj.CLASS_NAME.match(/^OpenLayers\.Filter/);
    },

    /**
     * Method: clear
     *      Clear all the previous results.
     */
    clear: function() {
        this.events.triggerEvent("clear");
    },

    CLASS_NAME: "mapfish.SearchMediator"
});

