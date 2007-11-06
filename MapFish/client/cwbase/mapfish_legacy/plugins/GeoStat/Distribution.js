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


dojo.provide("mapfish.plugins.GeoStat.Distribution");

dojo.require("mapfish.plugins.MapFish");
dojo.require("mapfish.plugins.Util");

/**
 * Distribution Class
 */
MapFish.GeoStat.Distribution = OpenLayers.Class({
    nbVal: null,
    
    minVal: null,
    
    maxVal: null,
    
    initialize: function(values) {
        this.values = values;
        this.nbVal = values.length;
        this.minVal = this.nbVal ? MapFish.Util.min(this.values) : 0;
        this.maxVal = this.nbVal ? MapFish.Util.max(this.values) : 0;
        this.meanVal = this.nbVal ? MapFish.Util.sum(this.values) / this.nbVal : 0;
        
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
        
        binCount[nbBins - 1] = this.nbVal - MapFish.Util.sum(binCount);
        
        for (var i = 0; i < nbBins; i++) {
            label = bounds[i].toFixed(3) + ' - ' + bounds[i + 1].toFixed(3);
            bins[i] = new MapFish.GeoStat.Bin(binCount[i], label, bounds[i], bounds[i + 1],
                i == (nbBins - 1));
        }
        return new MapFish.GeoStat.Classification(bins);
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
     * {<MapFish.GeoStat.Classification>} Classification
     */
    classify: function(method, nbBins, bounds) {
        var classification = null;
        if (!nbBins) {
            nbBins = this.sturgesRule();
        }
        switch (method) {
        case MapFish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS:
            classification = this.classifyWithBounds(bounds);
            break;
        case MapFish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS :
            classification = this.classifyByEqIntervals(nbBins);
            break;
        case MapFish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS :
            classification = this.classifyByQuantils(nbBins);
            break;
        }
        return classification;
    },
    
    CLASS_NAME: "MapFish.GeoStat.Distribution"
});

/**
 * Constant: MapFish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS
 */
MapFish.GeoStat.Distribution.CLASSIFY_WITH_BOUNDS = 0;

/**
 * Constant: MapFish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS
 */
MapFish.GeoStat.Distribution.CLASSIFY_BY_EQUAL_INTERVALS = 1;

/**
 * Constant: MapFish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS
 */
MapFish.GeoStat.Distribution.CLASSIFY_BY_QUANTILS = 2;

/**
 * Bin is category of the Classification.
 *     When they are defined, lowerBound is within the class
 *     and upperBound is outside de the class.
 */
MapFish.GeoStat.Bin = OpenLayers.Class({
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
    
    CLASS_NAME: "MapFish.GeoStat.Bin"
});

/**
 * Classification summarize a Distribution by regrouping data within several Bins.
 */
MapFish.GeoStat.Classification = OpenLayers.Class({
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
    
    CLASS_NAME: "MapFish.GeoStat.Classification"
});