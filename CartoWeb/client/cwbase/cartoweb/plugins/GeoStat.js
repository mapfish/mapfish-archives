dojo.provide("cartoweb.plugins.GeoStat");

dojo.require("cartoweb.plugins.CartoWeb");

CartoWeb.GeoStat = OpenLayers.Class({
    
    /**
     * Property: layer
     * {<OpenLayers.Layer>}
     */
    layer: null,
    
    /**
     * Property: idAttribute
     * {String} Defines the attribute that gives the feature name (id)
     */
    idAttribute: null,
    
    /**
     * Property: indicatorAttribute
     * {String} Defines the attribute to apply classification on
     */
    indicatorAttribute: null,
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(layer, options) {
    
        this.layer = layer;
        
        this.addOptions(options);
    },
    
    /**
     * Method: addOptions
     * 
     * Parameters:
     * newOptions - {Object}
     */
    addOptions: function (newOptions) {
        if (this.options == null) {
            this.options = {};
        }
        
        // update our copy for clone
        OpenLayers.Util.extend(this.options, newOptions);

        // add new options to this
        OpenLayers.Util.extend(this, newOptions);
    },
    
    /**
     * APIMethod: applyClassification
     * Should be overwriten in subClasses
     */
    applyClassification: function () {},
    

    /**
     * APIMethod: showDetails
     *    Hides previously shown details
     *    ie. Removes created popup
     *    is typically called by the selectFeature
     *    handler onSelect callback
     *
     * Parameters:
     * feature - {<OpenLayers.Feature>}
     */
    showDetails: function(feature) {
        // Store feature style for restoration later
        if(feature.originalStyle == null) {
            feature.originalStyle = feature.style;
        }
        this.layer.selectedFeatures.push(feature);
        
        var selectStyle = OpenLayers.Util.extend({}, CartoWeb.GeoStat.selectStyle);
        OpenLayers.Util.applyDefaults(selectStyle, feature.style);
        
        this.layer.drawFeature(feature, selectStyle);

        // popup html
        var html = '<h4 style="margin-top: 5px">'+ feature.attributes[this.idAttribute] +'</h4>';
        html += this.indicatorAttribute + ": " + feature.attributes[this.indicatorAttribute];
        feature.data['popupContentHTML'] = html;
        
        for(var i=0; i < this.layer.map.popups.length; i++) {
            this.layer.map.removePopup(this.layer.map.popups[i]);
        }
        
        // create popup located in the bottom right of the map
        // TODO place the popup in regard to the mouse position
        var bounds = this.layer.map.getExtent();
        var lonlat = new OpenLayers.LonLat(bounds.right, bounds.bottom);
        var size = new OpenLayers.Size(200, 100);
        
        var popup = new OpenLayers.Popup.AnchoredBubble(
            feature.attributes[this.idAttribute], 
            lonlat, size, html, 0.5, false);
        popup.setBackgroundColor(feature.style.fillColor);

        this.layer.map.addPopup(popup);
    },
    
    /**
     * APIMethod: hideDetails
     *    Hides previously shown details
     *    ie. Removes created popup
     *    is typically called by the selectFeature
     *    handler onSelect callback
     *
     * Parameters:
     * feature - {<OpenLayers.Feature>}
     */
    hideDetails: function(feature) {
        this.layer.drawFeature(feature, feature.style);
    
        for(var i=0; i < this.layer.map.popups.length; i++) {
            if (this.layer.map.popups[i].id == feature.attributes[this.idAttribute]) {
                this.layer.map.removePopup(this.layer.map.popups[i]);
            }
        }
    },
    
    CLASS_NAME: "CartoWeb.GeoStat"
    
});

// select style for geostat
CartoWeb.GeoStat.selectStyle = {
    strokeColor: "red",
    cursor: 'pointer'
}

        
/**
 * This method overrides the one in <OpenLayers.BaseTypes>
 *    should be removed when http://trac.openlayers.org/ticket/876 is fixed
 */
Function.prototype.bind = function() {
    var __method = this;
    var args = [];
    var object = arguments[0];
    
    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    
    return function(moreargs) {
        var my_args = [], i;
        for (i = 0; i < args.length; i++) {
            my_args.push(args[i]);
        }
        for (i = 0; i < arguments.length; i++) {
            my_args.push(arguments[i]);
        }
        return __method.apply(object, my_args);
    };
};
