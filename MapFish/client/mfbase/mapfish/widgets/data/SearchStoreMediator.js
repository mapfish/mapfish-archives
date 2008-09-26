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

/**
 * @requires widgets/data/FeatureStoreMediator.js
 * @requires core/SearchMediator.js
 */

Ext.namespace('mapfish.widgets', 'mapfish.widgets.data');

/**
 * Class: mapfish.widgets.data.SearchStoreMediator
 * This class is to be used when one wants to insert search results (features)
 * in a store; it works by listening to a search mediator's "searchfinished"
 * and "clear" events.
 *
 * Usage example:
 * (start code)
 * var searchMediator = new mapfish.SearcherMediator({
 *     protocol: new mapfish.Protocol.MapFish({
 *         url: "web_service_url"
 *     })
 * });
 * var store = new Ext.data.Store({
 *     reader: new mapfish.widgets.data.FeatureReader(
 *         {}, [{name: "name", type: "string"}]
 *     )
 * });
 * var mediator = new mapfish.widgets.data.SearchStoreMediator({
 *     store: store,
 *     searchMediator: searchMediator,
 *     filter: function(feature) {
 *         return feature.state != OpenLayers.State.UNKNOWN;
 *     }
 * });
 * (end)
 */

/**
 * Constructor: mapfish.widgets.data.SearchStoreMediator
 * Create an instance of mapfish.widgets.data.SearchStoreMediator.
 *
 * Parameters:
 * config - {Object} A config object used to set the search
 *     store mediator's properties (see below for the list
 *     of supported properties), and configure it with the
 *     Ext store; see the usage example above.
 *
 * Returns:
 * {<mapfish.widgets.data.SearchStoreMediator>}
 */
mapfish.widgets.data.SearchStoreMediator = function(config){
    var store = config.store;
    // no need to place the store in the instance
    delete config.store;
    Ext.apply(this, config);
    if (!this.searchMediator) {
        OpenLayers.Console.error(
            "config does not include a searchMediator property");
    }
    this.featureStoreMediator = new mapfish.widgets.data.FeatureStoreMediator({
        store: store
    });
    if (this.autoActivate) {
        this.activate();
    }
};

mapfish.widgets.data.SearchStoreMediator.prototype = {
    /**
     * APIProperty: searchMediator
     * {<mapfish.SearchMediator>} The search mediator object (required).
     */
    searchMediator: null,

    /**
    /**
     * APIProperty: append
     * {Boolean} False if the store must be cleared before adding new
     * features into it, false otherwise; defaults to true.
     */
    append: true,

    /**
     * APIProperty: filter
     * {Function} a filter function called for each feature to be
     * inserted, the feature is passed as an argument to the function,
     * if it returns true the feature is inserted into the store,
     * otherwise the feature is not inserted.
     */
    filter: null,

    /**
     * APIProperty: autoActivate
     * {Boolean} True if the mediator must be activated as part of
     * its creation, false otherwise; if false then the mediator must
     * be explicitely activate using the activate method; defaults
     * to true.
     */
    autoActivate: true,

    /**
     * Property: active
     * {Boolean}
     */
    active: false,

    /**
     * Property: featureStoreMediator
     * {<mapfish.widgets.data.featureStoreMediator>} An internal
     * feature store mediator for manually adding features to the
     * Ext store.
     */
    featureStoreMediator: null,

    /**
     * APIMethod: activate
     * Activate the mediator.
     *
     * Returns:
     * {Boolean} - False if the mediator was already active, true
     * otherwise.
     */
    activate: function() {
        if (!this.active) {
            this.searchMediator.events.on({
                searchfinished: this.onSearchfinished,
                clear: this.onClear,
                scope: this
            });
            this.active = true;
            return true;
        }
        return false;
    },

    /**
     * APIMethod: deactivate
     * Deactivate the mediator.
     *
     * Returns:
     * {Boolean} - False if the mediator was already deactive, true
     * otherwise.
     */
    deactivate: function() {
        if (this.active) {
            this.searchMediator.events.un({
                searchfinished: this.onSearchfinished,
                clear: this.onClear,
                scope: this
            });
            this.active = false;
            return true;
        }
        return false;
    },

    /**
     * Method: onSearchfinished
     * Called when the {<mapfish.SearchMediator>} gets a search response.
     *
     * Parameters:
     * result - {OpenLayers.Protocol.Response} The protocol response.
     */
    onSearchfinished: function(response) {
        if (response.success()) {
            var features = response.features;
            if (features && features.length > 0) {
                this.featureStoreMediator.addFeatures(features, {
                    append: this.append, filter: this.filter
                });
            }
        }
    },

    /**
     * Method: onClear
     *      Called by the {<mapfish.SearchMediator>} when the result should be
     *      cleared.
     */
    onClear: function() {
        this.featureStoreMediator.removeFeatures();
    }
};
