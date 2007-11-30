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

/**
 * @requires OpenLayers/Format/GeoJSON.js
 * @requires core/GeoStat.js
 */

Ext.namespace('mapfish.widgets');

Ext.namespace('mapfish.widgets.geostat');

mapfish.widgets.geostat.ProportionalSymbol = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.geostat.ProportionalSymbol.superclass.constructor.call(this);
    OpenLayers.loadURL(this.geoStatUrl, "", this, this.parseData);
}
Ext.extend(mapfish.widgets.geostat.ProportionalSymbol, Ext.FormPanel, {
    
    /**
     * Property: border
     *     Styling border
     */
    border: false,
    
    /**
     * Method: initComponent
     *    Inits the component
     */
    initComponent : function() {
        this.items = [{
            xtype: 'combo',
            fieldLabel: 'Indicator',
            name: 'indicator',
            editable: false,
            valueField: 'value',
            displayField: 'text',
            mode: 'local',
            emptyText: 'select an indicator',
            triggerAction: 'all',
            store: new Ext.data.SimpleStore({
                fields: ['value', 'text'],
                data : this.indicators
            })
        },{
            xtype: 'numberfield',
            fieldLabel:'Min Size',
            name: 'minSize',
            width: 30,
            value: 2,
            maxValue: 20
        },{
            xtype: 'numberfield',
            fieldLabel:'Max Size',
            name: 'maxSize',
            width: 30,
            value: 20,
            maxValue: 50
        }];
        
        
        this.buttons = [{
            text: 'OK',
            handler: this.classify,
            scope: this
        }];
        mapfish.widgets.geostat.ProportionalSymbol.superclass.initComponent.apply(this);
    },
        
    /**
     * Method: parseData
     *    Parses the data returned by loadUrl
     *    reads the returned JSON and adds corresponding features
     *    to the geostat layer
     *    
     * Parameters:
     * request - {XMLHttpRequest}
     */
    parseData: function(request) {
        var parser = new OpenLayers.Format.GeoJSON();
        var doc = request.responseText;
        var features = parser.read(doc);
        this.features = features;
    },

    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for indicator
     *    Creates a new Distribution and related Classification
     *    Then creates an new ProportionalSymbols and applies classification
     */
    classify: function() {
        var indicator = this.form.findField('indicator').getValue();
        
        if (!indicator) {
            Ext.MessageBox.alert('Error', 'You must choose an indicator');
            return;
        }
        
        var minSize = this.form.findField('minSize').getValue();
        var maxSize = this.form.findField('maxSize').getValue();
        
        if (!this.proportionalSymbol) {
            this.proportionalSymbol = new mapfish.GeoStat.ProportionalSymbol(this.map, {
                features: this.features,
                minSize: minSize,
                maxSize: maxSize,
                indicator: indicator,
                idAttribute: this.idAttribute,
                featureCallbacks: this.featureCallbacks
            });
        } else {
            this.proportionalSymbol.indicator = indicator;
            this.proportionalSymbol.minSize = minSize;
            this.proportionalSymbol.maxSize = maxSize;
            this.proportionalSymbol.setClassification();
            this.proportionalSymbol.updateFeatures();
        }
    }
});
Ext.reg('choropleth', mapfish.widgets.geostat.ProportionalSymbol);
