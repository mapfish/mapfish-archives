dojo.provide("cartoweb.plugins.Searcher");

dojo.require("cartoweb.plugins.CartoWeb");
dojo.require("cartoweb.plugins.SearchMediator");

CartoWeb.Searcher = OpenLayers.Class.create();
CartoWeb.Searcher.prototype = {
        
    mediator: null,

    enabled: false,
    
    params: null,

    initialize: function(mediator, url, callback) {
        if (mediator) {
            this.mediator = mediator;
        } else if (url) {
            var cb = callback ? callback : this.onGotFeatures.bind(this);
            this.mediator = new CartoWeb.SearchMediator(url, cb);
        }
        // register ourself in the mediator
        this.mediator.register(this);
        this.params = {};
    },
    
    enable: function() {
        if (this.enabled) {
            return false;
        }
        this.enabled = true;
        return true;
    },
    
    disable: function() {
        if (!this.enabled) {
            return false;
        }
        this.enabled = false;
        return true;
    },
    
    doSearch: function(params) {
        this.mediator.doSearch(this, params);
    },

    cancelSearch: function() {
        this.mediator.cancelSearch();
    },
    
    addLayers: function(layers) {
        if (!(layers instanceof Array)) {
            layers = [layers];
        }
        this.addParams({'layers': layers.join(',')});
    },
    
    removeLayers: function(layers) {
        if (!this.params['layers']) {
            return;
        }
        if (!layers) {
            // remove all
            this.params['layers'] = null;
        } else {
            // remove specified layers
            if (!(layers instanceof Array)) {
                layers = [layers];
            }
            var layerArray = this.params['layers'].split(',');
            for (var i = 0; i < layers.length; i++) {
                OpenLayers.Util.removeItem(layerArray, layers[i]);
            }
        }
    },

    addParams: function(params) {
        return OpenLayers.Util.extend(this.params, params);
    },
        
    /* to be overriden by subclasses */
    getSearchParams: function() {},

    /* to be overriden by subclasses */
    onGotFeatures: function() {}
}
