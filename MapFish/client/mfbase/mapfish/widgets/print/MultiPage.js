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

/*
 * @requires widgets/print/Base.js
 */

Ext.namespace('mapfish.widgets');
Ext.namespace('mapfish.widgets.print');

/**
 * Class: mapfish.widgets.print.MultiPage
 * Automatically takes the layers from the given {<OpenLayers.Map>} instance.
 *
 * Inherits from:
 * - {<mapfish.widgets.print.Base>}
 */

/**
 * Constructor: mapfish.widgets.print.MultiPage
 *
 * Parameters:
 * config - {Object} Config object
 */

mapfish.widgets.print.MultiPage = Ext.extend(mapfish.widgets.print.Base, {
    /**
     * APIProperty: formConfig
     * {Object} - The configuration options passed to the form that edits the
     *            options common to every pages.
     *
     * Can contain additionnal items for custom fields. Their values will be
     * passed to the print service
     */
    formConfig: null,

    /**
     * APIProperty: columns
     * {Array} - The Additionnal columns for "per page" custom fields.
     */
    columns: null,

    /**
     * Property: grid
     * {Ext.grid.EditorGridPanel} - The pages.
     */
    grid: null,

    /**
     * Property: printButton
     * {Ext.Button} - The "print" button.
     */
    printButton: null,

    /**
     * Method: fillComponent
     * Called by initComponent to create the component's sub-elements.
     */
    fillComponent: function() {
        //The inner border layout (extra level used because the
        //border layout doesn't allow to add components afterwards).
        var innerPanel = this.add({
            border: false,
            layout: 'border'
        });
        this.createGlobalForm(innerPanel);
        this.createGrid(innerPanel);
    },

    /**
     * Method: createGlobalForm
     *
     * Create the form for editing the global parameters.
     */
    createGlobalForm: function(innerPanel) {
        var formConfig = OpenLayers.Util.extend({
            region: 'south',
            bodyStyle: 'padding: 7px 0 0 0;',  //some space with the grid

            //by default, we don't want borders for the inner form
            border: false,
            bodyBorder: false
        }, this.formConfig);
        var formPanel = this.formPanel = new Ext.form.FormPanel(formConfig);

        if(this.config.layouts.length>1) {
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
                id: 'layout_' + this.getId(),
                name: 'layout',
                editable: false,
                triggerAction: 'all',
                value: this.config.layouts[0].name
            });
            layout.on('select', this.updateAllRectangles, this);
        } else {
            formPanel.add({
                xtype: 'hidden',
                name: 'layout',
                value: this.config.layouts[0].name
            });            
        }

        if(this.config.dpis.length>1) {
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
                id: 'dpi_' + this.getId(),
                name: 'dpi',
                editable: false,
                triggerAction: 'all',
                value: this.config.dpis[0].value
            });
        } else {
            formPanel.add({
                xtype: 'hidden',
                name: 'dpi',
                value: this.config.dpis[0].value
            });
        }

        this.printButton = formPanel.addButton({
            text: OpenLayers.Lang.translate('mf.print.print'),
            scope: this,
            handler: this.print,
            disabled: true
        });

        innerPanel.add(formPanel);
    },

    /**
     * Method: createGrid
     *
     * Create the grid for editing pages' parameters.
     */
    createGrid: function(innerPanel) {
        var scaleStore = new Ext.data.JsonStore({
            root: "scales",
            fields: ['name', 'value'],
            data: this.config
        });

        var scale = new Ext.form.ComboBox({
            store: scaleStore,
            displayField: 'name',
            valueField: 'value',
            typeAhead: false,
            mode: 'local',
            id: 'scale_' + this.getId(),
            name: 'scale',
            editable: false,
            triggerAction: 'all',
            value: this.config.scales[this.config.scales.length - 1].value
        });
        scale.on('select', this.updateCurrentRectangle, this);

        var self = this;
        var columns = [
            {
                header: OpenLayers.Lang.translate('mf.print.scale'),
                dataIndex: 'scale',
                editor: scale,
                renderer: function(value) { return self.getScaleName(value); }
            }
        ];
        if (this.columns) {
            columns.push.apply(columns, this.columns);
        }

        var pageFields = [];
        for (var i = 0; i < columns.length; ++i) {
            pageFields.push({
                name: columns[i].dataIndex
            });
        }
        var pages = new Ext.data.SimpleStore({
            fields: pageFields
        });

        var grid = this.grid = new Ext.grid.EditorGridPanel({
            region: 'center',
            border: false,
            id: this.getId() + 'Grid',
            autoScroll: true,
            store: pages,
            viewConfig: {forceFit: true},
            sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
            clicksToEdit: 1,
            columns: columns,
            bbar: [
                {
                    text: OpenLayers.Lang.translate('mf.print.addPage'),
                    scope: this,
                    handler: this.addPage
                },
                {
                    text: OpenLayers.Lang.translate('mf.print.remove'),
                    scope: this,
                    handler: this.removeSelected,
                    id: this.getId() + "_remove",
                    disabled: true
                },
                {
                    text: OpenLayers.Lang.translate('mf.print.clearAll'),
                    scope: this,
                    handler: this.clearPages
                }
            ]
        });
        innerPanel.add(grid);

        grid.getSelectionModel().addListener('selectionchange', this.selectionChanged, this);
        grid.getStore().addListener('update', function (store, record, operation) {
            this.updateRectangle(record);
        }, this);
        grid.getStore().addListener('remove', function (store, record, index) {
            this.layer.removeFeatures(record.data.rectangle);
            if(store.getCount()==0) {
                this.printButton.disable();
            }
        }, this);
        grid.getStore().addListener('clear', function () {
            this.layer.removeFeatures(this.layer.features);
            this.printButton.disable();
        }, this);
    },

    /**
     * Method: selectionChanged
     *
     * Called when the selection changed in the grid. Will highlight the
     * selected page and make sure it's visible.
     */
    selectionChanged: function() {
        this.updatePrintLayerStyle();
        var removeButton = Ext.getCmp(this.getId() + '_remove');
        var selected = this.grid.getSelectionModel().getSelected();
        if (selected) {
            var bounds = selected.data.rectangle.geometry.getBounds().clone();
            bounds.extend(this.map.getExtent());
            this.map.zoomToExtent(bounds);
            removeButton.enable();
        } else {
            removeButton.disable();
        }
    },

    /**
     * Method: updatePrintLayerStyle
     *
     * Update the styles of the rectangle according the selected row in the grid
     */
    updatePrintLayerStyle: function() {
        var selected = this.grid.getSelectionModel().getSelected();
        for (var i = 0; i < this.layer.features.length; ++i) {
            var feature = this.layer.features[i];
            feature.style = OpenLayers.Feature.Vector.style[feature.data.record == selected ? 'select' : 'default'];
        }
        this.layer.redraw();
    },

    /**
     * Method: addPage
     *
     * Add a page that will fit the current extent.
     */
    addPage: function() {
        var layout = this.getCurLayoutName();
        var layoutData = this.getLayoutForName(layout);
        var scale = this.fitScale(layoutData);
        var feature = this.createRectangle(this.map.getCenter(), scale, layoutData);
        var newPage = {
            scale: scale,
            rectangle: feature
        }
        for (var i = 0; i < this.columns.length; ++i) {
            var cur = this.columns[i].dataIndex;
            if (newPage[cur] == null) {
                newPage[cur] = "";
            }
        }

        var pages = this.grid.getStore();
        var record = new pages.recordType(newPage);
        pages.add(record);
        feature.data.record = record;
        this.grid.getSelectionModel().selectLastRow();
        this.printButton.enable();
    },

    /**
     * Method: clearPages
     *
     * Remove all the pages from the grid.
     */
    clearPages: function() {
        this.grid.stopEditing();
        this.grid.getStore().removeAll();
    },

    /**
     * Method: removeSelected
     *
     * Remove the selected page.
     */
    removeSelected: function() {
        this.grid.stopEditing();
        var record = this.grid.getSelectionModel().getSelected();
        this.grid.getStore().remove(record);
    },

    /**
     * Method: updateAllRectangles
     *
     * Called when the layout changes or something. Will re-create all the
     * rectangles.
     */
    updateAllRectangles: function() {
        this.grid.getStore().each(function(record) {
            this.updateRectangle(record);
        }, this);
        this.updatePrintLayerStyle();
    },

    /**
     * Method: updateCurrentRectangle
     *
     * Re-create the rectangle for the currently selected page.
     */
    updateCurrentRectangle: function() {
        this.updateRectangle(this.grid.getSelectionModel().getSelected());
        this.updatePrintLayerStyle();
    },

    /**
     * Method: updateRectangle
     *
     * Re-create the rectangle for the given record.
     *
     * Parameters:
     * record - {<Ext.data.Record>} The page's record.
     */
    updateRectangle: function(record) {
        this.grid.stopEditing();
        this.layer.removeFeatures(record.data.rectangle);
        var layout = this.getCurLayoutName();
        var layoutData = this.getLayoutForName(layout);
        var scale = record.get('scale');
        var center = record.data.rectangle.geometry.getBounds().getCenterLonLat();
        var feature = this.createRectangle(center, scale, layoutData);
        feature.data.record = record;
        record.data.rectangle = feature;
    },

    /**
     * Method: afterLayerCreated
     *
     * Called just after the layer has been created
     */
    afterLayerCreated: function() {
        var sm = this.grid.getSelectionModel();
        this.pageDrag.onStart = function(feature) {
            OpenLayers.Control.DragFeature.prototype.onStart.apply(this, arguments);
            sm.selectRecords([feature.data.record]);
        }
        this.grid.getStore().each(function(record) {
            this.layer.addFeatures(record.data.rectangle);
        }, this);
        this.updatePrintLayerStyle();
    },

    /**
     * Method: getCurDpi
     *
     * Returns the user selected DPI.
     */
    getCurDpi: function() {
        var values = this.formPanel.getForm().getValues();
        return this.getDpiForName(values["dpi"]);
    },

    /**
     * Method: getCurLayoutName
     */
    getCurLayoutName: function() {
        var values = this.formPanel.getForm().getValues();
        return values['layout'];
    },

    /**
     * Method: fillSpec
     * 
     * Add the page definitions and set the other parameters.
     *
     * Parameters:
     * printCommand - {<mapfish.PrintProtocol>} The print definition to fill.
     */
    fillSpec: function(printCommand) {
        var params = printCommand.spec;

        //take care of the global values
        this.formPanel.getForm().items.each(function(cur) {
            params[cur.getName()] = cur.getValue();
        }, this);

        //take care of the per-page values
        this.grid.getStore().each(function(record) {
            var page = {};
            for (var key in record.data) {
                if (key == 'rectangle') {
                    page.center = this.getCenterRectangle(record.data.rectangle);
                } else {
                    page[key] = record.data[key];
                }
            }
            params.pages.push(page);
        }, this);
    }
});

Ext.reg('print-multi', mapfish.widgets.print.MultiPage);
