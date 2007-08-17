dojo.provide("cartoweb.plugins.Routing");

dojo.require("cartoweb.plugins.ServerCaller");

CartoWeb.Routing = OpenLayers.Class(CartoWeb.ServerCaller, {

    /**
     * {<OpenLayers.Layer.Vector>} Layer for rendering features.
     */
    vector: null,

    /**
     * {<OpenLayers.Format.GeoJSON>} GeoJSON parser
     */
    parser: null,

    /**
     * {<OpenLayers.Control.SelectFeature>} Select control
     */
    select: null,

    /**
     * Create a new CartoWeb.Routing 
     *
     * Parameters:
     * url - {String} URL for service.
     * options - {Object} An optional object whose properties will be used
     *     to extend the plugin.
     */
    initialize: function(url, options) {
        CartoWeb.ServerCaller.prototype.initialize.apply(this,
                                                         [url, options]);
        this.parser = new OpenLayers.Format.GeoJSON();

        this.vector = new OpenLayers.Layer.Vector("Routing");
        this.map.addLayer(this.vector);

        this.select = new OpenLayers.Control.SelectFeature(this.vector,
                                                           {selectStyle: null,
                                                            onSelect: this.onSelect,
                                                            onUnselect:this.onUnselect});
        this.map.addControl(this.select);
        this.select.activate();
    },

    onSelect: function(f) {
        // TODO
    },

    onUnselect: function(f) {
        // TODO
    },

    onSuccess: function(result) {
        this.vector.destroyFeatures();

        var features = this.parser.read(result.responseText);

        var bounds = features[0].geometry.getBounds();

        for (var i = 0; i < features.length; i++) {
            if (features[i].attributes._isSourceNode) {
                features[i].style = CartoWeb.Routing.firstPointStyle;
            } else if (features[i].attributes._isTargetNode) {
                features[i].style = CartoWeb.Routing.lastPointStyle;
            } else {
                bounds.extend(features[i].geometry.getBounds());
                features[i].style = CartoWeb.Routing.routeStyle;
            }
        }
        this.vector.addFeatures(features);

        if (!this.map.getExtent().containsBounds(bounds)) {
            this.map.zoomToExtent(bounds);
        }
    },

    onFailure: function(result) {}
});


// default style for route
CartoWeb.Routing.routeStyle = {
    strokeColor: "blue",
    strokeWidth: 6,
    strokeOpacity: 0.4
};

OpenLayers.Util.applyDefaults(CartoWeb.Routing.routeStyle,
                              OpenLayers.Feature.Vector.style['default']);

CartoWeb.Routing.firstPointStyle = {
    externalGraphic: "../../cwbase/cartoweb/widgets/routing/start.png",
    graphicWidth: 18,
    graphicHeight: 26,
    graphicYOffset: -26,
    fillOpacity: 1,
    cursor: 'pointer'
};
OpenLayers.Util.applyDefaults(CartoWeb.Routing.firstPointStyle,
                              OpenLayers.Feature.Vector.style['default']);


CartoWeb.Routing.lastPointStyle = {
    externalGraphic: "../../cwbase/cartoweb/widgets/routing/stop.png",
    graphicWidth: 18,
    graphicHeight: 26,
    graphicYOffset: -26,
    fillOpacity: 1,
    cursor: 'pointer'
};

OpenLayers.Util.applyDefaults(CartoWeb.Routing.lastPointStyle,
                              OpenLayers.Feature.Vector.style['default']);

