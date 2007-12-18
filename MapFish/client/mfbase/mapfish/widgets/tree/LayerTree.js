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
    ascending: true,

    /**
     * Method: hasCheckbox
     * Returns whether a Node has a checkbox attached to it
     *
     * Parameters:
     * node - {Ext.data.Node} node to query
     *
     * Returns:
     * {Boolean} True if the node has a checkbox
     */
    hasCheckbox: function (node) {
        return typeof(node.attributes.checked) == "boolean";
    },

    /**
     * Method: setNodeChecked
     * Sets the checked status on a node
     *
     * Parameters:
     * node - {Ext.data.Node} node to set the checked status
     * checked - {Boolean} checked status to set
     */
    setNodeChecked: function(node, checked) {
        if (!this.hasCheckbox(node))
            return;

        node.attributes.checked = checked;

        if (node.ui && node.ui.checkbox)
            node.ui.checkbox.checked = checked;
    },

    _updateCheckboxAncestors: function() {

        // Map of all the node ids not yet visited by updateNodeCheckbox
        var unvisitedNodeIds = {};
        var tree = this;

        //
        // This function updates the node checkbox according to the status of
        // the descendants. It must be called on a node checkbox nodes only.
        //
        // It is called recursively and returns a boolean:
        // - If the node has no children checkboxes, the status of the checkbox
        //   is returned
        // - Otherwise, it returns true if all the children witch checkbox are
        //   checked or false in the other case.
        //
        // As a side effect, it will update the checkbox state of the node, and
        //  remove visited node ids from the unvisitedNodeIds variable, to
        //  prevent visiting nodes multiple times.
        function updateNodeCheckbox(node) {
            if (!tree.hasCheckbox(node)) {
                console.trace();
                throw new Error(arguments.callee.name +
                                " should only be called on checkbox nodes");
            }

            var checkboxChildren = [];
            node.eachChild(function(child) {
                if (tree.hasCheckbox(child))
                    checkboxChildren.push(child)
            }, this);

            // If this node has no children with checkbox, its checked state
            // will be returned.
            if (checkboxChildren.length == 0) {
                return node.attributes.checked;
            }

            var allChecked = true;
            Ext.each(checkboxChildren, function(child) {
                if (!updateNodeCheckbox(child)) {
                    allChecked = false;
                    return false;
                }
            }, this);

            tree.setNodeChecked(node, allChecked);
            delete unvisitedNodeIds[node.id];

            return allChecked;
        }

        var checkboxNodes = [];

        this.getRootNode().cascade(function(node) {
            if (this.hasCheckbox(node)) {
                checkboxNodes.push(node);
                unvisitedNodeIds[node.id] = true;
            }
        }, this);

        // taking node from the tree order (using shift) should be more efficient
        var node;
        while (node = checkboxNodes.shift()) {
            if (unvisitedNodeIds[node.id])
                updateNodeCheckbox(node);
        }
    },

    _handleModelChange: function LT__handleModelChange(node, checked) {

        // Tree can be modified in two situations:
        //
        // 1) The user clicks on a checkbox
        // 2) The user drags a node to another location
        //
        // Situation 1) could modify the descendants and ancestors of the checkbox clicked
        // Situation 2) could only modify ancestors of the moved node and of the ancestors
        //  of the previous node location.
        //
        // Descendants updating is done below
        //
        // Ancestors updating is done in the _updateCheckboxAncestors() method.

        if (node) {
            node.cascade(function(node) {
                this.setNodeChecked(node, checked);
            }, this);
        }

        if (!this.map) {
            return;
        }

        var layerNameToLayer = {};
        Ext.each(this.map.layers, function(layer) {
            layerNameToLayer[layer.name] = layer;
        });

        var wmsLayers = {};

        this.getRootNode().cascade(function(node) {

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

        this._updateCheckboxAncestors();

        for (var layerName in wmsLayers) {
            var layer = layerNameToLayer[layerName];
            var wmsSubLayers = wmsLayers[layerName];

            if (wmsSubLayers.length == 0) {
                layer.setVisibility(false, true);
            } else {
                // If drag and drop is not active, we try to preserve the
                //  sublayer order from the one set during layer construction.
                //  We stick a property on the layer object to remember the 
                //  the original ordering.
                if (!this.enableDD) {
                    if (!layer._origLayers) {
                        layer._origLayers = layer.params.LAYERS;
                    }
                    var origLayers = layer._origLayers;
                    var orderedLayers = [];

                    for (var i = 0; i < origLayers.length; i++) {
                        var l = origLayers[i];
                        if (wmsSubLayers.indexOf(l) != -1)
                            orderedLayers.push(l);
                    }
                    wmsSubLayers = orderedLayers;
                }

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
            // FIXME: check if the above comment is still true

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

    // XXX maybe merge/refactor with _handleModelChange
    _updateOrder: function() {

        var layerNameToLayer = {};
        Ext.each(this.map.layers, function(layer) {
            layerNameToLayer[layer.name] = layer;
        });

        // TODO: handle WMS sublayers correctly
        //var wmsLayers = {};

        // DESIGN CHOICE:
        // Layers available on map but not on model will be put in the
        // bottom (beginning of map.layers array)


        function layerIndex(layers, name) {
            for (var i = 0; i < layers.length; i++) {
                var l = layers[i];
                if (l.name == name)
                    return i;
            }
            return -1;
        }

        var orderedLayers = this.map.layers.slice();
        var seenLayers = {};

        var nodes = [];
        this.getRootNode().cascade(function(node) {
            if (this.ascending)
                nodes.push(node);
            else
                nodes.unshift(node);
        }, this);

        Ext.each(nodes, function(node) {
            var nodeLayerName = node.attributes.layerName;

            if (!nodeLayerName)
                return;

            var layerName = nodeLayerName;

            var wmsParts = nodeLayerName.split(":");
            if (wmsParts.length == 2) {
                layerName = wmsParts[0];
            }

            if (seenLayers[layerName])
                return;
            seenLayers[layerName] = true;

            var index = layerIndex(orderedLayers, layerName);
            if (index == -1 || !layerNameToLayer[layerName]) {
                throw new Error("Layer " + layerName + " not available");
            }

            orderedLayers.splice(index, 1);
            orderedLayers.push(layerNameToLayer[layerName]);
        });

        this._updateCheckboxAncestors();

        this.map.layers = orderedLayers;

        for (var i = 0; i < this.map.layers.length; i++) {
            this.map.setLayerZIndex(this.map.layers[i], i);
        }
    },

    initComponent: function() {

        mapfish.widgets.LayerTree.superclass.initComponent.call(this);

        this.addListener("checkchange", function checkChange(node, checked) {
            this._handleModelChange(node, checked);
        }, this);

        var userModel = true;
        if (!this.model) {
            userModel = false;
            this.model = this._extractOLModel();
        }

        var root = {
            text: 'Root',
            draggable: false, // disable root node dragging
            id: 'source',
            children: this.model,
            leaf: false
        };

        // Pre-build the tree so that non-expanded nodes exist in the model.

        function buildTree(attributes) {
            var node = new Ext.tree.TreeNode(attributes);

            var cs = attributes.children;
            node.leaf = !cs;
            if (!cs)
                return node;

            for (var i = 0; i < cs.length; i++) {
                // XXX This index is sometimes undefined on IE for unknown reason
                if (!cs[i]) {
                    continue;
                }

                node.appendChild(buildTree(cs[i]));
            }
            return node;
        }

        this.setRootNode(buildTree(root));

        this.addListener("dragdrop", function() {
            this._updateOrder(arguments);
        }, this);

        // Synchronize the OL layer state if a usermodel is supplied
        // This means that the layers checked state defined in the model takes
        // precedence over the OL layer state

        // FIXME: is this still needed in any case if we want the state of a WMS
        //  layer / sublayers to be udpated?
        if (userModel) {
            this._handleModelChange(null, null);
            if (this.enableDD)
                this._updateOrder();
        }
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

