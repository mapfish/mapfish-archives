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


dojo.provide("search.C2corgSearchCoupled");

dojo.require("mapfish_legacy.widgets.SearchCoupled");

dojo.declare("search.C2corgSearchCoupled", [mapfish_legacy.widgets.SearchCoupled], {

    templatePath: dojo.moduleUrl("search", "C2corgSearchCoupled.html"),

    c2corgSearchCoupledCriteria: null,

    c2corgSearchCoupledForm: null,

    mapCreated: function() {
        this.form = this.c2corgSearchCoupledForm.id;
        mapfish_legacy.widgets.SearchCoupled.prototype.mapCreated.apply(this);
    },

    toggle: function() {
        mapfish_legacy.widgets.SearchCoupled.prototype.toggle.apply(this);
        this.c2corgSearchCoupledCriteria.style.display = this.enabled ?
            "block" : "none";
    }
});
