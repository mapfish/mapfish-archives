dojo.provide("cartoweb.widgets.Routing");

dojo.require("cartoweb.MapControl");
dojo.require("dijit._Templated");

dojo.require("cartoweb.plugins.Routing");

dojo.declare("cartoweb.widgets.Routing", [cartoweb.MapControl, dijit._Templated], {
    remoteUrl: "",

    templatePath: dojo.moduleUrl("cartoweb.widgets", "routing/Routing.html"),

    mapCreated: function() {
        this.routing = new CartoWeb.Routing(this.remoteUrl, 
                                            {map: this.map, 
                                             params: {hello: 'world', foo: 'bar'}});
    },

    getRoute: function(e) {
        this.routing.call(dojo.formToObject(this.domNode));
    }
});
