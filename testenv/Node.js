"use strict";
exports.__esModule = true;
exports.Node = exports.NodeChildCategory = void 0;
var DS_1 = require("./DS");
var Helpers_1 = require("./Helpers");
var BST_1 = require("./BST");
var NodeChildCategory;
(function (NodeChildCategory) {
    NodeChildCategory["LEFT"] = "LEFT";
    NodeChildCategory["RIGHT"] = "RIGHT";
    NodeChildCategory["GROUP"] = "GROUP";
})(NodeChildCategory = exports.NodeChildCategory || (exports.NodeChildCategory = {}));
var nextId = 0;
var Node = /** @class */ (function () {
    function Node() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        // iteractables vvv
        this.ds = null;
        this.physics = null;
        this.left = null;
        this.right = null;
        this.children = [];
        this.parent = null;
        this.displayChar = false;
        this.depth = 0;
        this.leftCount = 0;
        this.leftDepth = 0;
        this.rightCount = 0;
        this.rightDepth = 0;
        this.childrenCount = 0;
        this.toRender = true;
        if (arg[0] instanceof DS_1.DS || !arg[0]) {
            this.ds = arg[0];
            this.value = arg[1];
            if (arg[2] !== undefined) {
                this.left = arg[2];
            }
            if (arg[3] !== undefined) {
                this.right = arg[3];
            }
            if (arg[4] !== undefined) {
                this.children = arg[4];
            }
            if (arg[5] !== undefined) {
                this.parent = arg[5];
            }
            if (arg[6] !== undefined) {
                this.displayChar = arg[5];
            }
        }
        else if (typeof (arg[0]) === "object") {
            this.ds = arg[0].ds;
            this.value = arg[0].value;
            if (arg[0].left !== undefined) {
                this.left = arg[0].left;
            }
            if (arg[0].right !== undefined) {
                this.right = arg[0].right;
            }
            if (arg[0].children !== undefined) {
                this.children = arg[0].children;
            }
            if (arg[0].parent !== undefined) {
                this.parent = arg[0].parent;
            }
            if (arg[0].displayChar !== undefined) {
                this.displayChar = arg[0].displayChar;
            }
        }
        else {
            var errorStr = "Unhandled parameter types: " + arg[0].constructor.name;
            for (var i = 0; i < arg.length; ++i) {
                errorStr += ", " + arg[i].constructor.name;
            }
            errorStr += " for Node.constructor";
            throw new Error(errorStr);
        }
        this.id = nextId++;
    }
    Node.prototype.removeParent = function () {
        if (!this.parent) {
            return false;
        }
        if (this.parent.left === this) {
            this.parent.removeChild(NodeChildCategory.LEFT);
        }
        else if (this.parent.right === this) {
            this.parent.removeChild(NodeChildCategory.RIGHT);
        }
        else {
            this.parent.removeChild(NodeChildCategory.GROUP, this);
        }
        return true;
    };
    Node.prototype.addChild = function (childCategory, node) {
        var queue = [node];
        var pointer = 0;
        while (pointer < queue.length) {
            var node2 = queue[pointer];
            if (node2.left) {
                queue.push(node2.left);
            }
            if (node2.right) {
                queue.push(node2.right);
            }
            if (childCategory === NodeChildCategory.LEFT && node2.value >= this.value) {
                throw new Error("Unable to add " + node2.toString() + " in " + this.ds.treeString(node) +
                    " to left of " + this.toString() + " in " + this.ds.treeString() + " for Node.addChild(LEFT)");
            }
            else if (childCategory === NodeChildCategory.RIGHT && node2.value < this.value) {
                throw new Error("Unable to add " + node2.toString() + " in " + this.ds.treeString(node) +
                    " to right of " + this.toString() + " in " + this.ds.treeString() + " for Node.addChild(RIGHT)");
            }
            pointer++;
        }
        if (childCategory === NodeChildCategory.LEFT) {
            if (this.left)
                throw new Error("Unable to push " + node.toString() + ". Left node already exists on " + this.toString() + " for Node.addChild");
            if (this.children.length > 0)
                console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild");
            if (node.parent)
                console.warn("Forced parent override of " + this.toString() + " for Node.addChild");
            node.removeParent();
            node.parent = this;
            node.updateDS(this.ds);
            node.updateDepth(this.depth + 1);
            this.left = node;
            this.addChildrenCount(node.childrenCount + 1, NodeChildCategory.LEFT);
            this.updateChildrenDepth(NodeChildCategory.LEFT, Math.max(node.leftDepth, node.rightDepth) + 1);
        }
        else if (childCategory === NodeChildCategory.RIGHT) {
            if (this.right)
                throw new Error("Unable to push " + node.id + ". Right node already exists on " + this.toString() + " for Node.addChild(RIGHT)");
            if (this.children.length > 0)
                console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(RIGHT)");
            if (node.parent)
                console.warn("Forced parent override of " + this.toString() + " for Node.addChild(RIGHT)");
            node.removeParent();
            node.parent = this;
            node.updateDS(this.ds);
            node.updateDepth(this.depth + 1);
            this.right = node;
            this.addChildrenCount(node.childrenCount + 1, NodeChildCategory.RIGHT);
            this.updateChildrenDepth(NodeChildCategory.RIGHT, Math.max(node.leftDepth, node.rightDepth) + 1);
        }
        else {
            if (this.left || this.right)
                console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(GROUP)");
            if (node.parent)
                console.warn("Forced parent override of " + this.toString() + " for Node.addChild(GROUP)");
            node.removeParent();
            node.parent = this;
            node.ds = this.ds;
            this.children.push(node);
            var pointer_1 = this;
            while (pointer_1) {
                pointer_1.childrenCount += node.childrenCount + 1;
                pointer_1 = pointer_1.parent;
            }
        }
    };
    Node.prototype.removeChild = function (childCategory, node) {
        if (childCategory === NodeChildCategory.LEFT || childCategory === NodeChildCategory.RIGHT) {
            var removeNode = void 0;
            if (childCategory === NodeChildCategory.LEFT) {
                if (this.left) {
                    removeNode = this.left;
                    this.left = null;
                }
                else {
                    return null;
                }
            }
            else {
                if (this.right) {
                    removeNode = this.right;
                    this.right = null;
                }
                else {
                    return null;
                }
            }
            this.addChildrenCount(-removeNode.childrenCount - 1, childCategory);
            this.updateChildrenDepth(childCategory, 0);
            removeNode.parent = null;
            removeNode.ds = null;
            removeNode.updateDepth(0);
            return removeNode;
        }
        else if (childCategory === NodeChildCategory.GROUP && node) {
            var _a = Helpers_1["default"].binarySearch(function (v) { return Math.sign(node.id - v.id); }, this.children), idx = _a[0], match = _a[1];
            if (!match) {
                return null;
            }
            this.children[idx].parent = null;
            this.children[idx].ds = null;
            this.children.splice(idx);
            var pointer = this;
            while (pointer) {
                pointer.childrenCount -= node.childrenCount + 1;
                pointer = pointer.parent;
            }
            return node;
        }
        else {
            throw new Error("Unhandled parameter types: " + childCategory + " for Node.removeChild()");
        }
    };
    // chained iterators vvvv
    Node.prototype.addChildrenCount = function (adder, category) {
        if (category === NodeChildCategory.LEFT) {
            this.leftCount += adder;
        }
        else if (category === NodeChildCategory.RIGHT) {
            this.rightCount += adder;
        }
        this.childrenCount += adder;
        if (this.parent && this.ds instanceof BST_1.BST) {
            if (this.parent.left === this) {
                this.parent.addChildrenCount(adder, NodeChildCategory.LEFT);
            }
            else {
                this.parent.addChildrenCount(adder, NodeChildCategory.RIGHT);
            }
        }
    };
    Node.prototype.updateDepth = function (newValue) {
        this.depth = newValue;
        if (this.left) {
            this.left.updateDepth(newValue + 1);
        }
        if (this.right) {
            this.right.updateDepth(newValue + 1);
        }
    };
    Node.prototype.updateChildrenDepth = function (category, newValue) {
        if (category === NodeChildCategory.LEFT) {
            this.leftDepth = newValue;
        }
        else {
            this.rightDepth = newValue;
        }
        if (this.parent) {
            if (this.parent.left === this) {
                this.parent.updateChildrenDepth(NodeChildCategory.LEFT, newValue + 1);
            }
            else {
                this.parent.updateChildrenDepth(NodeChildCategory.RIGHT, newValue + 1);
            }
        }
    };
    Node.prototype.updateDS = function (ds) {
        this.ds = ds;
        if (this.ds) {
            delete this.ds.nodes[this.id];
        }
        if (ds) {
            ds.nodes[this.id] = this;
        }
        if (this.right) {
            this.right.updateDS(ds);
        }
        if (this.left) {
            this.left.updateDS(ds);
        }
    };
    Node.prototype.getContextActions = function () {
        return ([
            ["nodeTest1", function (e) { return console.log("nodeTest1"); }],
        ]);
    };
    Node.prototype.compare = function (node) {
        if (this.value < node.value) {
            return -1;
        }
        else if (this.value > node.value) {
            return 1;
        }
        else {
            return 0;
        }
    };
    Node.prototype.toString = function (fields) {
        if (fields === void 0) { fields = ["id", "value"]; }
        var rtn = "Node(";
        var addedFields = new Set();
        for (var i = 0; i < fields.length; ++i) {
            if (!addedFields.has(fields[i])) {
                rtn += (i ? ", " : "") + fields[i] + ": " + this[fields[i]];
                addedFields.add(fields[i]);
            }
        }
        rtn += ")";
        return rtn;
    };
    return Node;
}());
exports.Node = Node;
