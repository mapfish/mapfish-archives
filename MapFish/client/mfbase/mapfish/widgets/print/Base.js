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
 * @requires core/PrintProtocol.js
 * @requires OpenLayers/Control/DragFeature.js
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Geometry/Polygon.js
 */

Ext.namespace('mapfish.widgets');
Ext.namespace('mapfish.widgets.print');

/**
 * Class: mapfish.widgets.print.Base
 * Base class for the Ext panels used to communicate with the print module,
 * automatically take the layers from the given {<OpenLayers.Map>} instance.
 *
 * Inherits from:
 * - {Ext.Panel}
 */

/**
 * Constructor: mapfish.widgets.print.Base
 *
 * Parameters:
 * config - {Object} Config object
 */

mapfish.widgets.print.Base = Ext.extend(Ext.Panel, {
    /**
     * APIProperty: map
     * {<OpenLayers.Map>} - The OpenLayers Map object.
     */
    map: null,

    /**
     * APIProperty: overrides
     * {Object} the map that specify the print module overrides for each layers.
     *    They can be used of changing the OL layer's bahaviors for the print
     *   module. See the documentation in {<mapfish.PrintProtocol>}.
     */
    overrides: null,

    /**
     * APIProperty: configUrl
     * {<String>} - The URL to access .../config.json. Either this property or
     *              config must be set.
     */
    configUrl: null,

    /**
     * APIProperty: config
     * {<Object>} - The response from .../config.json. Either this property or
     *              configUrl must be set.
     */
    config: null,

    /**
     * Property: pageDrag
     * {<OpenLayers.Control.DragFeature>} - The control to move the extent
     */
    pageDrag: null,

    /**
     * Property: layer
     * {<OpenLayers.Layer>} - The layer to draw the extent
     */
    layer: null,

    /**
     * Property: mask
     * {<Ext.LoadingMask>} - The mask used when loading the configuration or
     *                       when generating the PDF
     */
    mask: null,

    layout: 'fit',

    /**
     * Method: initComponent
     * Overrides super-class initComponent method. Put in place the handlers
     * for the showing/hidding of the panel. Then call the createComponent
     *  method
     */
    initComponent: function() {
        mapfish.widgets.print.Base.superclass.initComponent.call(this);

        //for accordion
        this.on('expand', this.onShowEvent, this);
        this.on('collapse', this.onHideEvent, this);

        //for tabs
        this.on('activate', this.onShowEvent, this);
        this.on('deactivate', this.onHideEvent, this);

        if (this.overrides == null) {
            this.overrides = {};
        }

        this.on('render', function() {
            var mask = this.mask = new Ext.LoadMask(this.getEl(), {
                msg: OpenLayers.Lang.translate('mf.print.loadingConfig')
            });
            if (this.config == null) {
                mask.show();
            }
        }, this);

        if (this.config == null) {
            mapfish.PrintProtocol.getConfiguration(this.configUrl,
                    this.configReceived, this.configFailed, this);
        } else {
            this.fillComponent();
        }
    },

    configReceived: function(config) {
        if (this.mask) {
            this.mask.hide();
        }
        this.config = config;
        this.fillComponent();
        this.doLayout();
    },

    configFailed: function() {
        this.add({
            border: false,
            region: 'center',
            html: OpenLayers.Lang.translate('mf.print.serverDown')
        });
        this.doLayout();
        if (this.mask) {
            this.mask.hide();
        }
        this.config = false;
    },

    /**
     * Method: onShowEvent
     *
     * Called when the panel is activated.
     */
    onShowEvent: function() {
        if (this.config) {
            this.map.addLayer(this.getOrCreateLayer());
            this.pageDrag.activate();
        }
    },

    /**
     * Method: onHideEvent
     *
     * Called when the panel is de-activated.
     */
    onHideEvent: function() {
        if (this.config && this.pageDrag && this.layer) {
            this.pageDrag.destroy();
            this.pageDrag = null;

            this.layer.removeFeatures(this.layer.features);
            this.layer.destroy();
            this.layer = null;
        }
    },

    /**
     * Method: getOrCreateLayer
     *
     * If not already done, creates the layer used to represent the pages to
     * print.
     * Returns:
     * {<OpenLayers.Layer.Vector>}  
     */
    getOrCreateLayer: function() {
        if (!this.layer) {
            this.layer = new OpenLayers.Layer.Vector("Print" + this.getId(), {
                displayInLayerSwitcher: false,
                calculateInRange: function() {
                    return true;
                }
            });

            this.pageDrag = new OpenLayers.Control.DragFeature(this.layer);
            this.map.addControl(this.pageDrag);

            this.afterLayerCreated();
        }
        return this.layer;
    },

    /**
     * Method: createRectangle
     *
     * Create the feature representing a page to print.
     *
     * Parameters:
     * center - {<OpenLayers.LonLat>} The center of the rectangle.
     * scale - {Integer} The page's scale
     * layout - {Object} The current layout object from the configuration.
     *
     * Returns:
     * {<OpenLayers.Feature.Vector>}
     */
    createRectangle: function(center, scale, layout) {
        var extent = this.getExtent(center, scale, layout);
        var rect = extent.toGeometry();
        var feature = new OpenLayers.Feature.Vector(rect);
        this.layer.addFeatures(feature);

        return feature;
    },

    /**
     * Method: getCenterRectangle
     *
     * Parameters:
     * rectangle - {OpenLayers.Feature.Vector}
     *
     * Returns:
     * {<OpenLayers.LonLat>} The center of the rectangle.
     */
    getCenterRectangle: function(rectangle) {
        var center = rectangle.geometry.getBounds().getCenterLonLat();
        return [center.lon, center.lat];
    },

    /**
     * Method: getExtent
     *
     * Compute the page's extent.
     *
     * Parameters:
     * center - {<OpenLayers.LonLat>} The center of the rectangle.
     * scale - {Integer} The page's scale
     * layout - {Object} The current layout object from the configuration.
     *
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getExtent: function(center, scale, layout) {
        var unitsRatio = OpenLayers.INCHES_PER_UNIT[this.map.baseLayer.units];

        var size = layout.map;
        var w = size.width / 72.0 / unitsRatio * scale / 2.0;
        var h = size.height / 72.0 / unitsRatio * scale / 2.0;

        return new OpenLayers.Bounds(
                center.lon - w,
                center.lat - h,
                center.lon + w,
                center.lat + h);
    },

    /**
     * Finds the best scale to use for the given layout in function of the map's
     * extent.
     *
     * Parameters:
     * layout - {Object} The current layout object from the configuration.
     *
     * Returns:
     * {Integer} The best scale
     */
    fitScale: function(layout) {
        var availsTxt = this.config.scales;
        if (availsTxt.length == 0) return;
        var avails = [];
        for (var i = 0; i < availsTxt.length; ++i) {
            avails.push(parseFloat(availsTxt[i].value));
        }
        avails.sort(function(a, b) {
            return a - b
        });

        var bounds = this.map.getExtent();
        var unitsRatio = OpenLayers.INCHES_PER_UNIT[this.map.baseLayer.units];
        var size = layout.map;

        var targetScale = Math.min(bounds.getWidth() / size.width * 72.0 * unitsRatio,
                bounds.getHeight() / size.height * 72.0 * unitsRatio);

        var nearestScale = avails[0];
        for (var j = 1; j < avails.length; ++j) {
            if (avails[j] <= targetScale) {
                nearestScale = avails[j];
            } else {
                break;
            }
        }

        return nearestScale;
    },

    /**
     * Method: print
     *
     * Do the actual printing.
     */
    print: function() {
        //we don't want the layer used for the extent to be printed, don't we?
        this.overrides[this.layer.name] = {visibility: false};

        var printCommand = new mapfish.PrintProtocol(this.map, this.config,
                this.overrides, this.getCurDpi());

        this.fillSpec(printCommand);

        this.mask.msg = OpenLayers.Lang.translate('mf.print.generatingPDF');
        this.mask.show();
        printCommand.createPDF(
            function() { //success
                this.mask.hide();
            },
            function(request) { //failure
                if(request.getURL) {
                    Ext.Msg.alert('Warning',
                        OpenLayers.Lang.translate('mf.print.popupBlocked') +
                        '<br />' +
                        '<a href="' + request.getURL + '" target="_blanc">' +
                        request.getURL+'</a>');
                } else {
                    Ext.Msg.alert("Error",
                        OpenLayers.Lang.translate('mf.print.unableToPrint'));
                }
                this.mask.hide();
            }, this);
    },

    /**
     * Method: getLayoutForName
     *
     * Finds the layout object from the configuration by it's name.
     *
     * Parameters:
     * layoutName - {String}
     *
     * Returns:
     * {Object}  
     */
    getLayoutForName: function(layoutName) {
        var layouts = this.config.layouts;
        for (var i = 0; i < layouts.length; ++i) {
            var cur = layouts[i];
            if (cur.name == layoutName) {
                return cur;
            }
        }
    },

    /**
     * Method: getScaleForName
     *
     * Finds the scale value in function of its name.
     *
     * Parameters:
     * scaleName - {String}
     *
     * Returns:
     * {Float}  
     */
    getScaleForName: function(scaleName) {
        var scales = this.config.scales;
        for (var i = 0; i < scales.length; ++i) {
            var cur = scales[i];
            if (cur.name == scaleName) {
                return parseFloat(cur.value);
            }
        }
    },

    /**
     * Method: getScaleForName
     *
     * Finds the scale value in function of its name.
     *
     * Parameters:
     * scaleValue - {Float}
     *
     * Returns:
     * {String}  
     */
    getScaleName: function(scaleValue) {
        var scales = this.config.scales;
        for (var i = 0; i < scales.length; ++i) {
            var cur = scales[i];
            if (cur.value == scaleValue) {
                return cur.name;
            }
        }
    },

    /**
     * Method: getDpiForName
     *
     * Finds the dpi value in function of its name.
     *
     * Parameters:
     * dpiName - {String}
     *
     * Returns:
     * {Float}
     */
    getDpiForName: function(dpiName) {
        var dpis = this.config.scales;
        for (var i = 0; i < dpis.length; ++i) {
            var cur = dpis[i];
            if (cur.name == dpiName) {
                return parseInt(cur.value);
            }
        }
    },

    /**
     * Method: fillComponent
     *
     * Called by initComponent to create the component's sub-elements. To be
     * implemented by child classes.
     */
    fillComponent: null,

    /**
     * Method: afterLayerCreated
     *
     * Called just after the layer has been created. To be implemented by child
     * classes.
     */
    afterLayerCreated: null,

    /**
     * Method: getCurDpi
     *
     * Returns the user selected DPI. To be implemented by child classes.
     */
    getCurDpi: null,

    /**
     * Method: fillSpec
     * Add the page definitions and set the other parameters. To be implemented
     * by child classes.
     *
     * Parameters:
     * printCommand - {<mapfish.PrintProtocol>} The print definition to fill.
     */
    fillSpec: null
});
