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
 * @requires widgets/tree/LayerTree.js
 */

/**
 * APIFunction: mapfish.widgets.LayerTree.getNodeLayers
 *
 * Parameters:
 * layerTree - {<mapfish.widget.LayerTree>}
 * node - {Ext.tree.Node} the node
 *
 * Returns:
 * {Array({<OpenLayers.Layer>})} - list of OL layers impacted by a layer tree node.
 */
mapfish.widgets.LayerTree.getNodeLayers = function(layerTree, node) {
    var olLayers = [];

    node.cascade(function(subNode) {
        var curLayers = layerTree.nodeIdToLayers[subNode.id];
        if (curLayers) {
            olLayers = olLayers.concat(curLayers);
        }
    });
    return olLayers;
};

/**
 * APIFunction: mapfish.widgets.LayerTree.removeNode
 *
 * Remove all the OL layers from the map corresponding to a node. 
 *
 * Parameters:
 * layerTree - {<mapfish.widget.LayerTree>}
 * node - {Ext.tree.Node} the layer tree node
 */
mapfish.widgets.LayerTree.removeNode = function(layerTree, node) {
    node.cascade(function(subNode) {
        if (subNode.attributes && subNode.attributes.layerNames) {
            var layerNames = subNode.attributes.layerNames;
            for (var i = 0; i < layerNames.length; ++i) {
                var layerName = layerNames[i].split(layerTree.separator);
                var olLayer = layerTree.layerNameToLayer[layerName[0]];
                var wmsLayer = layerName[1];
                var layerList;
                if(olLayer.params.LAYERS) {
                    layerList = olLayer.params.LAYERS = mapfish.Util.fixArray(olLayer.params.LAYERS);
                } else {
                    layerList = olLayer.params.layers = mapfish.Util.fixArray(olLayer.params.layers);                    
                }
                if (wmsLayer && layerList) {
                    layerList.remove(wmsLayer);
                }
                if (!wmsLayer || !layerList || layerList.length == 0) {
                    olLayer.destroy();
                } else {
                    olLayer.redraw();
                }
            }
        }
    });
    node.remove();
    layerTree._updateCachedObjects();
};

/**
 * APIConstant: mapfish.widgets.LayerTree.MenuFeatures
 *
 * Standard features that can be added to the LayerTree's contextual menu.
 *
 * Each entry is a function(layerTree, node, olLayers) that either returns a
 * menu entry or null if this feature is not relevant for the given node.
 */
mapfish.widgets.LayerTree.MenuFeatures = {
    opacitySlide: function(layerTree, node, olLayers) {
        if (olLayers.length == 0) return null;
        return {
            text: OpenLayers.Lang.translate("mf.layertree.opacity"),
            menu: {
                plain: true,  //no gray background and vertical bar at 20px
                items: [mapfish.widgets.LayerTree.MenuFeatures.opacitySlideDirect(layerTree, node, olLayers)]
            }
        };
    },

    opacitySlideDirect: function(layerTree, node, olLayers) {
        if (olLayers.length == 0) return null;
        var value = 0;
        for (var i = 0; i < olLayers.length; ++i) {
            value += olLayers[i].opacity == null ? 1.0 : olLayers[i].opacity;
        }
        value = value / olLayers.length;
        return new Ext.menu.Adapter(new Ext.Slider({
            width: 200,
            value: value * 100,
            listeners: {
                change: function(slider, value) {
                    for (var j = 0; j < olLayers.length; ++j) {
                        olLayers[j].setOpacity(value / 100.0);
                    }
                }
            }
        }));
    },

    remove: function(layerTree, node, olLayers) {
        if (olLayers.length == 0) return null;
        for(var i=0; i<olLayers.length; ++i) {
            var layer=olLayers[i];
            if(layer.isBaseLayer && layer.getVisibility()) {
                //do not allow to remove base layers 
                return null;
            }
        }
        return {
            text: OpenLayers.Lang.translate('mf.layertree.remove'),
            handler: function() {
                mapfish.widgets.LayerTree.removeNode(layerTree, node);
            }
        };
    }
};

/**
 * APIFunction: mapfish.widgets.createContextualMenuPlugin
 *
 * Creates an EXT plugin that adds a contextual menu to the layer tree.
 *
 * The standard options are:
 *  - remove: allows to remove the layer
 *  - opacitySlide: a sub menu entry that contains a slider to change the opacity
 *  - opacitySlideDirect: like opacitySlide but without sub-menu
 *
 * Options can be added by adding them to mapfish.widgets.LayerTree.MenuFeatures
 *
 * To use, add that to your LayerTree configuration:
 * (start code)
 * {
 *   xtype: 'layertree',
 *   ...
 *   plugins: [
 *     mapfish.widgets.LayerTree.createContextualMenuPlugin(['opacitySlide','remove'])
 *   ],
 *   ...
 * }
 * (end)
 *
 * Parameters:
 * options - {Array} array of features to include
 */
mapfish.widgets.LayerTree.createContextualMenuPlugin = function(options) {
    return {
        init: function(layerTree) {
            layerTree.on('contextMenu', function(node, e) {
                e.stopEvent();  //we don't want to display the browser's menu

                var olLayers = mapfish.widgets.LayerTree.getNodeLayers(layerTree, node);

                var items = [];
                for (var j = 0; j < options.length; ++j) {
                    var constructor = mapfish.widgets.LayerTree.MenuFeatures[options[j]];
                    var menuItem = constructor(layerTree, node, olLayers);
                    if (menuItem) {
                        items.push(menuItem);
                    }
                }

                //check we have something to do
                if (items.length > 0) {
                    var menu = new Ext.menu.Menu({
                        ignoreParentClick: true,
                        defaults: {
                            scope: layerTree
                        },
                        items: items
                    });

                    menu.showAt(e.getXY());

                    //allows the destruction of the menu's DOM nodes.
                    menu.on('hide', function() {
                        menu.destroy();
                    });
                }
            });
        }
    };
};