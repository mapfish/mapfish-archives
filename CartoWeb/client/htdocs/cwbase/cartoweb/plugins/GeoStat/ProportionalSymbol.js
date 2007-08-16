dojo.provide("cartoweb.plugins.GeoStat.ProportionalSymbol");

dojo.require("cartoweb.plugins.CartoWeb");
dojo.require("cartoweb.plugins.GeoStat");
dojo.require("cartoweb.plugins.GeoStat.Distribution");


CartoWeb.GeoStat.ProportionalSymbol = OpenLayers.Class(CartoWeb.GeoStat, {
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(layer, options) {
        CartoWeb.GeoStat.prototype.initialize.apply(this, arguments);
    },
    
    /**
     * APIMethod: applyClassification
     * This function loops into the layer's features
     *    and updates sizes
     */
    updateFeatures: function () {
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicatorAttribute];
            var size = (value - this.minVal) / (this.maxVal - this.minVal) * 
                (this.maxSize - this.minSize) + this.minSize;
            feature.style.pointRadius = size;
        }
        
        this.layer.renderer.clear();
        this.layer.moveTo(null, true);
        this.updateLegend();
    },
    
    /**
     * Method: updateLegend
     *    Update the legendDiv content with new bins label
     */
    updateLegend: function() {
        if (!this.legendDiv) {
            return;
        }
        
        this.legendDiv.innerHTML = "Needs to be done !";
        
        // TODO use css classes instead

    },
    
    CLASS_NAME: "CartoWeb.GeoStat.ProportionalSymbol"
});
