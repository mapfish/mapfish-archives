/*
 * Copyright (C) 2007-2008  Camptocamp
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
 * toolbar.addControl(new OpenLayers.Control.ZoomBox({title: 'Zoom in'}), 
 *                    {iconCls: 'zoomin', 
 *                     toggleGroup: 'navigation'});
 * toolbar.addControl(new OpenLayers.Control.DragPan({title: 'Drag or pan', default: true}), 
 *                    {iconCls: 'pan', 
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
     * Property: _buttons 
     * Array({<Ext.Toolbar.Button>}) 
     * "buttons" is not available (already used in Ext.Toolbar)
     */ 
    _buttons: null,

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
        this._buttons = [];
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
     * options - the config object for the newly created Ext.Toolbar.Button
     *
     * Returns:
     * {<Ext.Toolbar.Button>} The added button instance
     */
    addControl: function (control, options) {
        control.visible = true;
        this.controls.push(control);
        this.map.addControl(control);
        var button = new Ext.Toolbar.Button(options);
        if (!button.tooltip) {
            button.tooltip = control.title;
        }
        button.enableToggle = (control.type == OpenLayers.Control.TYPE_TOGGLE);
        if (control.isDefault) {
            button.pressed = true;
            this.defaultControl = control;
        }
        button.scope = this;
        button.handler = function() { 
            this.activateControl(control); 
        };
        this.add(button);
        this._buttons.push(button);
        return button;
    },

    /**
     * Method: getControlByClassName
     * Pass in the CLASS_NAME of a control as a string and return the control itself
     *
     * Parameters: 
     * className - string
     *
     * Returns:
     * {<OpenLayers.Control>} The requested control.
     */
    getControlByClassName: function(className) {
        if (this.controls) {
            for (var i = 0;  i < this.controls.length; i++) {
                if (this.controls[i].CLASS_NAME == className) {
                    return this.controls[i];
                }
            }
        }
        return null;
    },

    /**
     * Method: getButtonForControl
     * Pass in a control and return the button attached to this control
     *
     * Parameters:
     * control - {<OpenLayers.Control>} A control which was previously added to the toolbar
     *
     * Returns:
     * {<Ext.Toolbar.Button>} The requested button.
     */
    getButtonForControl: function(control) { 
        if (this.controls) { 
            for (var i = 0;  i < this.controls.length; i++) { 
                if (this.controls[i] == control) { 
                    return this._buttons[i];
                } 
            } 
        } 
        return null;
    },

    /**
     * Method: activate
     * Activates the toolbar, either by restoring a given state (if configurable) or the default one.
     */
    activate: function() {
        if (this.configurable) {
            this.applyState(this.state);
            this.activateControl(this.defaultControl);
            var mb = new Ext.Toolbar.Button({'text': '+'});
            mb.menu = new Ext.menu.Menu();
            for(var i = 0; i < this.controls.length; i++) {
                mb.menu.add({
                    'style': 'height:25px',
                    'text': '<div style="position: relative; left: 25px; top: -15px;" class="' + this._buttons[i].iconCls + '"/>',
                    checked: this.controls[i].visible,
                    scope: {
                        toolbar: this, 
                        button: this._buttons[i], 
                        control: this.controls[i]
                    },
                    checkHandler: function(item, checked) {
                        if (checked) {
                            this.control.visible = true;
                            if (this.control == this.toolbar.defaultControl) {
                                this.toolbar.activateControl(this.control);
                            } 
                            this.button.show();
                        } else {
                            this.control.visible = false;
                            this.control.deactivate();
                            this.button.hide();
                        }
                        this.toolbar.saveState();
                    }
                });
            }
            this.add(mb);
        } else if (this.defaultControl) {
            this.activateControl(this.defaultControl);
        }
    },

    /**
     * Method: deactivate
     * Deactivates all controls in this toolbar.
     */
    deactivate: function() {
        for(var i = 0; i < this.controls.length; i++) {
            this.controls[i].deactivate();
            if (this.controls[i].type != OpenLayers.Control.TYPE_BUTTON) { 
                this._buttons[i].toggle(false); 
            }
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
                        this._buttons[i].hide();
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
     * Activates a control on the map
     * (Taken from OpenLayers.Panel)
     *
     * Parameters:
     * control - {<OpenLayers.Control>}
     */
    activateControl: function (control) {
        var button = this.getButtonForControl(control);
        if (!button) {
            OpenLayers.Console.warn("Toolbar.activateControl : button was not found");
            return;
        }
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            control.trigger();
            return;
        }
        if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
            if (control.active) {
                control.deactivate();
                button.toggle(false); 
            } else {
                control.activate();
                button.toggle(true); 
            }
            return;
        }
        for (var i = 0; i < this.controls.length; i++) {
            if (this.controls[i] == control && control.visible) {
                control.activate();
                button.toggle(true); 
            } else {
                if (this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) {
                    this.controls[i].deactivate();
                    this._buttons[i].toggle(false); 
                }
            }
        }
    }
});
Ext.reg('toolbar', mapfish.widgets.toolbar.Toolbar);
