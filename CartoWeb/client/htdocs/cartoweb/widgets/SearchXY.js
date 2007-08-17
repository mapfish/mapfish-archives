dojo.provide("cartoweb.widgets.SearchXY");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");
dojo.require("cartoweb.plugins.Searcher.XY");

dojo.declare("cartoweb.widgets.SearchXY", [cartoweb.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets", "SearchXY.html"),
    searchUrl: null,
    onGotFeatures: null,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        this.query = new CartoWeb.Searcher.XY(this.map, null, this.searchUrl, cb);
    },

    toggle: function() {
        if (this.query.enabled) {
            this.query.disable();
        } else {
            this.query.enable();
        }
    }
});
