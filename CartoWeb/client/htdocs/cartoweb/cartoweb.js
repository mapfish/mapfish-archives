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
