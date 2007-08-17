dojo.provide("cartoweb.widgets.GeoStat.Choropleth");

dojo.require("cartoweb.widgets.GeoStat");
dojo.require("cartoweb.plugins.GeoStat.Choropleth");
dojo.require("dijit._Templated");

dojo.declare("cartoweb.widgets.GeoStat.Choropleth", [cartoweb.widgets.GeoStat, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets.GeoStat", "Choropleth.html"),

    mapCreated: function() {
        // fill the template with variables
        this.fillTemplate();

        // add coloPicker
        [this.colorA, this.colorB].each(function(idx) {
            idx.setStyle('background-color', new Color(idx.value).hex);

            var r = new MooRainbow(idx, {
                id: 'mooRainbow' + idx.name,
        		startColor: new Color(idx.value),
                imgPath: '../../cwbase/mootools/images/',
                onChange: function(color) {
                    this.element.value = color.hex;
                    this.element.setStyle('background-color', color.hex);
                }
        	});
        });

        this.layer = new OpenLayers.Layer.Vector("Choropleth");
        this.layer.setVisibility(false, true);
        this.map.addLayer(this.layer);

        OpenLayers.loadURL(this.geoStatUrl, "", this, this.parseData);
    },

    /**
     * Method: classify
     *    Reads the features to get the different value for
     *    the field given for attributeName
     *    Creates a new Distribution and related Classification
     *    Then creates an new Choropleths and applies classification
     */
    classify: function() {
        var indicatorAttribute = this.attributeName.value;
        var values = [];
        var features = this.layer.features;
        for (var i = 0; i < features.length; i++) {
            values.push(features[i].attributes[indicatorAttribute]);
        }
        var dist = new CartoWeb.GeoStat.Distribution(values);
        var classification = dist.classify(
            CartoWeb.GeoStat.Distribution[this.method.value],
            this.numClasses.value,
            null
        );
        var stat = new CartoWeb.GeoStat.Choropleth(this.layer, {
            classification: classification,
            idAttribute: this.idAttribute,
            indicatorAttribute: indicatorAttribute,
            legendDiv: this.legend
        });

        stat.colors = stat.createColorInterpolation(this.colorA.value,
                                                    this.colorB.value);

        stat.updateFeatures();

        var select = new OpenLayers.Control.SelectFeature(this.layer, {
            hover: true,
            callbacks: {
               over: stat.showDetails.bind(stat),
               out: stat.hideDetails.bind(stat)
            }
        });
        this.map.addControl(select);

        select.activate();
        this.layer.setVisibility(true, true);
    }
});
