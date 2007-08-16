dojo.provide("cartoweb.widgets.Map");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("cartoweb.widgets.Map", [dijit._Widget, dijit._Templated], {
    
    templateString: "<div class='mapContainer'></div>",

    postMixInProperties: function() {
        dojo.addOnLoad(this, "_createMap");
    },

    _createMap: function() {
        this.map = this.createMap(this.domNode);

        // the map if ready: inform all the controls
        dojo.publish("map.created", [{'mapId': this.id, 'map': this.map}]);
    },

    // static function
    createMap: function(mapDiv) {
        var map = new OpenLayers.Map(mapDiv);
        var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                                         "http://labs.metacarta.com/wms/vmap0",
                                         {layers: 'basic'} );
        map.addLayer(layer);
        map.setCenter(new OpenLayers.LonLat(5, 40), 5);

        return map;
    }

});
