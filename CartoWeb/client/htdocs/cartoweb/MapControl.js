dojo.provide("cartoweb.MapControl");

dojo.require("dijit._Widget");

dojo.declare("cartoweb.MapControl", [dijit._Widget], {
    // The Map widget id.
    // Can be left blank if there is only one map in the page.
    mapId: "",

    postCreate: function() {
        // Listen to the 'map.created' event. 
        // This event is triggered by the 'mainmap' widget
        dojo.subscribe("map.created", this, this._mapCreated);
    },

    _mapCreated: function(o) {
        // assign the OpenLayers.Map object.
        if (!this.mapId || (this.mapId == o.mapId)) {
            this.map = o.map;
            this.mapCreated();
        }
    },

    // called when the mainmap is ready
    // implemented by sub-classes
    mapCreated: function() {}
});
