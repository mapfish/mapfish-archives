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
