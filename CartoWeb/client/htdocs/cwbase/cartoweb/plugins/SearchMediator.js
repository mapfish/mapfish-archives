dojo.provide("cartoweb.plugins.SearchMediator");

dojo.require("cartoweb.plugins.CartoWeb");

CartoWeb.SearchMediator = OpenLayers.Class.create();
CartoWeb.SearchMediator.prototype = {
        
    url: null,
    callback: null,
    searchers: null,
    parser: null,
    request: null,

    initialize: function(url, callback) {
        this.url = url;
        this.callback = callback;
        this.searchers = [];
        this.parser = new OpenLayers.Format.GeoJSON();
    },

    register: function(searcher) {
        this.searchers.push(searcher);
    },

    onSuccess: function(request) {
        this.request = null;
        // extract features from response
        var features = this.parser.read(request.responseText);
        if (this.callback) {
            // pass features to user callback
            this.callback(features);
        }
    },

    doSearch: function(searcher, params) {
        // build parameters string
        var allParams = this.getSearchParams(searcher, params);
        var paramsString = OpenLayers.Util.getParameterString(allParams);
        // build full request string
        var url = this.url;
        var requestString = url + (url.match(/\?/) ? '&' : '?') + paramsString;
        // send request
        this.request = new OpenLayers.Ajax.Request(
            requestString,
            {
                onSuccess: this.onSuccess.bind(this),
                onFailure: function() { alert('Ajax request failed'); }
            }
        );
    },

    cancelSearch: function() {
        if (this.request) {
            this.request.transport.abort();
        }
    },

    getSearchParams: function(searcher, params) {
        var allParams = OpenLayers.Util.extend(new Object(), params);
        for (var i = 0; i < this.searchers.length; i++) {
            var s = this.searchers[i];
            if (s == searcher) {
                // we already have our caller's params
                continue;
            }
            OpenLayers.Util.extend(allParams, s.getSearchParams());
        }
        return allParams;
    }
}
