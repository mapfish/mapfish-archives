dojo.provide("cartoweb.plugins.Searcher.Form");

dojo.require("cartoweb.plugins.Searcher");

CartoWeb.Searcher.Form = OpenLayers.Class.create();
CartoWeb.Searcher.Form.prototype =
    OpenLayers.Class.inherit(CartoWeb.Searcher, {

    form: null,
    
    initialize: function(form, mediator, url, callback, maxFeatures) {
        CartoWeb.Searcher.prototype.initialize.apply(this, [mediator, url, callback, maxFeatures]);
        this.form = form;
    },
    
    enable: function() {
        CartoWeb.Searcher.prototype.enable.call(this);
    },
    
    disable: function() {
        CartoWeb.Searcher.prototype.disable.call(this);
    },

    triggerSearch: function() {
        this.doSearch(this.getSearchParams());
    },

    getSearchParams: function() {
        var params = {};
        var form = this.form;
        /* process <input> elements */
        var inputElements = form.getElementsByTagName('input');
        for (var i = 0; i < inputElements.length; i++) {
            // Collect the current input only if it's is not 'submit', 'image' or 'button'
            currentElement = inputElements.item(i);
            if (currentElement.disabled == true) {
                continue;
            }
            inputType = currentElement.getAttribute('type');
            if (inputType == 'radio' || inputType == 'checkbox') {
                if (currentElement.checked) {
                    params = OpenLayers.Util.extend(params, this.getParamsFromInput(currentElement));
                }
            } else if (inputType == 'submit' || inputType == 'button' || inputType == 'image') {
                // Do nothing. Sending the submit inputs in POST Request would make
                // the serverside act like all buttons on the form were clicked.
                // And we don't want that.
            } else {
                params = OpenLayers.Util.extend(params, this.getParamsFromInput(currentElement));
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
     * General method that builds a request string from an HTMLFormElement and
     * returns a formatted string: 'elemeentName=elemeentValue' or 'elemeentName='
     * @param HTMLFormElement
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
