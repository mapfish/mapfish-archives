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
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Format/GeoJSON.js
 * @requires OpenLayers/Ajax.js
 */

mapfish.SearchMediator = OpenLayers.Class({
 
    /**
     * Property: url
     * {String} - The search service URL.
     */
    url: null,

    /**
     * Property: callback
     * {Function} - The callback called when features are received
     *      from the search service.
     */
    callback: null,

    /**
     * Property: params
     * {Object} - The search request params.
     */
    params: null,

    /**
     * Property: searchers
     * Array({<mapfish.Searcher>} - Array of searchers controlled by this
     *      mediator.
     */
    searchers: null,

    /**
     * Property: parser.
     * {<OpenLayers.Format>} - The OpenLayers format used to deserialize
     *      the response sent by the service.
     */
    parser: null,

    /**
     * Property: request.
     * {Object} - The Ajax request object.
     */
    request: null,

    /**
     * Constructor: mapfish.SearchMediator
     *
     * Parameters:
     * url - {String}
     * callback - {Function}
     * params - {Object}
     */
    initialize: function(url, callback, params) {
        this.url = url;
        this.callback = callback;
        this.params = OpenLayers.Util.extend({}, params);
        this.searchers = [];
        this.parser = new OpenLayers.Format.GeoJSON();
    },

    /**
     * APIMethod: setOptions
     *      Set the mediator's options.
     *
     * Parameters:
     * options - {Object}
     */
    setOptions: function(options) {
        if (options) {
            if (options.url) {
                this.url = options.url;
            }
            if (options.callback) {
                this.callback = options.callback;
            }
            if (options.params) {
                OpenLayers.Util.extend(this.params, options.params);
            }
        }
    },

    /**
     * APIMethod: register
     *      Register a searcher in the mediator.
     *
     * Parameters:
     * searcher - {<mapfish.Searcher>}
     */
    register: function(searcher) {
        this.searchers.push(searcher);
    },

    /**
     * Method: onSuccess
     *      Callback called on ajax search request success.
     *
     * Parameters:
     * request - {Object}
     */
    onSuccess: function(request) {
        this.request = null;
        if (request &&
            request.responseText &&
            request.responseText != "" &&
            this.callback) {
            // extract features from response
            var features = this.parser.read(request.responseText);
            // pass features to user callback
            this.callback(features);
        }
    },

    /**
     * APIMethod: doSearch
     *      Trigger search request to the search service.
     *
     * Parameters:
     * searcher - {<mapfish.Searcher>}
     * params - {Object}
     */
    doSearch: function(searcher, params) {
        // build parameters string
        var allParams = this.getSearchParams(searcher, params);
        var paramsString = OpenLayers.Util.getParameterString(allParams);
        // build full request string
        var url = this.url;
        var requestString = url + (url.match(/\?/) ? '&' : '?') + paramsString;
        // send request
        this.request = new OpenLayers.Ajax.Request(
            requestString,
            {
                method: "GET",
                onSuccess: OpenLayers.Function.bind(this.onSuccess, this),
                onFailure: function() { alert('Ajax request failed'); }
            }
        );
    },

    /**
     * APIMethod: cancelSearch
     *      Cancel ongoing search request sent to the search service.
     */
    cancelSearch: function() {
        if (this.request) {
            this.request.transport.abort();
        }
    },

    /**
     * APIMethod: getSearchParams
     *      Get search params from searchers.
     *
     * Parameters:
     * searcher - {<mapfish.Searcher>}
     * params - {Object}
     */
    getSearchParams: function(searcher, params) {
        var allParams = OpenLayers.Util.extend(this.params, params);
        for (var i = 0; i < this.searchers.length; i++) {
            var s = this.searchers[i];
            if (s == searcher) {
                // we already have our caller's params
                continue;
            }
            OpenLayers.Util.extend(allParams, s.getSearchParams());
        }
        return allParams;
    }
});
