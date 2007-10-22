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


dojo.provide("mapfish.mapfish");

dojo.require("mapfish.MapControl");
dojo.require("mapfish.widgets.Map");
dojo.require("mapfish.widgets.tree.TreeContainer");

// The following two don't seem to be required as the others
// below depend on them. Keeping them should not hurt.
dojo.require("mapfish.plugins.MapFish");
dojo.require("mapfish.plugins.ServerCaller");

// routing
dojo.require("mapfish.plugins.Routing");

// search
dojo.require("mapfish.plugins.Searcher.XY");
dojo.require("mapfish.plugins.Searcher.Extent");
dojo.require("mapfish.plugins.Searcher.Form");

// geostat
dojo.require("mapfish.plugins.GeoStat.Choropleth");
