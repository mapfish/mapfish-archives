/*
 * Copyright (C) 2007  Camptocamp
 *
 * This file is part of MapFish
 *
 * MapFish is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MapFish is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with MapFish.  If not, see <http://www.gnu.org/licenses/>.
 */


dojo.provide("mapfish_legacy.widgets.SearchCoupled");

dojo.require("mapfish_legacy.MapControl");
dojo.require("dijit._Templated");
dojo.require("mapfish_legacy.plugins.Searcher.Form");
dojo.require("mapfish_legacy.plugins.Searcher.Extent");

dojo.declare("mapfish_legacy.widgets.SearchCoupled", [mapfish_legacy.MapControl, dijit._Templated], {

    templatePath: dojo.moduleUrl("mapfish_legacy.widgets", "SearchCoupled.html"),

    form: "",
    searcherExtent: null,
    searcherForm: null,
    searchUrl: null,
    maxFeatures: 100,
    onGotFeatures: null,
    enabled: false,

    mapCreated: function() {
        var cb = this.onGotFeatures ? this.onGotFeatures : null;
        var mediator = new MapFish.SearchMediator(this.searchUrl, cb, this.maxFeatures);
        this.searcherExtent = new MapFish.Searcher.Extent(this.map, mediator);
        var form = document.getElementById(this.form);
        this.searcherForm = new MapFish.Searcher.Form(form, mediator);
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
