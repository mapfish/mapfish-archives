dojo.provide("cartoweb.plugins.GeoStat.Choropleth");

dojo.require("cartoweb.plugins.CartoWeb");
dojo.require("cartoweb.plugins.GeoStat");
dojo.require("cartoweb.plugins.GeoStat.Distribution");
dojo.require("cartoweb.plugins.Color");
dojo.require("cartoweb.plugins.GeoStat.ColorLookUpTable");


CartoWeb.GeoStat.Choropleth = OpenLayers.Class(CartoWeb.GeoStat, {
    
    /**
     * Property: colors
     * {Array(<CartoWeb.Color>} Array of colors to be applied to features
     *     We should use styles instead
     */
    colors: [],
    
    /** 
     * Property: classification 
     * {<CartoWeb.GeoStat.Classification>} Defines the different classification to use
     */
    classification: null,
    
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
     * APIMethod: updateFeatures
     * This function loops into the layer's features
     *    and apply already given classification
     */
    updateFeatures: function () {
        var boundsArray = this.classification.getBoundsArray();
        
        if (this.colors.length != this.classification.bins.length) {
            OpenLayers.Console.error("Given number of colors doesn't match");
        };
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicatorAttribute];
            for (var j = 0; j < boundsArray.length - 1; j++) {
                if (value >= boundsArray[j]
                    && value <= boundsArray[j + 1]) {
                    feature.style.fillOpacity = 1;
                    feature.style.fillColor = this.colors[j].toHexString();
                }
            }
        }
        this.layer.renderer.clear();
        this.layer.moveTo(null, true);
        this.updateLegend();
    },
    
    /**
     * APIMethod: createColorInterpolation
     *    Generates color interpolation in regard to classification
     */
    createColorInterpolation: function(minColor, maxColor) {
        var colorA = new CartoWeb.ColorRgb();
        colorA.setFromHex(minColor);
        var colorB = new CartoWeb.ColorRgb();
        colorB.setFromHex(maxColor);
        var initialColors = [colorA, colorB];
        var colorLut = new CartoWeb.GeoStat.ColorLookUpTable(initialColors);
        var nbColors = this.classification.bins.length;
        return colorLut.getColorsArrayByRgbInterpolation(nbColors);
    },
    
    /**
     * Method: updateLegend
     *    Update the legendDiv content with new bins label
     */
    updateLegend: function() {
        if (!this.legendDiv) {
            return;
        }
        
        this.legendDiv.innerHTML = "";
        
        // TODO use css classes instead
        
        for (var i = 0; i < this.classification.bins.length; i++) {
            var element = document.createElement("div");
            element.style.backgroundColor = this.colors[i].toHexString();
            element.style.width = "30px";
            element.style.height = "15px";
            element.style.cssFloat = "left";
            element.style.marginRight = "10px";
            this.legendDiv.appendChild(element);
            
            var element = document.createElement("div");
            element.innerHTML = this.classification.bins[i].label;
            element.innerHTML +=  " (" + this.classification.bins[i].nbVal + ")";
            this.legendDiv.appendChild(element);
            
            var element = document.createElement("div");
            element.style.clear = "left";
            this.legendDiv.appendChild(element);
        }
    },
    
    CLASS_NAME: "CartoWeb.GeoStat.Choropleth"
});
