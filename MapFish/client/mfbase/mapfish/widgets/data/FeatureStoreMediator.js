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
 * @requires widgets/data/FeatureReader.js
 */

Ext.namespace('mapfish.widgets', 'mapfish.widgets.data');

/**
 * Class: mapfish.widgets.data.FeatureStoreMediator
 * This class is to be used when one wants to insert features in a store.
 */

/**
 * Constructor: mapfish.widgets.data.FeatureStoreMediator
 * Create an instance of mapfish.widgets.data.FeatureStoreMediator
 */
mapfish.widgets.data.FeatureStoreMediator = function(config){
    Ext.apply(this, config);
    if (!this.store) {
        OpenLayers.Console.error(
            "store is missing in the config");
    }
    if (!(this.store.reader instanceof mapfish.widgets.data.FeatureReader)) {
        OpenLayers.Console.error(
            "store does not use a FeatureReader");
    }
};

mapfish.widgets.data.FeatureStoreMediator.prototype = {
    /**
     * APIProperty: store
     * {Ext.data.Store} An Ext data store
     */
    store: null,

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
     * APIMethod: addFeatures
     *      Add features to the store.
     * 
     * Parameters:
     * features - {<OpenLayers.Feature.Vector>} or
     *     {Array{<OpenLayers.Feature.Vector>}} A feature or an
     *     array of features to add to the store.
     * config - a config object which can include the properties
     *     "append" and "filter", if set these properties will
     *     override that set in the object.
     */
    addFeatures: function(features, config) {
        if (!Ext.isArray(features)) {
            features = [features];
        }
        config = OpenLayers.Util.applyDefaults(config,
            {append: this.append, filter: this.filter});
        var toAdd = features;
        if (this.filter) {
            toAdd = [];
            var feature;
            for (var i = 0, len = features.length; i < len; i++) {
                feature = features[i];
                if (config.filter(feature)) {
                    toAdd.push(feature);
                }
            }
        }
        this.store.loadData(toAdd, config.append);
    },

    /**
     * APIMethod: removeFeatures
     *      Remove features from the store.
     *
     * Parameters:
     * features - {<OpenLayers.Feature.Vector>} or
     *      {Array{<OpenLayers.Feature.Vector>}} A feature or an
     *      array of features to remove from the store. If null
     *      all the features in the store are removed.
     */
    removeFeatures: function(features) {
        if (!features) {
            this.store.removeAll();
        } else {
            if (!Ext.isArray(features)) {
                features = [features];
            }
            for (var i = 0, len = features.length; i < len; i++) {
                var feature = features[i];
                var r = this.store.getById(feature.id);
                if (r !== undefined) {
                    this.store.remove(r);
                }
            }
        }
    }
};
