/*
 * Copyright (C) 2007  Camptocamp
 *
 * This file is part of CartoWeb
 *
 * CartoWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CartoWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with CartoWeb.  If not, see <http://www.gnu.org/licenses/>.
 */


dojo.provide("cartoweb.widgets.GeoStat.Choropleth");

dojo.require("cartoweb.widgets.GeoStat");
dojo.require("cartoweb.plugins.GeoStat.Choropleth");
dojo.require("cartoweb.plugins.Color");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.ColorPalette");

dojo.declare("cartoweb.widgets.GeoStat.Choropleth", [cartoweb.widgets.GeoStat, dijit._Templated], {

    templatePath: dojo.moduleUrl("cartoweb.widgets.GeoStat", "Choropleth.html"),

    widgetsInTemplate: true,

    mapCreated: function() {
        // fill the template with variables
        this.fillTemplate();

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

        var colorA = new CartoWeb.ColorRgb();
        colorA.setFromRgb(this.colorA.style.backgroundColor);
        var colorB = new CartoWeb.ColorRgb();
        colorB.setFromRgb(this.colorB.style.backgroundColor);

        stat.colors = stat.createColorInterpolation(colorA,
                                                    colorB);

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
