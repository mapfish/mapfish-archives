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
 * @requires core/SearchMediator.js
 * @requires OpenLayers/Util.js
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
     * Method: addLayers
     *      Add layers as request params.
     *
     * FIXME: this function should be moved elsewhere or removed.
     *
     * Parameters:
     * layers - {Array}
     */
    addLayers: function(layers) {
        if (!(layers instanceof Array)) {
            layers = [layers];
        }
        this.addParams({'layers': layers.join(',')});
    },

    /**
     * Method: removeLayers
     *      Remove layers from the params.
     *
     * FIXME: this function should be moved elsewhere or removed.
     *
     * Parameters:
     * layers - {Array}
     */
    removeLayers: function(layers) {
        if (!this.params['layers']) {
            return;
        }
        if (!layers) {
            // remove all
            this.params['layers'] = null;
        } else {
            // remove specified layers
            if (!(layers instanceof Array)) {
                layers = [layers];
            }
            var layerArray = this.params['layers'].split(',');
            for (var i = 0; i < layers.length; i++) {
                OpenLayers.Util.removeItem(layerArray, layers[i]);
            }
        }
    },

    /**
     * Method: addParams
     *      Add request params.
     *
     * Parameters:
     * params - {Object}
     *
     * Returns:
     * {Object} The resulting params object.
     */
    addParams: function(params) {
        return OpenLayers.Util.extend(this.params, params);
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
    onGotFeatures: function() {}
});
