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
 * @requires core/Color.js
 */

Ext.namespace('mapfish.widgets');

Ext.namespace('mapfish.widgets.geostat');

mapfish.widgets.geostat.Choropleth = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.geostat.Choropleth.superclass.constructor.call(this);
    OpenLayers.loadURL(this.geoStatUrl, "", this, this.parseData);
}
Ext.extend(mapfish.widgets.geostat.Choropleth, Ext.FormPanel, {
    
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
            emptyText: 'Select an indicator',
            triggerAction: 'all',
            store: new Ext.data.SimpleStore({
                fields: ['value', 'text'],
                data : this.indicators
            }),
            listeners: {
                'select': {
                    fn: function() {this.classify(false)},
                    scope: this
                }
            }
        },{
            xtype: 'combo',
            fieldLabel: 'Method',
            name: 'method',
            hiddenName: 'method',
            editable: false,
            valueField: 'value',
            displayField: 'text',
            mode: 'local',
            emptyText: 'Select a method',
            triggerAction: 'all',
            store: new Ext.data.SimpleStore({
                fields: ['value', 'text'],
                data : [['CLASSIFY_BY_EQUAL_INTERVALS', 'Equal Intervals'],
                        ['CLASSIFY_BY_QUANTILS', 'Quantils']]
            }),
            listeners: {
                'select': {
                    fn: function() {this.classify(false)},
                    scope: this
                }
            }
        },{
            xtype: 'combo',
            fieldLabel: 'Number of classes',
            name: 'numClasses',
            editable: false,
            valueField: 'value',
            displayField: 'value',
            mode: 'local',
            value: 5,
            triggerAction: 'all',
            store: new Ext.data.SimpleStore({
                fields: ['value'],
                data: [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]
            }),
            listeners: {
                'select': {
                    fn: this.updateNumClasses,
                    scope: this
                }
            }
        },{
            xtype: 'colorfield',
            fieldLabel: 'Color',
            name: 'colorA',
            width: 100,
            allowBlank: false,
            value: "#FFFF00",
            listeners: {
                'valid': {
                    fn: this.updateColors,
                    scope: this
                }
            }
        },{
            xtype: 'colorfield',
            fieldLabel: 'Color',
            name: 'colorB',
            width: 100,
            allowBlank: false,
            value: "#FF0000",
            listeners: {
                'valid': {
                    fn: this.updateColors,
                    scope: this
                }
            }
        }];
        
        this.buttons = [{
            text: 'OK',
            handler: function() {this.classify(true)},
            scope: this
        }];
        mapfish.widgets.geostat.Choropleth.superclass.initComponent.apply(this);
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
     *    the field given for attributeName
     *    Creates a new Distribution and related Classification
     *    Then creates an new Choropleths and applies classification
     *    
     * Parameters:
     * exception {Boolean} Will show a message box to user if form is incomplete
     */
    classify: function(exception) {
        var indicator = this.form.findField('indicator').getValue();
        if (!indicator) {
            if (exception) {
                Ext.MessageBox.alert('Error', 'You must choose an indicator');
            }
            return;
        }
        
        var method = this.form.findField('method').getValue();
        if (!method) {
            if (exception) {
                Ext.MessageBox.alert('Error', 'You must choose a method');
            }
            return;
        }
        
        var numClasses = this.form.findField('numClasses').getValue();
        
        if (!this.choropleth) {
            this.choropleth = new mapfish.GeoStat.Choropleth(this.map, {
                features: this.features,
                method: mapfish.GeoStat.Distribution[method],
                numClasses: numClasses,
                idAttribute: this.idAttribute,
                indicator: indicator,
                colors: this.setColors(),
                featureCallbacks: this.featureCallbacks
            });
        } else {
            this.choropleth.indicator = indicator;
            this.choropleth.method = mapfish.GeoStat.Distribution[method];
            this.choropleth.setClassification();
            this.choropleth.updateFeatures();
        }
    },
    
    /**
     * Method: setColors
     *    Retrieves the colors from form elements
     *
     * Returns:
     * {Array(<mapfish.Color>)} an array of two colors (start, end)
     */
    setColors: function() {
        var colorA = new mapfish.ColorRgb();
        colorA.setFromHex(this.form.findField('colorA').getValue());
        var colorB = new mapfish.ColorRgb();
        colorB.setFromHex(this.form.findField('colorB').getValue());
        
        return [colorA, colorB];
    },
    
    /**
     * Method: updateNumClasses
     */
    updateNumClasses: function(combo, record, index) {
        if (!this.choropleth) {
            this.classify();
            return;
        }
        
        // FIXME, we should have a setMethod method
        this.choropleth.numClasses = record.data.value;
        this.choropleth.setClassification();
        this.choropleth.updateFeatures();
    },
    
    /**
     * Method: updateColors
     */
    updateColors: function() {
        if (!this.choropleth) {
            this.classify();
            return;
        }
        
        // FIXME, we should have a setColors method
        this.choropleth.colors = this.setColors();
        this.choropleth.createColorInterpolation();
        this.choropleth.updateFeatures();
    }
});
Ext.reg('choropleth', mapfish.widgets.geostat.Choropleth);
