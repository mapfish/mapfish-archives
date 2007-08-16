dojo.provide("cartoweb.widgets.GeoStat");

dojo.require("cartoweb.MapControl");

dojo.declare("cartoweb.widgets.GeoStat", [cartoweb.MapControl], {

    /**
     * url to get the vector features
     */
    geoStatUrl: "",
    
    /**
     * Id attribute field
     */
    idAttribute: "",
    
    /**
     * list on indicators available for the layer
     */
    indicators: null,
    
    mapCreated: function() {},
    
    /**
     * Method: parseData
     *    Parses the data returned by loadUrl
     *    reads the returned JSON and adds corresponding features
     *    to the geostat layer
     *    
     * Parameters:
     * request - {XMLHttpRequest}
     */
    parseData: function(request) {
        var parser = new OpenLayers.Format.GeoJSON();
        var doc = request.responseText;
        var features = parser.read(doc);
        this.layer.addFeatures(features);
    },
    
    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for attributeName 
     *    Creates a new Distribution and related Classification
     *    Should be implemented by subclasses.
     */
    classify: function() {},
    
    /**
     * Method: fillTemplate
     *    Adds some form elements to the template
     */
    fillTemplate: function() {
        for (var i = 0; i < this.indicators.length; i++) {
            var option = document.createElement("option");
            option.value = this.indicators[i];
            // TODO use i18n
            option.innerHTML = this.indicators[i];
            this.attributeName.appendChild(option);
        }
    }
});
