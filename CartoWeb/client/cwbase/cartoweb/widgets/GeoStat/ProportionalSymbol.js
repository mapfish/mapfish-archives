dojo.provide("cartoweb.widgets.GeoStat.ProportionalSymbol");

dojo.require("cartoweb.widgets.GeoStat");
dojo.require("cartoweb.plugins.GeoStat.ProportionalSymbol");
dojo.require("dijit._Templated");

dojo.declare("cartoweb.widgets.GeoStat.ProportionalSymbol", [cartoweb.widgets.GeoStat, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets.GeoStat", "ProportionalSymbol.html"),
    
    mapCreated: function() {
        // fill the template with variables
        this.fillTemplate();
                
        this.layer = new OpenLayers.Layer.Vector("ProportionalSymbol");
        this.layer.setVisibility(false, true);
        this.map.addLayer(this.layer);
        OpenLayers.loadURL(this.geoStatUrl, "", this, this.parseData);
    },
    
    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for attributeName 
     *    Creates a new Distribution and related Classification
     *    Then creates an new Choropleths and applies classification
     */
    classify: function() {
        var indicatorAttribute = this.attributeName.value;
        
        var values = [];
        var features = this.layer.features;
        for (var i = 0; i < features.length; i++) {
            values.push(features[i].attributes[indicatorAttribute]);
        }
        var dist = new CartoWeb.GeoStat.Distribution(values);
        
        var stat = new CartoWeb.GeoStat.ProportionalSymbol(this.layer, {
            minVal: dist.minVal,
            maxVal: dist.maxVal,
            minSize: parseInt(this.sizeA.value),
            maxSize: parseInt(this.sizeB.value),
            idAttribute: this.idAttribute,
            indicatorAttribute: indicatorAttribute,
            legendDiv: this.legend
        });
        
        stat.updateFeatures();
        
        var select = new OpenLayers.Control.SelectFeature(this.layer, {
            hover: true,
            callbacks: {
               over: stat.showDetails.bind(stat),
               out: stat.hideDetails.bind(stat)
            }
        });
        this.map.addControl(select);
        
        select.activate();
        this.layer.setVisibility(true, true);
    }
});