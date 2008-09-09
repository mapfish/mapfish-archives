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

/*
 * @requires OpenLayers/Util.js
 * @requires OpenLayers/Protocol/HTTP.js
 * @requires OpenLayers/Feature/Vector.js
 * @requires OpenLayers/Format/GeoJSON.js
 * @requires core/Protocol.js
 */

/**
 * Class: mapfish.Protocol.MapFish
 * MapFish Protocol class. This class is a decorator class to
 * <OpenLayers.Protocol.HTTP>
 *
 * Inherits from:
 * - <OpenLayers.Protocol.HTTP>
 */

mapfish.Protocol.MapFish = OpenLayers.Class(OpenLayers.Protocol.HTTP, {

    /**
     * Constructor: mapfish.Protocol.MapFish
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        options = options || {};
        options.format = new OpenLayers.Format.GeoJSON();
        OpenLayers.Protocol.HTTP.prototype.initialize.call(this, options);
    },

    /**
     * APIMethod: create
     *      Create features.
     *
     * Parameters:
     * features - {Array({<OpenLayers.Feature.Vector>})} or
     *            {<OpenLayers.Feature.Vector>}
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     *      object, whose "priv" property references the HTTP request, this 
     *      object is also passed to the callback function when the request
     *      completes, its "features" property is then populated with the
     *      the features received from the server.
     */
    "create": function(features, options) {
        options = options || {};
        options.headers = OpenLayers.Util.extend(
            options.headers, {"Content-Type": "plain/text"});
        return OpenLayers.Protocol.HTTP.prototype.create.call(
            this, features, options);
    },

    /**
     * Method: callbackCreate
     *
     * Parameters:
     * options - {Object} The user options passed to the read call.
     * resp - {<OpenLayers.Protocol.Response>} The
     *      <OpenLayers.Protocol.Response> object to pass to the user
     *      callback.
     * request - {Object} The request object returned by XHR.
     */
    callbackCreate: function(options, resp, request) {
        if (options.callback) {
            var code = request.status;
            if (code == 201) {
                // success
                resp.features = this.readResponse(request);
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.features = null;
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },

    /**
     * Method: read
     * Construct a request for reading new features.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     *      object, whose "priv" property references the HTTP request, this 
     *      object is also passed to the callback function when the request
     *      completes, its "features" property is then populated with the
     *      the features received from the server.
     */
    "read": function(options) {
        if (options) {
            this.filterAdapter(options);
        }
        return OpenLayers.Protocol.HTTP.prototype.read.call(
            this, options);
    },

    /**
     * Method: callbackRead
     *
     * Parameters:
     * options - {Object} The user options passed to the read call.
     * resp - {<OpenLayers.Protocol.Response>} The
     *      <OpenLayers.Protocol.Response> object to pass to the user
     *      callback.
     * request - {Object} The request object returned by XHR.
     */
    callbackRead: function(options, resp, request) {
        if (options.callback) {
            var code = request.status;
            if (code == 200) {
                // success
                resp.features = this.readResponse(request);
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.features = null;
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },

    /**
     * Method: filterAdapter
     *      If params has a filter property and if that filter property
     *      is an OpenLayers.Filter that the MapFish protocol can deal
     *      with, the filter is adapted to the MapFish protocol.
     *
     * Parameters:
     * options - {Object}
     */
    filterAdapter: function(options) {
        if (!options ||
            !options.filter ||
            !options.filter.CLASS_NAME) {
            // bail out
            return;
        }
        var className = options.filter.CLASS_NAME;
        var str = className.substring(
            className.indexOf('.') + 1, className.lastIndexOf('.')
        );
        if (str != "Filter") {
            // bail out
            return;
        }
        // ok, we got a filter
        var filter = options.filter;
        var filterType = className.substring(className.lastIndexOf('.') + 1);
        switch (filterType) {
            case "Spatial":
                if (filter.type == OpenLayers.Filter.Spatial.BBOX) {
                    options.params = OpenLayers.Util.extend(
                        options.params,
                        {"box": filter.value.toBBOX()}
                    );
                    delete options.filter;
                }
                break;
            default:
                break;
        }
    },

    /**
     * Method: update
     * Construct a request updating modified features.
     *
     * Parameters:
     * features - {Array({<OpenLayers.Feature.Vector>})} or
     *            {<OpenLayers.Feature.Vector>}
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     *      object, whose "priv" property references the HTTP request, this 
     *      object is also passed to the callback function when the request
     *      completes, its "features" property is then populated with the
     *      the features received from the server.
     */
    "update": function(features, options) {
        options = options || {};
        var url = options.url ||
                  features.url ||
                  this.options.url + '/' + features.fid;
        options.url = url;
        options.headers = OpenLayers.Util.extend(
            options.headers, {"Content-Type": "plain/text"});
        return OpenLayers.Protocol.HTTP.prototype.update.call(
            this, features, options);
    },

    /**
     * Method: callbackUpdate
     *
     * Parameters:
     * options - {Object} The user options passed to the read call.
     * resp - {<OpenLayers.Protocol.Response>} The
     *      <OpenLayers.Protocol.Response> object to pass to the user
     *      callback.
     * request - {Object} The request object returned by XHR.
     */
    callbackUpdate: function(options, resp, request) {
        if (options.callback) {
            var code = request.status;
            if (code == 201) {
                // success
                resp.features = this.readResponse(request);
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.features = null;
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },

    /**
     * Method: delete
     * Construct a request deleting a removed feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     * options - {Object} Optional object for configuring the request.
     *     This object is modified and should not be reused.
     *
     * Returns:
     * {<OpenLayers.Protocol.Response>} An <OpenLayers.Protocol.Response>
     *      object, whose "priv" property references the HTTP request, this 
     *      object is also passed to the callback function when the request
     *      completes.
     */
    "delete": function(feature, options) {
        options = options || {};
        var url = options.url ||
                  feature.url ||
                  this.options.url + '/' + feature.fid;
        options.url = url;
        return OpenLayers.Protocol.HTTP.prototype["delete"].call(
            this, feature, options);
    },

    /**
     * Method: callbackDelete
     *
     * Parameters:
     * options - {Object} The user options passed to the read call.
     * resp - {<OpenLayers.Protocol.Response>} The
     *      <OpenLayers.Protocol.Response> object to pass to the user
     *      callback.
     * request - {Object} The request object returned by XHR.
     */
    callbackDelete: function(options, resp, request) {
        if (options.callback) {
            var code = request.status;
            if (code == 204) {
                // success
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                // failure
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },

    CLASS_NAME: "mapfish.Protocol.MapFish"
});
