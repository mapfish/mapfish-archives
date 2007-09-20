dojo.provide("cartoweb.plugins.Searcher.XY");

dojo.require("cartoweb.plugins.Searcher");

CartoWeb.Searcher.XY = OpenLayers.Class.create();
CartoWeb.Searcher.XY.prototype =
    OpenLayers.Class.inherit(CartoWeb.Searcher, {

    map: null,
    evt: null,

    initialize: function(map, mediator, url, callback) {
        CartoWeb.Searcher.prototype.initialize.apply(this, [mediator, url, callback]);
        this.map = map;
    },

    enable: function() {
        if (CartoWeb.Searcher.prototype.enable.call(this)) {
            this.map.events.register("click", this, this._onMapClick);
        }
    },

    disable: function() {
        if (CartoWeb.Searcher.prototype.disable.call(this)) {
            this.map.events.unregister("click", this, this._onMapClick);
        }
    },

    _onMapClick: function(evt) {
        this.cancelSearch();
        this.doSearch(this.getSearchParams(evt));
        this.evt = evt;
        OpenLayers.Event.stop(evt);
    },

    onGotFeatures: function(features) {
        if (features && features.length > 0) {
            var lonlat = this.map.getLonLatFromViewPortPx(this.evt.xy);
            var popup = new OpenLayers.Popup.AnchoredBubble("__tooltip__", lonlat,
                new OpenLayers.Size(200, 150), null, null, true);
            // build HTML table
            var html = "<div style=\"overflow:auto;width:190px;height:140px\"><table>";
            html += "<tr>";
            for (var k in features[0].attributes) {
                 html += "<th>" + k + "</th>";
            }
            html += "</tr>";
            for (var i = 0; i < features.length; i++) {
                attributes= features[i].attributes;
                html += "<tr>";
                for (var k in attributes) {
                    html += "<td>" +  attributes[k] + "</td>";
                }
                html += "</tr>";
            }
            html += "</table></div>";
            popup.setOpacity(0.8);
            popup.setContentHTML(html);
            this.map.addPopup(popup, true);
        }
        // HACK: reregister onGotFeatures in the mediator. Without this
        // onGotFeatures is called with the same features ever.
        this.mediator.callback = this.onGotFeatures.bind(this);
    },

    getSearchParams: function(evt) {
        var lonlat = this.map.getLonLatFromViewPortPx(evt.xy);
        var bbox = this.map.getExtent().toBBOX();
        var size = this.map.getCurrentSize();
        var params = {'coords': lonlat.lon + ',' + lonlat.lat, 'bbox': bbox, 'width': size.w};
        return OpenLayers.Util.extend(this.params, params);
    }
});
