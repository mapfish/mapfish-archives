dojo.provide("cartoweb.widgets.tree.TreeContainer");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");
dojo.require("cartoweb.widgets.tree.Tree");
  

// FIXME: this widget should be a container

dojo.declare("cartoweb.widgets.tree.TreeContainer", [cartoweb.MapControl, dijit._Templated], {

    templateString: "<div></div>",
    showWmsLegend: false,
    model: null,

    postMixInProperties: function() {
        console.log("postMixInProperties ", this);
    },

	extractOLModel: function(map) {
	
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
	      
                if (dojo.isArray(wmsLayers)) {
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
          
	                    wmsChildren.push({label: w, // TODO: i18n
                                          checked: l.getVisibility(),
                                          icon: iconUrl,
                                          layerName: l.name + ":" + w
					                      });
	                }
	            }
            }
	        layers.push({label: l.name, // TODO: i18n
	                     checked: l.getVisibility(),
                         layerName: (wmsChildren.length > 0 ? null : l.name),
	                     children: wmsChildren
	                     });
	    }
	    
	    return {name: "root",
	            children: layers};
	},

    _handleOLModelChange: function(message) {
	    if (message.event != "modelChanged")
	        return;
	    console.log("new model", message.tree.model);
	    
        var layerNameToLayer = {};
        dojo.forEach(this.map.layers, function(layer) {
            layerNameToLayer[layer.name] = layer;
        });
        
        var self = this;
        var wmsLayers = {};
        
	    cartoweb.widgets.tree.TreeUtils.visit(message.tree.model, function(node) {
	        
	        var map = self.map;
	        var checked = node.checked;
            
            if (!node.layerName)
                return;
            
            if (layerNameToLayer[node.layerName]) {
                console.log("checking layer ", node.layerName, "==>", checked);
                layerNameToLayer[node.layerName].setVisibility(checked, true);
                return;
            }
            
            var wmsParts = node.layerName.split(":");
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

        console.log("To handle layers ", wmsLayers);
        for (var layerName in wmsLayers) {
            var layer = layerNameToLayer[layerName];
            var wmsLayers = wmsLayers[layerName];

            if (wmsLayers.length == 0) {
                layer.setVisibility(false, true);
            } else {
                layer.params.LAYERS = wmsLayers;
                layer.redraw();

                layer.setVisibility(true, true);
            }
        }
    },

    initWithModel: function(model) {
    
        var topicId = (this.mapId || this.id) + "_inner";
        
        if (this.map)
            dojo.subscribe(topicId, this, this._handleOLModelChange);
    
        this.tree = new cartoweb.widgets.tree.Tree({store: {}, model: model,
                                        map: this.map, id: topicId}, 
                                        this.domNode);
    
        var checkedItems = []
        cartoweb.widgets.tree.TreeUtils.visit(model, function(item) {
            if (item.checked)
                checkedItems.push(item)
        });
        dojo.forEach(checkedItems, function(item) {
            console.log("updating", item);
            this.tree._controller.updateAncestorsDescendants(item, true);
        }, this);

        this.tree._controller.syncModelToDom(this.tree);
    },

    mapCreated: function(map) {
        
        if (!this.model)
            this.model = this.extractOLModel(this.map);
        
        this.initWithModel(this.model);
    },
    
    uninitialize: function() {
        console.log("TreeContainer uninit");
        this.tree.destroyRecursive();
        
        // TODO: unsubscribe if required
    }
});
