Ext.namespace('cartoweb.tree');

cartoweb.tree.LayerTree = function(map, config) {
    this.map = map;
    Ext.apply(this, config);
}

cartoweb.tree.LayerTree.prototype = {

    _handleModelChange: function LT__handleModelChange() {
    
        console.log("model change, tree: ", this.tree);

        var layerNameToLayer = {};
        Ext.each(this.map.layers, function(layer) {
            layerNameToLayer[layer.name] = layer;
        });
        console.log("layerNameToLayer", layerNameToLayer);
        
        var wmsLayers = {};

        this.tree.getRootNode().cascade(function() {

            var node = this;
            var checked = node.attributes.checked;
            var nodeLayerName = node.attributes.layerName;
            
            if (!nodeLayerName)
                return;
            
            if (layerNameToLayer[nodeLayerName]) {
                console.log("checking layer ", nodeLayerName, "==>", checked);
                layerNameToLayer[nodeLayerName].setVisibility(checked, true);
                return;
            }
            
            var wmsParts = nodeLayerName.split(":");
            if (wmsParts.length != 2)
                return;
            var layerName = wmsParts[0];
            var wmsName = wmsParts[1];
            
            if (!wmsLayers[layerName])
                wmsLayers[layerName] = [];
            if (checked) {
                wmsLayers[layerName].push(wmsName);
            }
    
        });
    
        console.log("To handle wms layers ", wmsLayers);
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
    
        var map = this.map;
    
        console.log("Show legend? ", this.showWmsLegend);

        var getLegendParams = {
            service: "WMS",
            version: "1.1.1",
            request: "GetLegendGraphic",
            exceptions: "application/vnd.ogc.se_inimage",
            format: "image/png"
        };

        // TODO: how to deal with baseLayers?
        var layers = [];

        for (var i = 0; i < map.layers.length; i++) {
            var l = map.layers[i];
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
                            console.log("Icon url", iconUrl);
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
            layers.push({text: l.name, // TODO: i18n
                         checked: l.getVisibility(),
                         layerName: (wmsChildren.length > 0 ? null : l.name),
                         children: wmsChildren,
                         leaf: wmsChildren.length == 0
                         });
        }
        
        return layers;
    },

    render: function() {

        var Tree = Ext.tree;
        console.log("building tree");

        this.tree = new Tree.TreePanel({
            el: this.el,
            rootVisible: false,
            animate: false,
            autoScroll: true,
            loader: new Tree.TreeLoader({}),
            enableDD: false,
            containerScroll: true,
            dropConfig: {appendOnly: true},
            lines: true
        });
        
        this.tree.addListener("checkchange", function checkChange() {
            console.log("checkchange event received_", arguments);
            this._handleModelChange();
        }, this);
        
        // add a tree sorter in folder mode
        //new Tree.TreeSorter(tree, {folderSort:true});
        
        if (!this.model) {
            this.model = this._extractOLModel();
        }

        // set the root node
        var root = new Tree.AsyncTreeNode({
            text: 'Root', 
            draggable: false, // disable root node dragging
            id: 'source',
            children: this.model
        });
        this.tree.setRootNode(root);
        
        // render the tree
        this.tree.render();
        root.expand(false, /*no anim*/ false);
    }
}