dojo.provide("cartoweb.plugins.GeoStat.Distribution");

dojo.require("cartoweb.plugins.CartoWeb");
dojo.require("cartoweb.plugins.Util");

/**
 * Distribution Class
 */
CartoWeb.GeoStat.Distribution = OpenLayers.Class({
    nbVal: null,
    
    minVal: null,
    
    maxVal: null,
    
    initialize: function(values) {
        this.values = values;
        this.nbVal = values.length;
        this.minVal = this.nbVal ? CartoWeb.Util.min(this.values) : 0;
        this.maxVal = this.nbVal ? CartoWeb.Util.max(this.values) : 0;
        this.meanVal = this.nbVal ? CartoWeb.Util.sum(this.values) / this.nbVal : 0;
        
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
        
        binCount[nbBins - 1] = this.nbVal - CartoWeb.Util.sum(binCount);
        
        for (var i = 0; i < nbBins; i++) {
            label = bounds[i].toFixed(3) + ' - ' + bounds[i + 1].toFixed(3);
            bins[i] = new CartoWeb.GeoStat.Bin(binCount[i], label, bounds[i], bounds[i + 1],
                i == (nbBins - 1));
        }
        return new CartoWeb.GeoStat.Classification(bins);
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
     * {<CartoWeb.GeoStat.Classification>} Classification
     */
    classify: function(method, nbBins, bounds) {
        var classification = null;
        if (!nbBins) {
            nbBins = this.sturgesRule();
        }
        switch (method) {
        case CartoWeb.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS:
            classification = this.classifyWithBounds(bounds);
            break;
        case CartoWeb.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS :
            classification = this.classifyByEqIntervals(nbBins);
            break;
        case CartoWeb.GeoStat.Distribution.CLASSIFY_BY_QUANTILS :
            classification = this.classifyByQuantils(nbBins);
            break;
        }
        return classification;
    },
    
    CLASS_NAME: "CartoWeb.GeoStat.Distribution"
});

/**
 * Constant: CartoWeb.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS
 */
CartoWeb.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS = 0;

/**
 * Constant: CartoWeb.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS
 */
CartoWeb.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS = 1;

/**
 * Constant: CartoWeb.GeoStat.Distribution.CLASSIFY_BY_QUANTILS
 */
CartoWeb.GeoStat.Distribution.CLASSIFY_BY_QUANTILS = 2;

/**
 * Bin is category of the Classification.
 *     When they are defined, lowerBound is within the class
 *     and upperBound is outside de the class.
 */
CartoWeb.GeoStat.Bin = OpenLayers.Class({
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
    
    CLASS_NAME: "CartoWeb.GeoStat.Bin"
});

/**
 * Classification summarize a Distribution by regrouping data within several Bins.
 */
CartoWeb.GeoStat.Classification = OpenLayers.Class({
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
    
    CLASS_NAME: "CartoWeb.GeoStat.Classification"
});