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

/**
 * @class mapfish.widgets.Shortcuts
 * @extends Ext.Container
 * Simple shorcut to get the map zoomed to a preconfigured location<br />
 * Here's an example of typical usage:
 * <pre><code>
var shortcuts = new mapfish.widgets.Shortcuts({
    el: 'myDiv',
    map: map,
    store: store,
    templates: {
        header: new Ext.Template("Choose a continent in the list"),
        footer: new Ext.Template("The map will automatically center to this location")
    }
});
</code></pre>
 * @constructor
 * Create a new Shortcuts
 * @param {Object} map the OpenLayers map object
 * @param {Object} config The config object
 */

/**
 * @requires OpenLayers/Map.js
 */

Ext.namespace('mapfish.widgets');

mapfish.widgets.Shortcuts = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.Shortcuts.superclass.constructor.call(this);
}

Ext.extend(mapfish.widgets.Shortcuts, Ext.Container, {

    initComponent: function() {
        var combo = new Ext.form.ComboBox({
                name: 'shortcuts',
                hiddenName: '',
                store: this.store,
                valueField: 'value',
                displayField:'text',
                editable: false,
                mode: 'local',
                triggerAction: 'all',
                emptyText:'Select a value ...',
                lazyRender: true,
                width: 150
            })
        combo.on('select', this.recenter, this);

        this.items = combo;
        
        mapfish.widgets.Shortcuts.superclass.initComponent.call(this);
    },

    // private
    onRender: function(container, position) {
        if (!this.el) {
            this.el = document.createElement('div');
        }
        
        mapfish.widgets.Shortcuts.superclass.onRender.apply(this, arguments);
        
        this.initTemplates();
        this.applyTemplates();
    },

    // private
    initTemplates: function() {
        var ts = this.templates || {};
        
        if (!ts.header) {
            ts.header = new Ext.Template('some text before');
        }
        
        if (!ts.footer) {
            ts.footer = new Ext.Template('some text after');
        }

        this.templates = ts;
    },
    
    // private
    applyTemplates: function() {
        for (var i in this.templates) {
            var template = this.templates[i];
            
            var el = document.createElement("div");
            template.overwrite(el);

            switch (i) {
                case 'header':
                    template.insertBefore(this.el);
                    break;
                case 'footer':
                    template.insertAfter(this.el);
                    break;
            }
        }
    },
    
    // private
    recenter: function(combo, record) {
        this.map.zoomToExtent(record.get('bbox'));
    }
});
Ext.reg('shortcuts', mapfish.widgets.Shortcuts);
