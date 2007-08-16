dojo.provide("cartoweb.plugins.Util");

dojo.require("cartoweb.plugins.CartoWeb");

CartoWeb.Util = {};

CartoWeb.Util.sum = function(array) {
    for (var i=0, sum=0; i < array.length; sum += array[i++]);
    return sum;
}

CartoWeb.Util.max = function(array) {
    return Math.max.apply({}, array);
}

CartoWeb.Util.min = function(array) {
    return Math.min.apply({}, array);
}
