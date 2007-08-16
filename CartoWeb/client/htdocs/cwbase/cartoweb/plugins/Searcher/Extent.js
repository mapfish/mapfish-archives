dojo.provide("cartoweb.plugins.Searcher.Extent");

dojo.require("cartoweb.plugins.Searcher");

CartoWeb.Searcher.Extent = OpenLayers.Class.create();
CartoWeb.Searcher.Extent.prototype =
    OpenLayers.Class.inherit(CartoWeb.Searcher, {

    map: null,
    
    initialize: function(map, mediator, url, callback) {
        CartoWeb.Searcher.prototype.initialize.apply(this, [mediator, url, callback]);
        this.map = map;
    },
    
    enable: function() {
        if (CartoWeb.Searcher.prototype.enable.call(this)) {
            this.map.events.register('moveend', this, this._onMoveend);
        }
    },
    
    disable: function() {
        if (CartoWeb.Searcher.prototype.disable.call(this)) {
            this.map.events.unregister('moveend', this, this._onMoveend);
        }
    },
        
    _onMoveend: function(e) {
        this.doSearch(this.getSearchParams());
        OpenLayers.Event.stop(e);
    },

    getSearchParams: function() {
        var bbox = this.map.getExtent().toBBOX();
        var params = {'bbox': bbox};
        return OpenLayers.Util.extend(this.params, params);
    }
});
