dojo.provide("cartoweb.plugins.Color");

dojo.require("cartoweb.plugins.CartoWeb");

/**
 * An abstract representation of color
 */
CartoWeb.Color = OpenLayers.Class({
    getColorRgb: function() {}
});

CartoWeb.ColorRgb = OpenLayers.Class(CartoWeb.Color, {
    redLevel: null,
    greenLevel: null,
    blueLevel: null,
    
    initialize: function(red, green, blue) {
        this.redLevel = red;
        this.greenLevel = green;
        this.blueLevel = blue;
    },
    
    getColorRgb: function() {
        return this;
    },
    
    getRgbArray: function() {
        return [
            this.redLevel,
            this.greenLevel,
            this.blueLevel
        ];
    },
    
    /**
     * Method: hex2rgbArray
     * Converts a Hex color string to an Rbg array 
     *
     * Parameters:
     * rgbHexString - {String} Hex color string (format: #rrggbb)
     */
    hex2rgbArray: function(rgbHexString) {
        if (rgbHexString.charAt(0) == '#') {
            rgbHexString = rgbHexString.substr(1);
        }
        var rgbArray = [
            parseInt(rgbHexString.substring(0,2),16),
            parseInt(rgbHexString.substring(2,4),16),
            parseInt(rgbHexString.substring(4,6),16)
        ];
        for (var i = 0; i < rgbArray.length; i++) {
            if (rgbArray[i] < 0 || rgbArray[i] > 255 ) {
                OpenLayers.Console.error("Invalid rgb hex color string: rgbHexString");
            }
        }        
        return rgbArray;
    },
    
    /**
     * APIMethod: setFromHex
     * Sets the color from a color hex string 
     *
     * Parameters:
     * rgbHexString - {String} Hex color string (format: #rrggbb)
     */
    setFromHex: function(rgbHexString) {        
        var rgbArray = this.hex2rgbArray(rgbHexString);
        this.redLevel = rgbArray[0];
        this.greenLevel = rgbArray[1];
        this.blueLevel = rgbArray[2];
    },
    
    /**
     * APIMethod: setFromRgb
     * Sets the color from a color rgb string
     *
     */
    setFromRgb: function(rgbString) {
        var color = dojo.colorFromString(rgbString);
        this.redLevel = color.r;
        this.greenLevel = color.g;
        this.blueLevel = color.b;
    },
    
    /**
     * APIMethod: toHexString
     * Converts the rgb color to hex string
     *
     */
    toHexString: function() {
        var r = this.toHex(this.redLevel);
        var g = this.toHex(this.greenLevel);
        var b = this.toHex(this.blueLevel);
        return '#' + r + g + b;
    },
    
    /**
     * Method: toHex
     * Converts a color level to its hexadecimal value
     *
     * Parameters:
     * dec - {Integer} Decimal value to convert [0..255]
     */
    toHex: function(dec) {
        // create list of hex characters
        var hexCharacters = "0123456789ABCDEF"
        // if number is out of range return limit
        if (dec < 0 || dec > 255 ) {
            var msg = "Invalid decimal value for color level";
            OpenLayers.Console.error(msg);
        }
        // decimal equivalent of first hex character in converted number
        var i = Math.floor(dec / 16)
        // decimal equivalent of second hex character in converted number
        var j = dec % 16
        // return hexadecimal equivalent
        return hexCharacters.charAt(i) + hexCharacters.charAt(j)
    },
    
    CLASS_NAME: "CartoWeb.Choropleth"
});