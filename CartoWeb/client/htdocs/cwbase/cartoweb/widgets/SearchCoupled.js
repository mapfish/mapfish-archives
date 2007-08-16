dojo.provide("cartoweb.widgets.SearchCoupled");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");
dojo.require("cartoweb.plugins.Searcher.Form");
dojo.require("cartoweb.plugins.Searcher.Extent");

dojo.declare("cartoweb.widgets.SearchCoupled", [cartoweb.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets", "SearchCoupled.html"),

    form: "",
    searcherExtent: null,
    searcherForm: null,
    searchUrl: null,
    onGotFeatures: null,
    enabled: false,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        var mediator = new CartoWeb.SearchMediator(this.searchUrl, cb);
        this.searcherExtent = new CartoWeb.Searcher.Extent(this.map, mediator);
        var form = document.getElementById(this.form);
        this.searcherForm = new CartoWeb.Searcher.Form(form, mediator);
    },
    
    triggerSearch: function(evt) {
        if (this.searcherForm && this.enabled) {
            this.searcherForm.triggerSearch();
        }
        if (evt) {
            dojo.stopEvent(evt);
        }
    },

    toggle: function() {
        if (this.enabled) {
            this.searcherExtent.disable();
            this.searcherForm.disable();
            this.enabled = false;
        } else {
            this.searcherExtent.enable();
            this.searcherForm.enable();
            this.enabled = true;
        }
    }
});
