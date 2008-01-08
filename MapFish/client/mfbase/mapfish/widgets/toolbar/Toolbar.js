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
 * @class mapfish.widgets.toolbar.Toolbar
 * @extends Ext.Toolbar
 * A toolbar will show a set of OpenLayers Controls and handle activating them
 * Simple example usage:
 * <pre><code>
 * var toolbar = new mapfish.widgets.toolbar.Toolbar({map: map});
 * toolbar.render('buttonbar');
 * toolbar.addControl(new OpenLayers.Control.ZoomBox(), 
 *                    {tooltip: 'Zoom in', 
 *                     iconCls: 'zoomin', 
 *                     toggleGroup: 'navigation'});
 * toolbar.addControl(new OpenLayers.Control.DragPan({default: true}), 
 *                    {tooltip: 'Pan map', 
 *                     iconCls: 'pan', 
 *                     toggleGroup: 'navigation'});
 * toolbar.activate();
 * </code></pre>
 * @constructor
 * Create a new Toolbar
 * @param {Object} map the OpenLayers map object
 * @param {Object} config The config object
 */

Ext.namespace('mapfish.widgets.toolbar');

mapfish.widgets.toolbar.Toolbar = function(config) {
    Ext.apply(this, config);
    mapfish.widgets.toolbar.Toolbar.superclass.constructor.call(this);
};

Ext.extend(mapfish.widgets.toolbar.Toolbar, Ext.Toolbar, {

    /**
     * Property: controls
     * Array({<OpenLayers.Control>})
     */
    controls: null,

    /**
     * Property: state
     * Object
     */
    state: null,

    /**
     * Property: configurable
     * Boolean
     */
    configurable: false,

    /**
     * APIProperty: defaultControl
     * <OpenLayers.Control> The control which is activated when the control is
     * activated (turned on), which also happens at instantiation.
     */
    defaultControl: null,

    // private
    initComponent: function() {
        mapfish.widgets.toolbar.Toolbar.superclass.initComponent.call(this);
        this.controls = [];
        this.autoWidth = true;
        this.autoHeight = true;
        Ext.QuickTips.init();
    },

    /**
     * Method: addControl
     * Add a control to the toolbar, the control will be represented by a button
     *
     * Parameters:
     * control - {<OpenLayers.Control>}
     * options - the config object
     *
     * Returns:
     * An instance of Ext.Toolbar.Button
     */
    addControl: function (control, options) {
        control.visible = true;
        this.controls.push(control);
        this.map.addControl(control);
        var mb = new Ext.Toolbar.Button(options);
        if (this.buttonTips && this.buttonTips[control.CLASS_NAME]) {
            mb.tooltip = this.buttonTips[control.CLASS_NAME];
        }
        mb.enableToggle = true;
        if (control.isDefault) {
            mb.pressed = true;
            this.defaultControl = control;
        }
        mb.scope = this;
        mb.handler = function() { this.activateControl(control); }
        this.add(mb);
        return mb;
    },

    /**
     * Method: getControlByClassName
     * Pass in the CLASS_NAME of a control as a string and return the control itself
     *
     * Paramaters:
     * className - string
     */
    getControlByClassName: function(className) {
        if (this.controls) {
            for (var i = 0;  i < this.controls.length; i++) {
                if (this.controls[i].CLASS_NAME == className) {
                    return this.controls[i];
                }
            }
        }
    },

    /**
     * Method: activate
     */
    activate: function() {
        if (this.configurable) {
            this.applyState(this.state);
            this.activateControl(this.defaultControl);
            var mb = new Ext.Toolbar.Button({'text': '+'});
            mb.menu = new Ext.menu.Menu();
            for(var i = 0; i < this.controls.length; i++) {
                mb.menu.add({'style': 'height:25px',
                            'text': '<div style="position: relative; left: 25px; top: -15px;" class="' + this.items.items[i].iconCls + '"/>',
                            checked: this.controls[i].visible,
                            scope: {toolbar: this, button: this.items.items[i], control: this.controls[i]},
                            checkHandler: function(item, checked) {
                                if (checked) {
                                    this.control.visible = true;
                                    if (this.control == this.toolbar.defaultControl) {
                                        this.toolbar.activateControl(this.control);
                                    } this.button.show();
                                } else {
                                    this.control.visible = false;
                                    this.control.deactivate();
                                    this.button.hide();
                                }
                                this.toolbar.saveState();
                        }});
            }
            this.add(mb);
        } else {
            this.activateControl(this.defaultControl);
        }
    },

    /**
     * Method: deactivate
     */
    deactivate: function() {
        for(var i = 0; i < this.controls.length; i++) {
            this.controls[i].deactivate();
        }
    },

    /**
     * Method: applyState
     * Apply the state to the toolbar upon loading
     *
     * Parameters:
     * state - {<Object>}
    */
    applyState: function(state){
        if (!state) {
            return false;
        }
        this.state = state;
        var cs = state.controls;
        if (cs) {
            for(var i = 0, len = cs.length; i < len; i++) {
                var s = cs[i];
                var c = this.getControlByClassName(s.id);
                if (c) {
                    c.visible = s.visible;
                    if (!c.visible) {
                        this.items.items[i].hide();
                    }
                }
            }
        }
    },

    /**
     * Method: getState
     * Function that builds op the state of the toolbar and returns it
    */
    getState: function() {
        var o = {controls: []};
        for (var i = 0, c; i < this.controls.length; i++) {
            c = this.controls[i];
            o.controls[i] = {
                id: c.CLASS_NAME,
                visible: c.visible
            };
        }
        return o;
    },

    /**
     * Method: activateControl
     * Activate a control on the map
     * (Taken from OpenLayers.Panel)
     *
     * Parameters:
     * control - {<OpenLayers.Control>}
     */
    activateControl: function (control) {
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            control.trigger();
            return;
        }
        if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
            if (control.active) {
                control.deactivate();
            } else {
                control.activate();
            }
            return;
        }
        for (var i = 0; i < this.controls.length; i++) {
            if (this.controls[i] == control && control.visible) {
                control.activate();
            } else {
                if (this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) {
                    this.controls[i].deactivate();
                }
            }
        }
    }
});
Ext.reg('toolbar', mapfish.widgets.toolbar.Toolbar);
