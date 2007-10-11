dojo.provide("cartoweb.widgets.SearchXY");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");
dojo.require("cartoweb.plugins.Searcher.XY");

dojo.declare("cartoweb.widgets.SearchXY", [cartoweb.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets", "SearchXY.html"),
    searchUrl: null,
    radius: 100,        /* 100 meters by default */
    maxFeatures: 100,   /* 100 features maximum by default */
    onGotFeatures: null,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        this.query = new CartoWeb.Searcher.XY(this.map, this.radius, null, this.searchUrl, cb, this.maxFeatures);
    },

    toggle: function() {
        if (this.query.enabled) {
            this.query.disable();
        } else {
            this.query.enable();
        }
    }
});
