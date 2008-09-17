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
 * @requires core/SearchMediator.js
 * @requires OpenLayers/Util.js
 */

/**
 * Class: mapfish.Searcher
 * Base searcher class. This class is not meant to be used directly, it serves
 * as a base class for specific searcher implementations.
 */
mapfish.Searcher = OpenLayers.Class({
        
    /**
     * Property: mediator
     * {<mapfish.SearchMediator>} - The search mediator.
     */
    mediator: null,

    /**
     * Property: enabled
     * {Boolean} - Specifies if search is enabled.
     */
    enabled: false,

    /**
     * Property: params
     * {Object} - Request parameters.
     */
    params: null,

    /**
     * Constructor: mapfish.Searcher
     *
     * Parameters:
     * mediator - {<mapfish.SearchMediator>}
     * options - {Object}
     * mediatorOptions - {Object}
     */
    initialize: function(mediator, options, mediatorOptions) {
        this.params = {};
        // create mediator if none is provided
        if (!mediator) {
            mediator = new mapfish.SearchMediator();
        }
        // set mediator options if provided
        if (mediatorOptions) {
            mediator.setOptions(mediatorOptions);
        }
        // set a default callback in mediator if none was provided
        if (!mediator.callback) {
            mediator.callback = OpenLayers.Function.bind(
                this.onGotFeatures, this
            );
        }
        this.mediator = mediator;
        // register ourself in the mediator
        mediator.register(this);
        // set options
        OpenLayers.Util.extend(this, options);
    },

    /**
     * APIMethod: enable
     *      Enable search.
     */
    enable: function() {
        if (this.enabled) {
            return false;
        }
        this.enabled = true;
        return true;
    },
 
    /**
     * APIMethod: disable
     *      Disable search.
     */
    disable: function() {
        if (!this.enabled) {
            return false;
        }
        this.enabled = false;
        return true;
    },
 
    /**
     * Method: doSearch
     *      Trigger search.
     */
    doSearch: function(params) {
        this.mediator.doSearch(this, params);
    },

    /**
     * Method: cancelSearch
     *      Cancel search request.
     */
    cancelSearch: function() {
        this.mediator.cancelSearch();
    },

    /**
     * Method: getSearchParams
     *      Get the search params.
     *
     * to be overriden by subclasses
     */
    getSearchParams: function() {},

    /**
     * Method: onGotFeatures
     *      Default callback called when features are received.
     *
     * to be overriden by subclasses
     */
    onGotFeatures: function() {},

    CLASS_NAME: "mapfish.Searcher"
});
