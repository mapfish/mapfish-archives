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
 * @requires core/Searcher.js
 * @requires OpenLayers/Util.js
 */

mapfish.Searcher.Form = OpenLayers.Class(mapfish.Searcher, {

    /**
     * Property: map
     * {DOMElement} - The form node.
     */
    form: null,

    /**
     * Constructor: mapfish.Searcher.Extent
     *
     * Parameters:
     * form - {DOMElement}
     * mediator - {<mapfish.SearchMediator>}
     * options - {Object}
     * mediatorOptions - {Object}
     */
    initialize: function(form, mediator, options, mediatorOptions) {
        mapfish.Searcher.prototype.initialize.apply(
            this,
            [mediator, options, mediatorOptions]
        );
        this.form = form;
    },

    /**
     * APIMethod: triggerSearch
     *      Trigger search.
     */
    triggerSearch: function() {
        this.doSearch(this.getSearchParams());
    },

    /**
     * Method: getSearchParams
     *      Search the form to get the search params.
     *
     * Returns:
     * {Object} The params object
     */
    getSearchParams: function() {
        var params = {};
        var form = this.form;
        /* process <input> elements */
        var inputElements = form.getElementsByTagName('input');
        for (var i = 0; i < inputElements.length; i++) {
            // Collect the current input only if it's is not 'submit', 'image'
            // or 'button'
            currentElement = inputElements.item(i);
            if (currentElement.disabled == true) {
                continue;
            }
            inputType = currentElement.getAttribute('type');
            if (inputType == 'radio' || inputType == 'checkbox') {
                if (currentElement.checked) {
                    params = OpenLayers.Util.extend(
                        params, this.getParamsFromInput(currentElement));
                }
            } else if (inputType == 'submit' ||
                       inputType == 'button' ||
                       inputType == 'image') {
                // Do nothing. Sending the submit inputs in POST Request would
                // make the serverside act like all buttons on the form were
                // clicked.  And we don't want that.
            } else {
                params = OpenLayers.Util.extend(
                    params, this.getParamsFromInput(currentElement));
            }
        }
        /* process <select> elements */
        var selectElements = form.getElementsByTagName('select');
        for (var i = 0; i < selectElements.length; i++) {
            // Get the param name (i.e. fetch the name attr)
            var currentElement = selectElements.item(i);
            var paramName = currentElement.getAttribute('name');
            // Get the param value(s)
            // (i.e. fetch the checked options element's value attr)
            var optionElements = currentElement.getElementsByTagName('option');
            for (var j = 0; j < optionElements.length; j++) {
                currentElement = optionElements.item(j);
                if (currentElement.selected) {
                    paramValue = currentElement.getAttribute('value');
                    if (paramValue == null) {
                        paramValue = '';
                    }
                    var param = {};
                    param[paramName] = paramValue;
                    params = OpenLayers.Util.extend(params, param);
                }
            }
        }
        return OpenLayers.Util.extend(this.params, params);
    },

    /**
     * Method: getParamsFromInput
     *      Build a request string from an input element.
     *
     * Parameters:
     * htmlElement - {DOMElement}
     *
     * Returns:
     * {String} Request string (elementName=elementValue)
     */
    getParamsFromInput: function(htmlElement) {
        var inputType = htmlElement.getAttribute('type');
        var paramName = htmlElement.getAttribute('name');
        if (inputType == 'text') {
            paramValue = htmlElement.value;
        } else {
            paramValue = htmlElement.getAttribute('value');
        }
        var ret = new Object();
        if (paramValue != null) {
             ret[paramName] = paramValue;
        } else {
            // HTTP POST requests parameters HAVE TO be followed by '='
            // even when they have no associated value
            ret[paramName] = null;
        }
        return ret;
    }
});
