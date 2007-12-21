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

/*
 * This code is taken from the OpenLayers code base.
 *
 * Copyright (c) 2006-2007 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license.
 */

(function() {
    /**
     * Before creating the mapfish namespace, check to see if
     * mapfish.singleFile is true. This occurs if the
     * SingleFile.js script is included before this one - as is the
     * case with single file builds.
     */
    var singleFile = (typeof window.mapfish == "object" && window.mapfish.singleFile);

    /**
     * Namespace: mapfish
     * The mapfish object provides a namespace for all things 
     */
    window.mapfish = {

        /**
         * Property: _scriptName
         * {String} Relative path of this script.
         */
        _scriptName: (!singleFile) ? "mapfish/MapFish.js" : "MapFish.js",

        /**
         * Function: _getScriptLocation
         * Return the path to this script.
         *
         * Returns:
         * Path to this script
         */
        _getScriptLocation: function () {
            // Workaround for Firefox bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=351282
            if (window.gMfLocation) {
                return window.gMfLocation;
            }

            var scriptLocation = "";
            var scriptName = mapfish._scriptName;
         
            var scripts = document.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var src = scripts[i].getAttribute('src');
                if (src) {
                    var index = src.lastIndexOf(scriptName); 
                    // is it found, at the end of the URL?
                    if ((index > -1) && (index + scriptName.length == src.length)) {  
                        scriptLocation = src.slice(0, -scriptName.length);
                        break;
                    }
                }
            }
            return scriptLocation;
         }
    };

    /**
     * mapfish.singleFile is a flag indicating this file is being included
     * in a Single File Library build of the MapFish Library.
     * 
     * When we are *not* part of a SFL build we dynamically include the
     * MapFish library code.
     * 
     * When we *are* part of a SFL build we do not dynamically include the 
     * MapFish library code as it will be appended at the end of this file.
      */
    if(!singleFile) {
        var jsfiles = new Array(
            "core/Color.js",
            "core/GeoStat.js",
            "core/Util.js",
            "core/SearchMediator.js",
            "core/Searcher.js",
            "core/Searcher/XY.js",
            "core/Searcher/Extent.js",
            "core/Searcher/Form.js",
            "widgets/MapComponent.js",
            "widgets/Shortcuts.js",
            "widgets/geostat/Choropleth.js",
            "widgets/geostat/ProportionalSymbol.js",
            "widgets/tree/LayerTree.js",
            "widgets/search/Point.js",
            "widgets/toolbar/Toolbar.js",
            "widgets/toolbar/CheckItem.js",
            "widgets/toolbar/MenuItem.js",
            "widgets/edition/FeatureList.js"
        ); // etc.

        var allScriptTags = "";
        var host = mapfish._getScriptLocation() + "mapfish/";
    
        for (var i = 0; i < jsfiles.length; i++) {
            if (/MSIE/.test(navigator.userAgent) || /Safari/.test(navigator.userAgent)) {
                var currentScriptTag = "<script src='" + host + jsfiles[i] + "'></script>"; 
                allScriptTags += currentScriptTag;
            } else {
                var s = document.createElement("script");
                s.src = host + jsfiles[i];
                var h = document.getElementsByTagName("head").length ? 
                           document.getElementsByTagName("head")[0] : 
                           document.body;
                h.appendChild(s);
            }
        }
        if (allScriptTags) {
            document.write(allScriptTags);
        }
    }
})();
