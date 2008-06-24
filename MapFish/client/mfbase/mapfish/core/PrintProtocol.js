/**
 * Class: mapfish.PrintProtocol
 *
 * For communicating with the print module.
 *
 * This class will automatically pick the layers from the OL map and create the
 * configuration structure accordingly.
 *
 * As we often want a sligtly different styling or minScale/maxScale, an
 * override functionallity is provided that allows to override the OL layers'
 * configuration. This can be used as well if a layer's URL points to a
 * TileCache service to allow the print module to access the WMS service
 * directly.
 *
 * @requires OpenLayers/Console.js
 * @requires OpenLayers/Format/JSON.js
 * @requires OpenLayers/Request/XMLHttpRequest.js
 */
mapfish.PrintProtocol = OpenLayers.Class({
    /**
     * APIProperty: config
     * {String} the configuration as returned by the MapPrinterServlet.
     */
    config: null,

    /**
     * APIProperty: spec
     * {Object} The complete spec to send to the servlet. You can use it to add
     * custom parameters.
     */
    spec: null,

    /**
     * Constructor: OpenLayers.Layer
     *
     * Parameters:
     * map - {OpenLayers.Map} The OL MAP.
     * config - {Object} the configuration as returned by the MapPrinterServlet.
     * overrides - {Object} the map that specify the print module overrides for
     *                      each layers.
     * dpi - {Integer} the DPI resolution  
     */
    initialize: function(map, config, overrides, dpi) {
        this.config = config;
        this.spec = {pages: []};
        this.addMapParams(overrides, map, dpi);
    },

    //TODO: we'll need some cleaner way to add pages and others to the spec.

    /**
     * APIMethod: getAllInOneUrl
     *
     * Creates the URL string for generating a PDF using the print module. Using
     * the direct method.
     *
     * WARNING: this method has problems with accents and requests with lots of
     *          pages. But it has the advantage to work without proxy.
     */
    getAllInOneUrl: function() {
        var json = new OpenLayers.Format.JSON();
        return this.config.printURL + "?spec=" +
               json.write(this.encodeForURL(this.spec));
    },

    /**
     * APIMethod: createPDF
     *
     * Uses AJAX to create the PDF on the server and then gets it from the
     * server. If it doesn't work (different URL and OpenLayers.ProxyHost not
     * set), try the GET direct method.   
     *
     * Parameters:
     * success - {Function} The function to call in case of success.
     * failure - {Function} The function to call in case of failure. Gets the
     *                      request object in parameter.
     * context - {Object} The context to use to call the success of failure
     *                    method
     */
    createPDF: function(success, failure, context) {
        try {
            //The charset seems always to be UTF-8, regardless of the page's
            var charset = "UTF-8";
            /*+document.characterSet*/
            var specTxt = new OpenLayers.Format.JSON().write(this.spec);
            OpenLayers.Console.info(specTxt);
            OpenLayers.Request.POST({
                url: this.config.createURL,
                data: specTxt,
                params: {
                    url: this.config.createURL
                },
                headers: {
                    'CONTENT-TYPE': "application/json; charset=" + charset
                },
                callback: function(request) {
                    if (request.status >= 200 && request.status < 300) {
                        var json = new OpenLayers.Format.JSON();
                        var answer = json.read(request.responseText);
                        if (answer && answer.getURL) {
                            OpenLayers.Console.info(answer.getURL);
                            if(window.open(answer.getURL)) {
                                success.call(context);
                            } else {
                                failure.call(context, answer);
                            }
                        } else {
                            failure.call(context, request);
                        }
                    } else {
                        failure.call(context, request);
                    }
                },
                scope: this
            });
        } catch (err) {
            OpenLayers.Console.warn(
                    "Cannot request the print service by AJAX. You must set " +
                    "the 'OpenLayers.ProxyHost' variable. Fallback to GET method");
            //try the other method
            window.open(this.getAllInOneUrl());
            success.call(context, err);
        }
    },

    /**
     * Method: addMapParams
     *
     * Takes an OpenLayers Map and build the configuration needed for
     * the print module.
     */
    addMapParams: function(overrides, map, dpi) {
        var spec = this.spec;
        spec.dpi = dpi;
        spec.units = map.baseLayer.units;
        spec.srs = map.baseLayer.projection.getCode();
        var layers = spec.layers = [];
        for (var i = 0; i < map.layers.length; ++i) {
            var olLayer = map.layers[i];
            var layerOverrides = OpenLayers.Util.extend({}, overrides[olLayer.name]);

            //allows to have some attributes averriden in fct of the resolution
            OpenLayers.Util.extend(layerOverrides, layerOverrides[dpi]);

            if (olLayer.getVisibility() && layerOverrides.visibility != false) {
                var type = olLayer.CLASS_NAME;
                var handler = mapfish.PrintProtocol.SUPPORTED_TYPES[type];
                if (handler) {
                    var layer = handler.call(this, olLayer);
                    if (layer) {
                        this.applyOverrides(layer, layerOverrides);
                        layers.push(layer)
                    }
                } else if (!handler) {
                    OpenLayers.Console.error(
                            "Don't know how to print a layer of type " + type +
                            " (" + olLayer.name + ")");
                }
            }
        }
    },

    /**
     * Method: applyOverrides
     *
     * Change the layer config according to the overrides.
     */
    applyOverrides: function(layer, overrides) {
        for (var key in overrides) {
            if (isNaN(parseInt(key))) {
                var value = overrides[key];
                if (key == 'layers' || key == 'styles') {
                    value = this.fixArray(value);
                }
                if (layer[key] != null) {
                    layer[key] = value;
                } else {
                    layer.customParams[key] = value;
                }
            }
        }
    },

    /**
     * Method: convertWMSLayer
     *
     * Builds the layer configuration from an {OpenLayers.Layer.WMS} layer.
     * The structure expected from the print module is:
     * <pre>
     * {
     *   type: 'WMS'
     *   baseURL: {String}
     *   layers: [{String}]
     *   styles: [{String}]
     *   format: {String}
     *   customParams: {
     *     {String}: {String}
     *   }
     * }
     * </pre>
     *
     * Parameters:
     * olLayer - {OpenLayers.Layer.WMS} The OL layer.
     *
     * Returns:
     * {Object} The configfor this layer
     */
    convertWMSLayer: function(olLayer) {
        var url = olLayer.url;
        if (url instanceof Array) {
            url = url[0];
        }
        var layer = {
            type: 'WMS',
            layers: this.fixArray(olLayer.params.LAYERS),
            baseURL: url,
            format: olLayer.params.FORMAT || olLayer.DEFAULT_PARAMS.format,
            styles: this.fixArray(olLayer.params.STYLES ||
                                  olLayer.DEFAULT_PARAMS.styles),
            opacity: (olLayer.opacity != null) ? olLayer.opacity : 1.0,
            customParams: {}
        };
        for (var paramName in olLayer.params) {
            var paramNameLow = paramName.toLowerCase();
            if (olLayer.DEFAULT_PARAMS[paramNameLow] == null &&
                paramNameLow != 'layers' &&
                paramNameLow != 'width' &&
                paramNameLow != 'height' &&
                paramNameLow != 'srs') {
                layer.customParams[paramName] = olLayer.params[paramName];
            }
        }
        return layer;
    },

    /**
     * Method: fixArray
     *
     * In some fields, OpenLayers allows to use a coma separated string instead
     * of an array. This method make sure we end up with an array.
     *
     * Parameters:
     * subs - {String/Array}
     *
     * Returns:
     * {Array}
     */
    fixArray: function(subs) {
        if (subs == '' || subs == null) {
            return [];
        } else if (subs instanceof Array) {
            return subs;
        } else {
            return subs.split(',');
        }
    },

    /**
     * Method: encodeForURL
     *
     * Takes a JSON structure and encode it so it can be added to an HTTP GET
     * URL. Does a better job with the accents than encodeURIComponent().
     * @param cur
     */
    encodeForURL: function(cur) {
        var type = typeof cur;
        Ext.type(cur);
        if (type == 'string') {
            return escape(cur.replace(/[\n]/g, "\\n"));
        } else if (type == 'object' && cur.constructor == Array) {
            var array = [];
            for (var i = 0; i < cur.length; ++i) {
                array.push(this.encodeForURL(cur[i]));
            }
            return array;
        } else if (type == 'object') {
            var hash = {};
            for (var j in cur) {
                hash[j] = this.encodeForURL(cur[j]);
            }
            return hash;
        } else {
            return cur;
        }
    },

    CLASS_NAME: "mapfish.PrintProtocol"
});


/**
 * APIFunction: getConfiguration
 *
 * Does an AJAX call to get the print configuration from the server.
 *
 * Parameters:
 * url - {String} the URL to access .../config.json
 * success - {Function} the function that will be called with the
 *           configuration object when/if its received.
 * failure - {Function} the function that is called in case of error.
 * context - {Object} The context to use when calling the callbacks.
 */
mapfish.PrintProtocol.getConfiguration = function(url, success,
                                                  failure, context) {
    try {
        OpenLayers.Request.GET({
            url: url,
            params: {
                url: url
            },
            callback: function(request) {
                if (request.status >= 200 && request.status < 300) {
                    var json = new OpenLayers.Format.JSON();
                    var answer = json.read(request.responseText);
                    if(answer) {
                        success.call(context, answer);
                    } else {
                        failure.call(context, request);
                    }
                } else {
                    failure.call(context, request);
                }
            }
        });
    } catch(err) {
        failure.call(context, err);
    }
}


mapfish.PrintProtocol.IGNORED = function() {
    return null;
};

mapfish.PrintProtocol.SUPPORTED_TYPES = {
    'OpenLayers.Layer': mapfish.PrintProtocol.IGNORED,
    'OpenLayers.Layer.WMS': mapfish.PrintProtocol.prototype.convertWMSLayer,
    'OpenLayers.Layer.WMS.Untiled': mapfish.PrintProtocol.prototype.convertWMSLayer
};

