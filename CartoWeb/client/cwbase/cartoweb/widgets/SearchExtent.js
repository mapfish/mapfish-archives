dojo.provide("cartoweb.widgets.SearchExtent");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");
dojo.require("cartoweb.plugins.Searcher.Extent");

dojo.declare("cartoweb.widgets.SearchExtent", [cartoweb.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets", "SearchExtent.html"),
    searchUrl: null,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        var mediator = new CartoWeb.SearchMediator(this.searchUrl, cb);
        this.query = new CartoWeb.Searcher.Extent(this.map, mediator);
    },

    onGotFeatures: function(features) {},

    toggle: function() {
        if (this.query.enabled) {
            this.query.disable();
        } else {
            this.query.enable();
        }
    }
});
