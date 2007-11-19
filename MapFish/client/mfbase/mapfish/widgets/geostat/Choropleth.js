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
Ext.extend(mapfish.widgets.geostat.Choropleth, Ext.Container, {
    
    // FIXME generate unique id's
    
    mainTemplate: new Ext.Template(
            '<input type="text" id="Xindicator" size="20"/>',
            '<input type="text" id="Xmethod" size="20"/>',
            '<input type="text" id="XnumClasses" size="10"/>',
            '<input type="text" id="colorA" value="#FFFF00" size="10" />',
            '<input type="text" id="colorB" value="#FF0000" size="10" />',
            '<div id="button" ></div>'
    ),
    
    initComponent : function() {
    },

    // private
    onRender : function(container, position) {
    
        if(!this.el){
            this.el = document.createElement('div');
        }
        
        mapfish.widgets.geostat.Choropleth.superclass.onRender.apply(this, arguments);
    
        this.mainTemplate.overwrite(this.el, {});
        
        var store = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : this.indicators
        });
        
        var combo = new Ext.form.ComboBox({
            name: 'Xindicator',
            hiddenName: 'indicator',
            store: store,
            valueField: 'value',
            displayField:'text',
            mode: 'local',
            triggerAction: 'all',
            emptyText:'Select an indicator...',
            selectOnFocus:true,
            editable: false,
            applyTo: 'Xindicator'
        });
        
        var store = new Ext.data.SimpleStore({
            fields: ['value', 'text'],
            data : [['CLASSIFY_BY_EQUAL_INTERVALS', 'Equal Intervals'],
                    ['CLASSIFY_BY_QUANTILS', 'Quantils']]
        });
        
        var combo = new Ext.form.ComboBox({
            name: 'Xmethod',
            hiddenName: 'method',
            store: store,
            valueField: 'value',
            displayField:'text',
            mode: 'local',
            triggerAction: 'all',
            emptyText:'Select an method...',
            selectOnFocus:true,
            editable: false,
            applyTo: 'Xmethod'
        });
        
        var store = new Ext.data.SimpleStore({
            fields: ['value'],
            data: [[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]
        });
        
        var combo = new Ext.form.ComboBox({
            name: 'XnumClasses',
            hiddenName: 'numClasses',
            store: store,
            valueField: 'value',
            displayField:'value',
            value: 5,
            mode: 'local',
            triggerAction: 'all',
            selectOnFocus:true,
            editable: false,
            applyTo: 'XnumClasses'
        });
        combo.on('select', this.updateNumClasses, this);
        
        var color_field = new Ext.ux.ColorField({
            fieldLabel: 'Color',
            id: 'colorA',
            width: 100,
            allowBlank: false,
            applyTo: 'colorA'
        });
        color_field.on('valid', this.updateColors, this);
        
        var color_field = new Ext.ux.ColorField({
            fieldLabel: 'Color',
            id: 'colorB',
            width: 100,
            allowBlank: false,
            applyTo: 'colorB'
        });
        color_field.on('valid', this.updateColors, this);
        
        var ok_button = new Ext.Button({
            text: 'OK',
            applyTo: 'button'
        });
        ok_button.on('click', this.classify, this);
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
     */
    classify: function() {
        var indicator = Ext.get('indicator').getValue();
        if (!indicator) {
            Ext.MessageBox.alert('Error', 'You must choose an indicator');
            return;
        }
        
        var method = Ext.get('method').getValue();
        if (!method) {
            Ext.MessageBox.alert('Error', 'You must choose a method');
            return;
        }
        
        var numClasses = Ext.get('numClasses').getValue();
        
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
        colorA.setFromHex(Ext.get('colorA').getValue());
        var colorB = new mapfish.ColorRgb();
        colorB.setFromHex(Ext.get('colorB').getValue());
        
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
