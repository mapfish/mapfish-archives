dojo.provide("search.C2corgSearchCoupled");

dojo.require("cartoweb.widgets.SearchCoupled");

dojo.declare("search.C2corgSearchCoupled", [cartoweb.widgets.SearchCoupled], {

    templatePath: dojo.moduleUrl("search", "C2corgSearchCoupled.html"),

    c2corgSearchCoupledCriteria: null,

    c2corgSearchCoupledForm: null,

    mapCreated: function() {
        this.form = this.c2corgSearchCoupledForm.id;
        cartoweb.widgets.SearchCoupled.prototype.mapCreated.apply(this);
    },

    toggle: function() {
        cartoweb.widgets.SearchCoupled.prototype.toggle.apply(this);
        this.c2corgSearchCoupledCriteria.style.display = this.enabled ?
            "block" : "none";
    }
});
