/*
 * Copyright (C) 2007-2008  Camptocamp
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

/**
 * @requires widgets/data/FeatureReader.js
 */

Ext.namespace('mapfish.widgets', 'mapfish.widgets.data');

/**
 * Class: mapfish.widgets.data.FeatureStore
 * This class is intended to be used when user wants a store with a
 *      Feature reader. It exposes methods to manipulate the store
 *      like add/remove features into it. It also registers listeners
 *      to layer events "featuresadded", "featuresremoved", and
 *      "featureremoved" to update the store.
 */

mapfish.widgets.data.FeatureStore = function(config){
    Ext.apply(this, config);
    // sanity checks
    if (!this.layer) {
        OpenLayers.Console.error('Mandatory param is missing: layer');
    }
    if (!this.fields) {
        this.fields = [];
    }
    if (!this.filter) {
        this.filter = function(feature) {
            return true;
        };
    }
    if (this.groupField) {
        this.store = new Ext.data.GroupingStore({
            reader: new mapfish.widgets.data.FeatureReader(
                {},
                this.fields
            ),
            groupField: this.groupField
        });
    } else {
        this.store = new Ext.data.Store({
            reader: new mapfish.widgets.data.FeatureReader(
                {},
                this.fields
            )
        });
    }
    this.layer.events.on({
        'featuresadded': this.update,
        'featuresremoved': this.update,
        'featuremodified': this.update,
        scope: this
    });
};

mapfish.widgets.data.FeatureStore.prototype = {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer.Vector>} The OpenLayers vector layer associated
     *      to that store.
     */
    layer: null,

    /**
     * APIProperty: store
     * {Ext.data.Store} An Ext data store
     */
    store: null,

    /**
     * APIProperty: filter
     * {Function}
     */
    filter: null,

    /**
     * APIMethod: addFeatures
     *      Add features to the store.
     * 
     * Parameters:
     * features - {<OpenLayers.Feature.Vector>} or
     *      {Array{<OpenLayers.Feature.Vector>}} A feature or an
     *      array of features to add to the store.
     */
    addFeatures: function(features) {
        if (!Ext.isArray(features)) {
            features = [features];
        }
        this.store.loadData(features, true);
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
            for (var i = 0; i < features.length; i++) {
                var feature = features[i];
                var r = this.store.getById(feature.id);
                if (r !== undefined) {
                    this.store.remove(r);
                }
            }
        }
    },

    /**
     * Method: update
     *      Called when features are added, removed or modified. This
     *      function empties the store, loops over the features in
     *      the layer, and for each feature calls the user-defined
     *      filter function, if the return value of the filter function
     *      evaluates to true the feature is added to the store.
     */
    update: function() {
        this.store.removeAll();
        var features = this.layer.features;
        var featuresToAdd = [];
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (this.filter(feature)) {
                featuresToAdd.push(feature);
            }
        }
        this.addFeatures(featuresToAdd);
    }
};
