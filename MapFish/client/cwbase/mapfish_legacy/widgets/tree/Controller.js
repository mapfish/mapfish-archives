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


dojo.provide("mapfish_legacy.widgets.tree.Controller");

dojo.require("dijit._Widget");
dojo.require("mapfish_legacy.widgets.tree.Tree");

mapfish_legacy.widgets.tree.TreeUtils = {

    visit: function(item, callback, childrenGetter) {
    
        if (!childrenGetter)
            childrenGetter = function (item) { return item.children; };
    
        callback(item);
        var children = childrenGetter(item);
        if (!children)
            return;
        for (var i = 0; i < children.length; i++) {
            arguments.callee(children[i], callback, childrenGetter);
        }
    },
    
    descendantsAndSelf: function(item) {
        var items = [];
        mapfish_legacy.widgets.tree.TreeUtils.visit(item, function(item) {
            items.push(item);
        });        
        return items;
    }
};

dojo.declare(
	"mapfish_legacy.widgets.tree.Controller",
	[dijit._Widget],
{
	// Summary: _tree.Controller performs all basic operations on Tree
	// Description:
	//	Controller is the component to operate on model.
	//	Tree/_tree.Node know how to modify themselves and show to user,
	//  but operating on the tree often involves higher-level extensible logic,
	//  like: database synchronization, node loading, reacting on clicks etc.
	//  That's why it is handled by separate controller.
	//  Controller processes expand/collapse and should be used if you 
	//  modify a tree.

	// treeId: String
	//		id of Tree widget that I'm controlling
	treeId: "",

	postMixInProperties: function(){
		// setup to handle events from tree
		dojo.subscribe(this.treeId, this, "_listener");	
	},

	_listener: function(/*Object*/ message){
		// summary: dispatcher to handle events from tree
		var event = message.event;
		var eventHandler =  "on" + event.charAt(0).toUpperCase() + event.substr(1);
		if(this[eventHandler]){
			this[eventHandler](message);
		}
	},

	onBeforeTreeDestroy: function(message) {
		dojo.unsubscribe(message.tree.id);
	},

	onExecute: function(/*Object*/ message) {
		// summary: an execute event has occured
		
		// does the user override this handler?
		console.log("execute message for " + message.node);
	},
	
    updateAncestorsDescendants: function(item, checked) {

        var TU = mapfish_legacy.widgets.tree.TreeUtils;

        TU.visit(item, function(item) {
            item.checked = checked;
        });
                
        function updateParentChecked(item) {
        
            var parent = item.parent;
            if (!parent)
                return;
            var siblings = item.parent.children;
            var allSiblingsChecked = dojo.every(siblings, function(item) {
                return item.checked;
            });
            parent.checked = allSiblingsChecked;
            arguments.callee(parent);
        }
        
        updateParentChecked(item);
    },

   syncModelToDom: function(tree) {

        mapfish_legacy.widgets.tree.TreeUtils.visit(tree, function(treeNode) {
            if (treeNode.item) {
                treeNode.checkboxNode.checked = treeNode.item.checked;
            }
            
        }, function (item) {
            return item.getChildren();
        });
    },

    onChecked: function(message) {
    
		var map = this.tree.map;
		
		console.log("checked (state): %o, %s %o", message, 
		    message.node.checkboxNode.value, message.node.checkboxNode.checked);
		
		var checked = message.node.checkboxNode.checked;

        this.updateAncestorsDescendants(message.node.item, checked);
		this.syncModelToDom(message.tree);
		this.tree._publish("modelChanged", {});
    },
  
	onNext: function(/*Object*/ message) {
		// summary: down arrow pressed; move to next visible node

		var returnWidget;

		// if this is an expanded folder, get the first child
		var nodeWidget = message.node;
		if (nodeWidget.isFolder && nodeWidget.isExpanded && nodeWidget.hasChildren()) {
			returnWidget = nodeWidget.getChildren()[0];			
		} else {
			// find a parent node with a sibling
			while (nodeWidget.isTreeNode) {
				returnWidget = nodeWidget.getNextSibling();
				if(returnWidget){
					break;
				}
				nodeWidget = nodeWidget.getParent();
			}	
		}
				
		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}	
	},
	
	onPrevious: function(/*Object*/ message) {
		// summary: up arrow pressed; move to previous visible node

		var nodeWidget = message.node;
		var returnWidget = nodeWidget;
		
		// if younger siblings		
		var previousSibling = nodeWidget.getPreviousSibling();
		if (previousSibling) {
			nodeWidget = previousSibling;
			// if the previous nodeWidget is expanded, dive in deep
			while (nodeWidget.isFolder && nodeWidget.isExpanded && nodeWidget.hasChildren()) {
				returnWidget = nodeWidget;
				// move to the last child
				var children = nodeWidget.getChildren();
				nodeWidget = children[children.length-1];
			}
		} else {
			// if this is the first child, return the parent
			nodeWidget = nodeWidget.getParent();
		}
		
		if (nodeWidget && nodeWidget.isTreeNode) {
			returnWidget = nodeWidget;
		}
		
		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},
	
	onZoomIn: function(/*Object*/ message) {
		// summary: right arrow pressed; go to child node
		var nodeWidget = message.node;
		var returnWidget = nodeWidget;
		
		// if not expanded, expand, else move to 1st child
		if (nodeWidget.isFolder && !nodeWidget.isExpanded) {
			this._expand(nodeWidget);
		}else if (nodeWidget.hasChildren()) {
			nodeWidget = nodeWidget.getChildren()[0];
		}
		
		if (nodeWidget && nodeWidget.isTreeNode) {
			returnWidget = nodeWidget;
		}
		
		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},
	
	onZoomOut: function(/*Object*/ message) {
		// summary: left arrow pressed; go to parent
		
		var node = message.node;
		var returnWidget = node;

		// if not collapsed, collapse, else move to parent
		if (node.isFolder && node.isExpanded) {
			this._collapse(node);
		} else {
			node = node.getParent();
		}
		if (node && node.isTreeNode) {
			returnWidget = node;
		}
		
		if (returnWidget && returnWidget.isTreeNode) {
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onFirst: function(/*Object*/ message) {
		// summary: home pressed; go to first visible node

		var returnWidget = message.node;

		// the first node is always the root; isn't it?
		while (!returnWidget.isTree){
			returnWidget = returnWidget.getParent();
		}
		
		if (returnWidget){
			returnWidget = returnWidget.getChildren()[0];
			if (returnWidget && returnWidget.isTreeNode){
				returnWidget.tree.focusNode(returnWidget);
				return returnWidget;
			}
		}
	},

	onLast: function(/*Object*/ message) {
		// summary: end pressed; go to last visible node

		var returnWidget = message.node;
		
		// find the tree root
		while (!returnWidget.isTree){
			returnWidget = returnWidget.getParent();
		}
		
		var lastChild = returnWidget;
		while(lastChild.isExpanded){
			var c = lastChild.getChildren();
			lastChild = c[c.length - 1];
			if (lastChild.isTreeNode){
				returnWidget = lastChild;
			}
		}

		if (returnWidget && returnWidget.isTreeNode){
			returnWidget.tree.focusNode(returnWidget);
			return returnWidget;
		}
	},

	onToggleOpen: function(/*Object*/ message){
		// summary: user clicked the +/- icon; expand or collapse my children.
		var node = message.node;
		if (node.isExpanded){
			this._collapse(node);
		} else {
			this._expand(node);
		}
	},
	
	_expand: function(node) {
		if (node.isFolder) {
			node.expand(); // skip trees or non-folders
		}
	},

	_collapse: function(node) {
		if (node.isFolder) {
			node.collapse();
		}
	}
});

dojo.declare(
	"mapfish_legacy.widgets.tree.DataController",
	mapfish_legacy.widgets.tree.Controller,
{

    _getChildren: function(parent) {
        if (!parent || !parent.children)
            return [];
        return dojo.map(parent.children, function(c) {
            var ret = {};
            dojo.mixin(ret, c);
            ret.isFolder = ret.children && ret.children.length > 0;
            ret.item = c;
            return ret;
        });
    },

	// summary
	//		Controller for tree that hooks up to dojo.data

	onAfterTreeCreate: function(message) {
	
		console.log("afterTreeCreate %i %o", this._cookie, message.tree);

		// when a tree is created, we query against the store to get the top level nodes
		// in the tree
		var tree = message.tree;
		this.model = tree.model;
		
		console.log("Showing model %o:", this.model);
        tree.setChildren(this._getChildren(this.model));

        // Setting up of the initial open state
        function applyExpandedState(node) {
            var children = node.getChildren();
            var toExpand = [];
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.item.expanded) {
                    toExpand.push(child);
                    this._expand(child);
                }
            }
            for (var i = 0; i < toExpand.length; i++) {
                arguments.callee.call(this, toExpand[i]);
            }
        }
        
        // TODO: freeze tree while setting open state
        applyExpandedState.call(this, tree);
	},

	_expand: function(/*_TreeNode*/ node){
	
		var store = this.store;
		var getValue = this.store.getValue;

		switch(node.state){
			case "LOADING":
				// ignore clicks while we are in the process of loading data
				return;

			case "UNCHECKED":
				this._onLoadAllItems(node, node.item);
				break;
						
			default:
				// data is already loaded; just proceed
				mapfish_legacy.widgets.tree.Controller.prototype._expand.apply(this, arguments);
				break;
		}
	},

	_onLoadAllItems: function(/*_TreeNode*/ node, /*dojo.data.Item[]*/ items){
		
		var children = this._getChildren(items);
		node.setChildren(children);

		mapfish_legacy.widgets.tree.Controller.prototype._expand.apply(this, arguments);
	},

	_collapse: function(/*_TreeNode*/ node){
		if(node.state == "LOADING"){
			// ignore clicks while we are in the process of loading data
			return;
		}
		mapfish_legacy.widgets.tree.Controller.prototype._collapse.apply(this, arguments);
	}

});
