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

(function() {
    /**
     * Before creating the mapfish namespace, check to see if
     * mapfish.singleFile is true. This occurs if the
     * SingleFile.js script is included before this one - as is the
     * case with single file builds.
     */
    var singleFile = (typeof mapfish == "object" && mapfish.singleFile);

    /**
     * Namespace: mapfish
     * The mapfish object provides a namespace for all things 
     */
    window.mapfish = {
    };
})();
