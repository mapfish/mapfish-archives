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


dojo.provide("cartoweb.cartoweb");

dojo.require("cartoweb.MapControl");
dojo.require("cartoweb.widgets.Map");
dojo.require("cartoweb.widgets.tree.TreeContainer");

// The following two don't seem to be required as the others
// below depend on them. Keeping them should not hurt.
dojo.require("cartoweb.plugins.CartoWeb");
dojo.require("cartoweb.plugins.ServerCaller");

// routing
dojo.require("cartoweb.plugins.Routing");

// search
dojo.require("cartoweb.plugins.Searcher.XY");
dojo.require("cartoweb.plugins.Searcher.Extent");
dojo.require("cartoweb.plugins.Searcher.Form");

// geostat
dojo.require("cartoweb.plugins.GeoStat.Choropleth");
