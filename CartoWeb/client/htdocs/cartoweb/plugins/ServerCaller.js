dojo.provide("cartoweb.plugins.ServerCaller");
dojo.require("cartoweb.plugins.CartoWeb");

CartoWeb.ServerCaller = OpenLayers.Class({
    // remote service url
    url: '',
    
    // the request default params
    params: {},

    onSuccess: function() {},
    onFailure: function() {},

    initialize: function(url, options) {
        this.url = url;
        OpenLayers.Util.extend(this, options);
    },

    onBeforeCall: function(params) {
        return true;
    },

    call: function(params) {
        if (this.onBeforeCall(params)) {
            var parameters = OpenLayers.Util.extend(this.params, params);
            new OpenLayers.Ajax.Request(this.url, 
                                        {method: 'get',
                                         parameters: OpenLayers.Util.getParameterString(parameters), 
                                         onSuccess: this.onSuccess.bind(this),
                                         onFailure: this.onFailure.bind(this)});
        }
    }
});
