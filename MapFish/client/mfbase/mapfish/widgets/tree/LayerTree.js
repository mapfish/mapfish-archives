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
 * @requires OpenLayers/Map.js
 * @requires OpenLayers/Layer/WMS.js
 * @requires OpenLayers/Layer/WMS/Untiled.js
 */

Ext.namespace('mapfish.widgets');

mapfish.widgets.LayerTree = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.LayerTree.superclass.constructor.call(this);
}

Ext.extend(mapfish.widgets.LayerTree, Ext.tree.TreePanel, {

    rootVisible: false,
    animate: true,
    autoScroll: true,
    loader: new Ext.tree.TreeLoader({}),
    enableDD: false,
    containerScroll: true,
    dropConfig: {appendOnly: true},
    lines: true,
    ascending: true,

    _handleModelChange: function LT__handleModelChange() {

        if (!this.map) {
            return;
        }

        var layerNameToLayer = {};
        Ext.each(this.map.layers, function(layer) {
            layerNameToLayer[layer.name] = layer;
        });

        var wmsLayers = {};

        this.getRootNode().cascade(function() {

            var node = this;
            var checked = node.attributes.checked;
            var nodeLayerName = node.attributes.layerName;

            if (!nodeLayerName) {
                return;
            }

            if (layerNameToLayer[nodeLayerName]) {
                layerNameToLayer[nodeLayerName].setVisibility(checked, true);
                return;
            }

            var wmsParts = nodeLayerName.split(":");
            if (wmsParts.length != 2) {
                return;
            }
            var layerName = wmsParts[0];
            var wmsName = wmsParts[1];
            
            if (!wmsLayers[layerName]) {
                wmsLayers[layerName] = [];
            }
            if (checked) {
                wmsLayers[layerName].push(wmsName);
            }
        });

        for (var layerName in wmsLayers) {
            var layer = layerNameToLayer[layerName];
            var wmsSubLayers = wmsLayers[layerName];

            if (wmsSubLayers.length == 0) {
                layer.setVisibility(false, true);
            } else {
                layer.params.LAYERS = wmsSubLayers;
                layer.redraw();

                layer.setVisibility(true, true);
            }
        }
    },


    _extractOLModel: function LT__extractOLModel() {
        var getLegendParams = {
            service: "WMS",
            version: "1.1.1",
            request: "GetLegendGraphic",
            exceptions: "application/vnd.ogc.se_inimage",
            format: "image/png"
        };

        // TODO: how to deal with baseLayers?
        var layers = [];

        var layersArray = this.map.layers.slice();
        if (!this.ascending) { 
            layersArray.reverse(); 
        }
        for (var i = 0; i < layersArray.length; i++) {
            var l = layersArray[i];
            var wmsChildren = [];

            if (l instanceof OpenLayers.Layer.WMS ||
                l instanceof OpenLayers.Layer.WMS.Untiled) {

                var wmsLayers = l.params.LAYERS;
          
                if (wmsLayers instanceof Array) {
                    for (var j = 0; j < wmsLayers.length; j++) {
                        var w = wmsLayers[j];

                        var iconUrl;
                        if (this.showWmsLegend) {
                            var params = OpenLayers.Util.extend({LAYER: w},
                                                                getLegendParams);
                            var paramsString = OpenLayers.Util.getParameterString(params);
                            iconUrl = l.url + paramsString;
                        }
          
                        wmsChildren.push({text: w, // TODO: i18n
                                          checked: l.getVisibility(),
                                          icon: iconUrl,
                                          layerName: l.name + ":" + w,
                                          children: [],
                                          leaf: true,
                                          cls: "cf-wms-node"
                                          });
                    }
                }
            }
            var className = '';
            // we hide the layers using css instead of removing them from the model, 
            // since this will make drag and drop reordering simpler
            if (!l.displayInLayerSwitcher) {
                className = 'x-hidden';
            }
            layers.push({text: l.name, // TODO: i18n
                         checked: l.getVisibility(),
                         cls: className,
                         layerName: (wmsChildren.length > 0 ? null : l.name),
                         children: wmsChildren,
                         leaf: wmsChildren.length == 0
                         });
        }

        return layers;
    },

    initComponent: function() {

        mapfish.widgets.LayerTree.superclass.initComponent.call(this);

        this.addListener("checkchange", function checkChange() {
            this._handleModelChange();
        }, this);

        if (!this.model) {
            this.model = this._extractOLModel();
        }

        // set the root node
        var root = new Ext.tree.AsyncTreeNode({
            text: 'Root', 
            draggable: false, // disable root node dragging
            id: 'source',
            children: this.model
        });
        this.setRootNode(root);
    },

    // private
    onRender: function(container, position) {
        if (!this.el) {
            this.el = document.createElement('div');
        }

        mapfish.widgets.LayerTree.superclass.onRender.apply(this, arguments);
    }

});
Ext.reg('layertree', mapfish.widgets.LayerTree);

