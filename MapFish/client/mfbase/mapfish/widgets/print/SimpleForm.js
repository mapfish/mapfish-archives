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
 * Class: mapfish.widgets.print.SimpleForm
 *
 * Will automatically take the layers from the given {<OpenLayers.Map>} instance.
 *
 * @requires widgets/print/Base.js
 */

Ext.namespace('mapfish.widgets');
Ext.namespace('mapfish.widgets.print');

mapfish.widgets.print.SimpleForm = Ext.extend(mapfish.widgets.print.Base, {
    /**
     * APIProperty: formConfig
     * {Object} - The configuration options passed to the form.
     *
     * Can contain additionnal items for custom fields. Their values will be
     * passed to the print service
     */
    formConfig: null,

    /**
     * Property: scale
     * {Ext.form.ComboBox} - The scale combobox.
     */
    scale: null,

    /**
     * Property: rectangle
     * {OpenLayers.Feature.Vector} - The rectangle representing the extent.
     */
    rectangle: null,

    /**
     * Method: fillComponent
     * Called by initComponent to create the component's sub-elements.
     */
    fillComponent: function() {
        var formConfig = OpenLayers.Util.extend({
            //by default, we don't want borders for the inner form
            border: false,
            bodyBorder: false
        }, this.formConfig);
        var formPanel = this.formPanel = new Ext.form.FormPanel(formConfig);

        var layoutStore = new Ext.data.JsonStore({
            root: "layouts",
            fields: ['name'],
            data: this.config
        });

        var layout = formPanel.add({
            fieldLabel: OpenLayers.Lang.translate('mf.print.layout'),
            xtype: 'combo',
            store: layoutStore,
            displayField: 'name',
            valueField: 'name',
            typeAhead: false,
            mode: 'local',
            emptyText: 'Select one...',
            id: 'layout_' + this.getId(),
            name: '/layout',
            editable: false,
            triggerAction: 'all',
            value: this.config.layouts[0].name
        });
        layout.on('select', this.updateRectangle, this);

        var dpiStore = new Ext.data.JsonStore({
            root: "dpis",
            fields: ['name', 'value'],
            data: this.config
        });

        formPanel.add({
            fieldLabel: OpenLayers.Lang.translate('mf.print.dpi'),
            xtype: 'combo',
            store: dpiStore,
            displayField: 'name',
            valueField: 'value',
            typeAhead: false,
            mode: 'local',
            emptyText: 'Select one...',
            id: 'dpi_' + this.getId(),
            name: '/dpi',
            editable: false,
            triggerAction: 'all',
            value: this.config.dpis[0].value
        });

        var scaleStore = new Ext.data.JsonStore({
            root: "scales",
            fields: ['name', 'value'],
            data: this.config
        });

        this.scale = formPanel.add({
            fieldLabel: OpenLayers.Lang.translate('mf.print.scale'),
            xtype: 'combo',
            store: scaleStore,
            displayField: 'name',
            valueField: 'value',
            typeAhead: false,
            mode: 'local',
            emptyText: 'Select one...',
            id: 'scale_' + this.getId(),
            name: 'scale',
            editable: false,
            triggerAction: 'all',
            value: this.config.scales[this.config.scales.length - 1].value
        });
        this.scale.on('select', this.updateRectangle, this);

        formPanel.addButton({
            text: OpenLayers.Lang.translate('mf.print.resetPos'),
            scope: this,
            handler: function() {
                this.setCurScale(this.fitScale(this.getCurLayout()));
                this.createTheRectangle();
            }
        });

        formPanel.addButton({
            text: OpenLayers.Lang.translate('mf.print.print'),
            scope: this,
            handler: this.print
        });

        this.add(formPanel);
    },

    /**
     * Method: updateRectangle
     *
     * Used when the layout has been changed
     */
    updateRectangle: function() {
        this.layer.removeFeatures(this.rectangle);
        var center = this.rectangle.geometry.getBounds().getCenterLonLat();
        this.rectangle = this.createRectangle(center,
                this.getCurScale(), this.getCurLayout());
    },

    createTheRectangle: function() {
        if (this.rectangle) this.layer.removeFeatures(this.rectangle);
        this.rectangle = this.createRectangle(this.map.getCenter(),
                this.getCurScale(), this.getCurLayout());
    },

    /**
     * Method: afterLayerCreated
     * Called just after the layer has been created
     */
    afterLayerCreated: function() {
        this.setCurScale(this.fitScale(this.getCurLayout()));
        this.createTheRectangle();
    },

    getCurLayout: function() {
        var values = this.formPanel.getForm().getValues();
        var layoutName = values['/layout'];
        return this.getLayoutForName(layoutName);
    },

    getCurScale: function() {
        var values = this.formPanel.getForm().getValues();
        return this.getScaleForName(values['scale']);
    },

    setCurScale: function(value) {
        this.scale.setValue(value);
    },

    /**
     * Method: getCurDpi
     * Returns the user selected DPI.
     */
    getCurDpi: function() {
        var values = this.formPanel.getForm().getValues();
        return this.getDpiForName(values["dpi"]);
    },

    /**
     * Method: fillSpec
     * Add the page definitions and set the other parameters.
     *
     * Parameters:
     * printCommand - {<mapfish.PrintProtocol>} The print definition to fill.
     */
    fillSpec: function(printCommand) {
        var singlePage = {
            center: this.getCenterRectangle(this.rectangle)
        };
        var params = printCommand.spec;
        params.pages.push(singlePage);

        this.formPanel.getForm().items.each(function(cur) {
            var name = cur.getName();
            if (OpenLayers.String.startsWith(name, "/")) {
                params[name.substr(1)] = cur.getValue();
            } else {
                singlePage[name] = cur.getValue();
            }
        }, this);
    }
});

Ext.reg('print-simple', mapfish.widgets.print.SimpleForm);
