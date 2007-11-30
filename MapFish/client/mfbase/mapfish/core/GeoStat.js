/*
 * Copyright (C) 2007  Camptocamp
 *
 * This file is part of MapFish
 *
 * MapFish is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with MapFish.  If not, see <http://www.gnu.org/licenses/>.
 */
 
/**
 * In this file people will find :
 *   - GeoStat
 *   - Choropleth : extend GeoStat
 *   - Distribution
 *   - ColorLookUpTable
 *   - ProportionalSymbol : extend GeoStat
 *   - Classification
 *
 */

/**
 * @requires OpenLayers/Layer/Vector.js
 * @requires OpenLayers/Popup/AnchoredBubble.js
 * @requires OpenLayers/Feature/Vector.js
 */

mapfish.GeoStat = OpenLayers.Class({
    
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
     * Property: indicator
     * {String} Defines the attribute to apply classification on
     */
    indicator: null,
    
    /**
     * Property: features
     * {Array(<OpenLayers.Feature>)} List of features to add to the choropleth layer
     */
    features: null,
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(map, options) {
        this.map = map;
        
        this.layer = new OpenLayers.Layer.Vector("Choropleth");
        this.layer.setVisibility(false, true);
        this.map.addLayer(this.layer);
        
        this.addOptions(options);
        
        this.layer.addFeatures(this.features);
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
        
        var selectStyle = OpenLayers.Util.extend({}, mapfish.GeoStat.selectStyle);
        OpenLayers.Util.applyDefaults(selectStyle, feature.style);
        
        this.layer.drawFeature(feature, selectStyle);

        // popup html
        var html = '<h4 style="margin-top: 5px">'+ feature.attributes[this.idAttribute] +'</h4>';
        html += this.indicator + ": " + feature.attributes[this.indicator];
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
    
    CLASS_NAME: "mapfish.GeoStat"
    
});

// select style for geostat
mapfish.GeoStat.selectStyle = {
    strokeColor: "red",
    cursor: 'pointer'
}




/**
 * Distribution Class
 */
mapfish.GeoStat.Distribution = OpenLayers.Class({
    nbVal: null,
    
    minVal: null,
    
    maxVal: null,
    
    initialize: function(values) {
        this.values = values;
        this.nbVal = values.length;
        this.minVal = this.nbVal ? mapfish.Util.min(this.values) : 0;
        this.maxVal = this.nbVal ? mapfish.Util.max(this.values) : 0;
        this.meanVal = this.nbVal ? mapfish.Util.sum(this.values) / this.nbVal : 0;
        
        var stdDevNum = 0;
        
        for (var i = 0; i < this.nbVal; i++) {
            stdDevNum += Math.pow(this.values[i] - this.meanVal, 2);
        }
        if (this.nbVal > 1) {
            this.stdDevVal = Math.sqrt(stdDevNum / (this.nbVal - 1));
        } else {
            this.stdDevVal = null;
        }
    },
    
    classifyWithBounds: function(bounds) {
        var bins = [];
        var binCount = [];
        var sortedValues = [];
        for (var i = 0; i < this.values.length; i++) {
            sortedValues.push(this.values[i]);
        }
        sortedValues.sort(function(a,b) {return a-b;});
        var nbBins = bounds.length - 1;

        for (var i = 0; i < nbBins; i++) {
            binCount[i] = 0;
        }
        
        for (var i = 0; i < nbBins - 1; i) {
            if (sortedValues[0] < bounds[i + 1]) {
                binCount[i] = binCount[i] + 1;
                sortedValues.shift();
            } else {
                i++;
            }
        }
        
        binCount[nbBins - 1] = this.nbVal - mapfish.Util.sum(binCount);
        
        for (var i = 0; i < nbBins; i++) {
            var label = bounds[i].toFixed(3) + ' - ' + bounds[i + 1].toFixed(3);
            bins[i] = new mapfish.GeoStat.Bin(binCount[i], label, bounds[i], bounds[i + 1],
                i == (nbBins - 1));
        }
        return new mapfish.GeoStat.Classification(bins);
    },
    
    classifyByEqIntervals: function(nbBins) {
        var bounds = [];
        
        for(var i = 0; i <= nbBins; i++) {
            bounds[i] = this.minVal + 
                i*(this.maxVal - this.minVal) / nbBins;
        }
        
        return this.classifyWithBounds(bounds);           
    },
    
    classifyByQuantils: function(nbBins) {
        var values = this.values;
        values.sort(function(a,b) {return a-b;});
        var binSize = Math.round(this.values.length / nbBins);
        
        var bounds = [];
        var binLastValPos = (binSize == 0) ? 0 : binSize;
        
        if (values.length > 0) {
            bounds[0] = values[0];
            for (i = 1; i < nbBins; i++) {
                bounds[i] = values[binLastValPos];
                binLastValPos += binSize;
            }
            bounds.push(values[values.length - 1]);
        }
        return this.classifyWithBounds(bounds);
    },
    
    /**
     * @return integer Maximal number of classes according to the Sturge's rule
     */
    sturgesRule: function() {
        return Math.floor(1 + 3.3 * Math.log(this.nbVal, 10));
    },
    
    /**
     * APIMethod: classify
     *    This function calls the appropriate classifyBy... function.
     *    The name of classification methods are defined by class constants
     *
     * Parameters:
     * method - {Integer} Method name constant as defined in this class
     * nbBins - {Integer} Number of classes
     * bounds - {Array(Integer)} Array of bounds to be used for by bounds method
     *
     * Returns:
     * {<mapfish.GeoStat.Classification>} Classification
     */
    classify: function(method, nbBins, bounds) {
        var classification = null;
        if (!nbBins) {
            nbBins = this.sturgesRule();
        }
        switch (method) {
        case mapfish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS:
            classification = this.classifyWithBounds(bounds);
            break;
        case mapfish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS :
            classification = this.classifyByEqIntervals(nbBins);
            break;
        case mapfish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS :
            classification = this.classifyByQuantils(nbBins);
            break;
        default:
            OpenLayers.Console.error("unsupported or invalid classification method");
        }
        return classification;
    },
    
    CLASS_NAME: "mapfish.GeoStat.Distribution"
});

/**
 * Constant: mapfish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS
 */
mapfish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS = 0;

/**
 * Constant: mapfish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS
 */
mapfish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS = 1;

/**
 * Constant: mapfish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS
 */
mapfish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS = 2;


mapfish.GeoStat.Choropleth = OpenLayers.Class(mapfish.GeoStat, {
    
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { method: mapfish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS,
                      numClasses: 5,
                      colors: [
                          new mapfish.ColorRgb(120, 120, 0),
                          new mapfish.ColorRgb(255, 0, 0)
                      ]
                    },
    
    /**
     * Property: colors
     * {Array(<mapfish.Color>} Array of 2 colors to be applied to features
     *     We should use styles instead
     */
    colors: [],
    
    /**
     * Property: method
     * {Array(<mapfish.Color>} Array of colors to be applied to features
     *     We should use styles instead
     */
    method: null,
    
    /** 
     * Property: classification 
     * {<mapfish.GeoStat.Classification>} Defines the different classification to use
     */
    classification: null,
    
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(map, options) {
        OpenLayers.Util.applyDefaults(
            options, 
            this.DEFAULT_PARAMS
        );
    
        mapfish.GeoStat.prototype.initialize.apply(this, arguments);
        
        this.setClassification();
        this.updateFeatures();
        this.layer.setVisibility(true, true);
        
        this.featureCallbacks = OpenLayers.Util.extend({
                over: OpenLayers.Function.bind(this.showDetails, this),
                out: OpenLayers.Function.bind(this.hideDetails, this)
            }, this.featureCallbacks);
        // bind callbacks
        for (var i in this.featureCallbacks) {
            this.featureCallbacks[i] = OpenLayers.Function.bind(this.featureCallbacks[i], this);
        }
        
        var select = new OpenLayers.Control.SelectFeature(this.layer, {
            hover: true,
            callbacks: this.featureCallbacks
        });
        this.map.addControl(select);
        select.activate();
    },
    
    /**
     * APIMethod: Creates a classification with the features
     */   
    setClassification: function() {
        var values = [];
        var features = this.layer.features;
        for (var i = 0; i < features.length; i++) {
            values.push(features[i].attributes[this.indicator]);
        }
        var dist = new mapfish.GeoStat.Distribution(values);
        this.classification = dist.classify(
            this.method,
            this.numClasses,
            null
        );
        this.createColorInterpolation();
    },
    
    /**
     * APIMethod: updateFeatures
     * This function loops into the layer's features
     *    and apply already given classification
     */
    updateFeatures: function () {
        var boundsArray = this.classification.getBoundsArray();
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicator];
            for (var j = 0; j < boundsArray.length - 1; j++) {
                if (value >= boundsArray[j]
                    && value <= boundsArray[j + 1]) {
                    feature.style.fillOpacity = 1;
                    feature.style.fillColor = this.colorInterpolation[j].toHexString();
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
    createColorInterpolation: function() {
        var initialColors = this.colors;
        var colorLut = new mapfish.GeoStat.ColorLookUpTable(initialColors);
        var nbColors = this.classification.bins.length;
        this.colorInterpolation = colorLut.getColorsArrayByRgbInterpolation(nbColors);
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
    
    CLASS_NAME: "mapfish.GeoStat.Choropleth"
});


/**
 * Colors related classes
 */
mapfish.GeoStat.ColorLookUpTable = OpenLayers.Class({
    /**
     * Property: initialColors
     * {Array} Colors Array of <mapfish.Colors>
     *    Each methods need to be initialized with a given
     *    number of colors. In general, this number is 2.
     */
    initialColors: null,
    
    initialize: function(initialColors) {
        this.initialColors = initialColors;
    },
    
    getColorsArrayByRgbInterpolation: function(nbColors) {
        var resultColors = [];
        var colorA = this.initialColors[0].getColorRgb();
        var colorB = this.initialColors[1].getColorRgb();
        var colorAVal = colorA.getRgbArray();
        var colorBVal = colorB.getRgbArray();
        
        if (nbColors == 1) {
            return [colorA];
        }
        
        for (var i = 0; i < nbColors; i++) {
            var rgbTriplet = [];
            rgbTriplet[0] = colorAVal[0] + 
                i * (colorBVal[0] - colorAVal[0]) / (nbColors - 1);
            rgbTriplet[1] = colorAVal[1] + 
                i * (colorBVal[1] - colorAVal[1]) / (nbColors - 1);
            rgbTriplet[2] = colorAVal[2] + 
                i * (colorBVal[2] - colorAVal[2]) / (nbColors - 1);
            resultColors[i] = new mapfish.ColorRgb(parseInt(rgbTriplet[0]), 
                parseInt(rgbTriplet[1]), parseInt(rgbTriplet[2]));
        }
        
        return resultColors;
    },
    
    CLASS_NAME: "mapfish.GeoStat.ColorLookUpTable"
});

/**
 * Bin is category of the Classification.
 *     When they are defined, lowerBound is within the class
 *     and upperBound is outside de the class.
 */
mapfish.GeoStat.Bin = OpenLayers.Class({
    label: null,
    nbVal: null,
    lowerBound: null,
    upperBound: null,
    isLast: false,
    
    initialize: function(nbVal, label, lowerBound, upperBound, isLast) {
        this.nbVal = nbVal;
        this.label = label;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.isLast = isLast;
    },
    
    CLASS_NAME: "mapfish.GeoStat.Bin"
});

/**
 * Classification summarize a Distribution by regrouping data within several Bins.
 */
mapfish.GeoStat.Classification = OpenLayers.Class({
    bins: [],
    
    initialize: function(bins) {
        this.bins = bins;
    },
    
    getBoundsArray: function() {
        var bounds = [];
        for (var i = 0; i < this.bins.length; i++) {
            bounds.push(this.bins[i].lowerBound);  // TODO use getter instead ?
        }
        if (this.bins.length > 0) {
            bounds.push(this.bins[this.bins.length - 1].upperBound); // TODO use getter instead ?
        }
        return bounds;
    },
    
    CLASS_NAME: "mapfish.GeoStat.Classification"
});

/**
 * Class: mapfish.GeoStat.ProportionalSymbol
 * 
 * Mandatory options are :
 * features
 * 
 * Example usage :
 * new mapfish.GeoStat.ProportionalSymbol(this.map, {
 *              features: features,
 *              minSize: 5,
 *              maxSize: 15,
 *              indicator: 'population',
 *              featureCallbacks: {
 *                  over: showDetails,
 *                  out: hideDetails
 *              }
 *          });
 */
mapfish.GeoStat.ProportionalSymbol = OpenLayers.Class(mapfish.GeoStat, {
    
    
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { minSize: 2,
                      maxSize: 20
                    },
    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * layer - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(map, options) {
        mapfish.GeoStat.prototype.initialize.apply(this, arguments);
        
        this.setClassification();
        this.updateFeatures();
        this.layer.setVisibility(true, true);
        
        this.featureCallbacks = OpenLayers.Util.extend({
                over: OpenLayers.Function.bind(this.showDetails, this),
                out: OpenLayers.Function.bind(this.hideDetails, this)
            }, this.featureCallbacks);
        // bind callbacks
        for (var i in this.featureCallbacks) {
            this.featureCallbacks[i] = OpenLayers.Function.bind(this.featureCallbacks[i], this);
        }
        
        var select = new OpenLayers.Control.SelectFeature(this.layer, {
            hover: true,
            callbacks: this.featureCallbacks
        });
        this.map.addControl(select);
        select.activate();
    },
    
    /**
     * APIMethod: Creates a classification with the features
     */   
    setClassification: function() {
        var values = [];
        var features = this.layer.features;
        for (var i = 0; i < features.length; i++) {
            values.push(features[i].attributes[this.indicator]);
        }
        var dist = new mapfish.GeoStat.Distribution(values);
        this.minVal = dist.minVal;
        this.maxVal = dist.maxVal;
    },
    
    /**
     * APIMethod: applyClassification
     * This function loops into the layer's features
     *    and updates sizes
     */
    updateFeatures: function () {
        
        for (var i = 0; i < this.layer.features.length; i++) {
            var feature = this.layer.features[i];
            var value = feature.attributes[this.indicator];
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
    
    CLASS_NAME: "mapfish.GeoStat.ProportionalSymbol"
});
