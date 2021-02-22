"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.BST = exports.BST_PRINTS = void 0;
var DS_1 = require("./DS");
var Helpers_1 = require("./Helpers");
var Node_1 = require("./Node");
var V2_1 = require("./V2");
exports.BST_PRINTS = false;
var BST = /** @class */ (function (_super) {
    __extends(BST, _super);
    function BST() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = _super.call(this, DS_1.DSType.BST) || this;
        // iteractables
        _this.selfBalancing = false;
        _this.balanced = true;
        _this.values = new Set();
        if (typeof args[0] === "boolean") {
            _this.selfBalancing = args[0];
        }
        else if (typeof args[0] === "number") {
            _this.root = new Node_1.Node(_this, args[0]);
            _this.values.add(_this.root.value);
            _this.selfBalancing = args[1] || false;
        }
        else if (args[0] instanceof Node_1.Node) {
            _this.root = args[0];
            _this.root.ds = _this;
            _this.values.add(_this.root.value);
            _this.selfBalancing = args[1] || false;
        }
        else if (args[0] instanceof Array && typeof args[0][0] === "number") {
            _this.selfBalancing = args[1] || false;
            var nodes = [];
            for (var i = 0; i < args[0].length; i++) {
                nodes.push(new Node_1.Node(_this, args[0][i]));
            }
            _this.insert(nodes);
        }
        else if (args[0] instanceof Array && args[0][0] instanceof Node_1.Node) {
            _this.selfBalancing = args[1] || false;
            _this.insert(args[0]);
        }
        else {
            throw new Error("Error constructing BST, unhandled types: " + Helpers_1["default"].listTypes(args));
        }
        return _this;
    }
    BST.prototype.insert = function () {
        var _this = this;
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (exports.BST_PRINTS) {
            if (args[0] instanceof Node_1.Node) {
                console.log("insert: " + args[0].toString());
            }
            else {
                console.log("insert: " + args[0].map(function (v) { return v ? v.toString() : v; }));
            }
        }
        var nodes = [];
        var unsplitNodes = args[0] instanceof Array ? args[0] : [args[0]];
        var pointer = 0;
        for (var _b = 0, unsplitNodes_1 = unsplitNodes; _b < unsplitNodes_1.length; _b++) {
            var unsplitNode = unsplitNodes_1[_b];
            if (!unsplitNode) {
                return;
            }
            nodes.push(unsplitNode);
            while (pointer < nodes.length) {
                var node = nodes[pointer];
                if (node.left) {
                    nodes.push(node.left);
                }
                if (node.right) {
                    nodes.push(node.right);
                }
                node.removeParent();
                node.removeChild(Node_1.NodeChildCategory.LEFT);
                node.removeChild(Node_1.NodeChildCategory.RIGHT);
                pointer++;
            }
        }
        for (var _c = 0, nodes_1 = nodes; _c < nodes_1.length; _c++) {
            var node = nodes_1[_c];
            if (this.values.has(node.value)) {
                continue;
            }
            this.values.add(node.value);
            if (exports.BST_PRINTS) {
                console.log("insert: " + node.toString());
            }
            if (!this.root) {
                this.root = node;
                this.inOrderSearch(function (n) {
                    _this.nodes[n.id] = n;
                    return false;
                });
                node.ds = this;
                continue;
            }
            var pointer_1 = this.root;
            while ((node.value < pointer_1.value && pointer_1.left) || (node.value >= pointer_1.value && pointer_1.right)) {
                if (node.value < pointer_1.value && pointer_1.left) {
                    pointer_1 = pointer_1.left;
                }
                else if (pointer_1.right) {
                    pointer_1 = pointer_1.right;
                }
            }
            if (node.value < pointer_1.value) {
                pointer_1.addChild(Node_1.NodeChildCategory.LEFT, node);
            }
            else {
                pointer_1.addChild(Node_1.NodeChildCategory.RIGHT, node);
            }
        }
        if (this.root) {
            var maxDepth = Math.max(this.root.rightDepth, this.root.leftDepth);
            for (var _d = 0, nodes_2 = nodes; _d < nodes_2.length; _d++) {
                var node = nodes_2[_d];
                if (!node.physics) {
                    continue;
                }
                var pointer_2 = this.root;
                var relXPos = .5;
                var depth = 0;
                while (pointer_2 && pointer_2 !== node) {
                    depth++;
                    if (node.value > pointer_2.value) {
                        pointer_2 = pointer_2.right;
                        relXPos += 1 / Math.pow(2, depth + 1);
                    }
                    else {
                        pointer_2 = pointer_2.left;
                        relXPos -= 1 / Math.pow(2, depth + 1);
                    }
                }
                if (!pointer_2) {
                    continue;
                }
                var rootPos = node === this.root ? this.anchorPos : (_a = this.root.physics) === null || _a === void 0 ? void 0 : _a.pos;
                if (!rootPos) {
                    continue;
                }
                node.physics.pos = rootPos.add(new V2_1.V2((1.75 * Math.pow(2, maxDepth) - 1) * (relXPos - .5), -1.75 * depth));
            }
        }
        if (exports.BST_PRINTS) {
            console.log(this.treeString());
        }
        if (!args[1] && this.selfBalancing) {
            this.balance();
        }
    };
    BST.prototype.binaryInsert = function (arr) {
        if (this.root && this.root.physics) {
            this.anchorPos = this.root.physics.pos;
        }
        var filteredArr = [];
        var lastPushedIdx = -1;
        for (var i = 0; i < arr.length; ++i) {
            if (lastPushedIdx < 0 || !arr[i] || arr[i].value > arr[lastPushedIdx].value) {
                if (arr[i]) {
                    lastPushedIdx = i;
                }
                filteredArr.push(arr[i]);
            }
        }
        var toInsert = [];
        this.root = undefined;
        this.values = new Set();
        var idxBoundsQueue = [[0, filteredArr.length - 1]];
        var pointer = 0;
        if (exports.BST_PRINTS) {
            console.log(arr.map(function (v) { return v ? v.value : v; }));
        }
        while (pointer < idxBoundsQueue.length) {
            var _a = idxBoundsQueue[pointer], low = _a[0], high = _a[1];
            if (low <= high) {
                var mid = Math.floor((low + high) / 2);
                idxBoundsQueue.push([low, mid - 1]);
                idxBoundsQueue.push([mid + 1, high]);
                if (filteredArr[mid]) {
                    filteredArr[mid].removeChild(Node_1.NodeChildCategory.LEFT);
                    filteredArr[mid].removeChild(Node_1.NodeChildCategory.RIGHT);
                    filteredArr[mid].removeParent();
                    toInsert.push(filteredArr[mid]);
                }
            }
            pointer++;
        }
        this.insert(toInsert, true);
        if (exports.BST_PRINTS) {
            console.log(this.treeString());
        }
    };
    BST.prototype.removeAll = function () {
        if (this.root) {
            this.root.ds = null;
        }
        this.root = undefined;
        this.values = new Set();
        this.nodes = {};
    };
    BST.prototype.remove = function (node) {
        if (node.ds !== this || !this.root) {
            console.warn("Attempt to remove " + node.toString() + " from an non-inheriting " + this.toString() + " during BST.remove");
            return;
        }
        if (exports.BST_PRINTS) {
            console.log("remove: " + node.toString());
        }
        if (node.left && node.right) {
            if (node.right.left) {
                var pointer = node.right;
                while (pointer.left) {
                    pointer = pointer.left;
                }
                var nodePar = node.parent;
                var nodeParDir = undefined;
                if (nodePar) {
                    if (nodePar.left === node) {
                        nodeParDir = Node_1.NodeChildCategory.LEFT;
                    }
                    else {
                        nodeParDir = Node_1.NodeChildCategory.RIGHT;
                    }
                    node.removeParent();
                }
                var nodeLeft = node.removeChild(Node_1.NodeChildCategory.LEFT);
                var nodeRight = node.removeChild(Node_1.NodeChildCategory.RIGHT);
                if (!nodeLeft || !nodeRight) {
                    throw new Error();
                }
                var pointerPar = pointer.parent;
                if (!pointerPar) {
                    throw new Error();
                }
                pointer.removeParent();
                var pointerRight = pointer.removeChild(Node_1.NodeChildCategory.RIGHT);
                if (nodePar && nodeParDir) {
                    nodePar.addChild(nodeParDir, pointer);
                }
                else {
                    this.removeAll();
                    this.insert(pointer);
                }
                pointer.addChild(Node_1.NodeChildCategory.LEFT, nodeLeft);
                pointer.addChild(Node_1.NodeChildCategory.RIGHT, nodeRight);
                if (pointerRight) {
                    pointerPar.addChild(Node_1.NodeChildCategory.LEFT, pointerRight);
                }
            }
            else {
                var nodePar = node.parent;
                var nodeParDir = undefined;
                if (nodePar) {
                    if (nodePar.left === node) {
                        nodeParDir = Node_1.NodeChildCategory.LEFT;
                    }
                    else {
                        nodeParDir = Node_1.NodeChildCategory.RIGHT;
                    }
                }
                var nodeLeft = node.removeChild(Node_1.NodeChildCategory.LEFT);
                var nodeRight = node.removeChild(Node_1.NodeChildCategory.RIGHT);
                if (!nodeLeft || !nodeRight) {
                    throw new Error();
                }
                node.removeParent();
                if (nodePar && nodeParDir) {
                    nodePar.addChild(nodeParDir, nodeRight);
                }
                else {
                    this.removeAll();
                    this.insert(nodeRight);
                }
                nodeRight.addChild(Node_1.NodeChildCategory.LEFT, nodeLeft);
            }
        }
        else if (node.left || node.right) {
            var left = node.removeChild(Node_1.NodeChildCategory.LEFT);
            var right = node.removeChild(Node_1.NodeChildCategory.RIGHT);
            if (!((!left && right) || (left && !right))) {
                throw new Error();
            }
            var nodeParent = node.parent;
            if (nodeParent) {
                if (nodeParent.left === node) {
                    node.removeParent();
                    nodeParent.addChild(Node_1.NodeChildCategory.LEFT, (left || right));
                }
                else {
                    node.removeParent();
                    nodeParent.addChild(Node_1.NodeChildCategory.RIGHT, (left || right));
                }
            }
            else {
                this.removeAll();
                this.insert((left || right));
            }
        }
        else {
            if (this.root === node) {
                this.removeAll();
            }
            else {
                node.removeParent();
            }
        }
        if (exports.BST_PRINTS) {
            console.log(this.treeString());
        }
        if (this.selfBalancing) {
            this.balance();
        }
    };
    BST.prototype.balance = function () {
        if (!this.root) {
            return;
        }
        if (exports.BST_PRINTS) {
            console.log("balance: " + this.treeString());
        }
        var inOrderNodes = this.inOrderSearch(function () { return true; }, false) || [];
        this.binaryInsert(inOrderNodes);
    };
    BST.prototype.changeNodeValue = function (node, value) {
        if (this.values.has(value)) {
            return false;
        }
        this.remove(node);
        node.value = value;
        this.insert(node);
        return true;
    };
    BST.prototype.changeNodeValue2 = function (node, value) {
        if (this.values.has(value)) {
            return false;
        }
        var inOrderNodes = this.inOrderSearch(function () { return true; }, false, this.root, true);
        if (!inOrderNodes) {
            return false;
        }
        var changeNodeIdx = -1;
        for (var i = 0; i < inOrderNodes.length; ++i) {
            if (inOrderNodes[i] === node) {
                changeNodeIdx = i;
                break;
            }
        }
        if (changeNodeIdx === -1) {
            return false;
        }
        inOrderNodes[changeNodeIdx].value = value;
        var leftPointer = changeNodeIdx - 1;
        while (leftPointer >= 0) {
            if (!inOrderNodes[leftPointer]) {
                leftPointer--;
            }
            else {
                if (inOrderNodes[leftPointer].value > inOrderNodes[changeNodeIdx].value) {
                    var swap = inOrderNodes[leftPointer];
                    inOrderNodes[leftPointer] = inOrderNodes[changeNodeIdx];
                    inOrderNodes[changeNodeIdx] = swap;
                    changeNodeIdx = leftPointer;
                    leftPointer--;
                }
                else {
                    break;
                }
            }
        }
        var rightPointer = changeNodeIdx + 1;
        while (rightPointer < inOrderNodes.length) {
            if (!inOrderNodes[rightPointer]) {
                rightPointer++;
            }
            else {
                if (inOrderNodes[rightPointer].value < inOrderNodes[changeNodeIdx].value) {
                    var swap = inOrderNodes[rightPointer];
                    inOrderNodes[rightPointer] = inOrderNodes[changeNodeIdx];
                    inOrderNodes[changeNodeIdx] = swap;
                    changeNodeIdx = rightPointer;
                    rightPointer++;
                }
                else {
                    break;
                }
            }
        }
        this.binaryInsert(inOrderNodes);
        return true;
    };
    BST.prototype.breadthFirstSearch = function (callback, stopAtFirst, origin) {
        if (stopAtFirst === void 0) { stopAtFirst = true; }
        var rtn = [];
        var queue;
        if (!origin) {
            if (!this.root) {
                return null;
            }
            queue = [[this.root, 0]];
        }
        else if (origin.ds === this) {
            queue = [[origin, 0]];
        }
        else {
            return null;
        }
        var pointer = 0;
        while (pointer < queue.length) {
            var _a = queue[pointer], node = _a[0], depth = _a[1];
            if (callback(node, depth)) {
                rtn.push(node);
                if (stopAtFirst) {
                    return rtn;
                }
            }
            if (node.left) {
                queue.push([node.left, depth + 1]);
            }
            if (node.right) {
                queue.push([node.right, depth + 1]);
            }
            pointer++;
        }
        return rtn;
    };
    BST.prototype.depthFirstSearch = function (callback, stopAtFirst, origin) {
        if (stopAtFirst === void 0) { stopAtFirst = true; }
        var rtn = [];
        var stack;
        var stackSet = new Set();
        if (!origin) {
            if (!this.root) {
                return null;
            }
            stack = [[this.root, 0]];
        }
        else if (origin.ds === this) {
            stack = [[origin, 0]];
        }
        else {
            return null;
        }
        while (stack.length) {
            var _a = stack[stack.length - 1], node = _a[0], depth = _a[1];
            stackSet.add(node);
            if (node.right && !stackSet.has(node.right)) {
                stack.push([node.right, depth + 1]);
                continue;
            }
            if (node.left && !stackSet.has(node.left)) {
                stack.push([node.left, depth + 1]);
                continue;
            }
            if (callback(node, depth)) {
                rtn.push(node);
                if (stopAtFirst) {
                    return rtn;
                }
            }
            stack.pop();
        }
        return rtn;
    };
    BST.prototype.inOrderSearch = function (callback, stopAtFirst, origin, includeEmpty) {
        if (stopAtFirst === void 0) { stopAtFirst = true; }
        if (includeEmpty === void 0) { includeEmpty = false; }
        if (!this.root) {
            return null;
        }
        var rtn = [];
        var stack;
        var stackSet = new Set();
        if (!origin) {
            stack = [[this.root, 0]];
        }
        else if (origin.ds === this) {
            stack = [[origin, 0]];
        }
        else {
            return null;
        }
        var maxDepth = Math.max(this.root.leftDepth, this.root.rightDepth);
        while (stack.length) {
            var _a = stack[stack.length - 1], node = _a[0], depth = _a[1];
            stackSet.add(node);
            if (node.left && !stackSet.has(node.left)) {
                stack.push([node.left, depth + 1]);
                continue;
            }
            if (includeEmpty && !node.left) {
                var iMax = 0;
                for (var i = 0; i < maxDepth - depth; ++i) {
                    iMax += Math.pow(2, i);
                }
                for (var i = 0; i < iMax; ++i) {
                    rtn.push(null);
                }
            }
            if (callback(node, depth)) {
                rtn.push(node);
                if (stopAtFirst) {
                    return rtn;
                }
            }
            stack.pop();
            if (node.right && !stackSet.has(node.right)) {
                stack.push([node.right, depth + 1]);
            }
            if (includeEmpty && !node.right) {
                var iMax = 0;
                for (var i = 0; i < maxDepth - depth; ++i) {
                    iMax += Math.pow(2, i);
                }
                for (var i = 0; i < iMax; ++i) {
                    rtn.push(null);
                }
            }
        }
        return rtn;
    };
    BST.prototype.binarySearch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.root) {
            return null;
        }
        if (typeof args[0] === "number") {
            args[0] = function (node) { return Math.sign(args[0] - node.value); };
        }
        var pointer = args[1] || this.root;
        while ((args[0](pointer) === 1 && pointer.right) || (args[0](pointer) === -1 && pointer.left)) {
            if (args[0](pointer) === 1 && pointer.right) {
                pointer = pointer.right;
            }
            else if (pointer.left) {
                pointer = pointer.left;
            }
        }
        if (args[0](pointer) === 0) {
            return pointer;
        }
        else {
            return null;
        }
    };
    BST.prototype.setSelfBalancing = function (value) {
        if (!this.selfBalancing && value) {
            this.balance();
        }
        this.selfBalancing = value;
    };
    BST.prototype.toString = function (fields) {
        if (fields === void 0) { fields = ["id", "root"]; }
        var rtn = "BST(";
        var addedFields = new Set();
        if (fields) {
            for (var i = 0; i < fields.length; ++i) {
                if (!addedFields.has(fields[i])) {
                    rtn += (i ? ", " : "") + fields[i] + ": " + this[fields[i]];
                    addedFields.add(fields[i]);
                }
            }
        }
        rtn += ")";
        return rtn;
    };
    BST.prototype.treeString = function (root) {
        if (root === void 0) { root = this.root; }
        var rtn = "";
        if (root) {
            rtn += "\n";
            var maxDepth = Math.max(root.rightDepth, root.leftDepth) + 1;
            var queue = [[root, 1, 1]];
            var pointer = 0;
            while (pointer < queue.length) {
                var _a = queue[pointer], node = _a[0], depth = _a[1], lineCount = _a[2];
                var maxLineCount = Math.pow(2, depth - 1);
                var edgeStraddleCount = Math.pow(2, maxDepth - depth);
                var edgeSpace = maxDepth !== depth ? Math.floor((2 * edgeStraddleCount - 1) / 2) : 0;
                if (lineCount === 1) {
                    rtn += "   ";
                    for (var i = 0; i < edgeSpace; ++i) {
                        rtn += " ";
                    }
                }
                rtn += node ? node.value : ".";
                if (lineCount !== maxLineCount) {
                    var totalSpace = 2 * Math.pow(2, maxDepth - 1) - 1;
                    var spacing = Math.floor((totalSpace - maxLineCount - 2 * edgeSpace) / (maxLineCount - 1));
                    for (var i = 0; i < spacing; ++i) {
                        rtn += " ";
                    }
                }
                else {
                    for (var i = 0; i < maxDepth - 4; ++i) {
                        rtn += "\n";
                    }
                    rtn += "\n";
                }
                if (depth < maxDepth) {
                    if (!node || !node.left) {
                        queue.push([null, depth + 1, 2 * lineCount - 1]);
                    }
                    else {
                        queue.push([node.left, depth + 1, 2 * lineCount - 1]);
                    }
                    if (!node || !node.right) {
                        queue.push([null, depth + 1, 2 * lineCount]);
                    }
                    else {
                        queue.push([node.right, depth + 1, 2 * lineCount]);
                    }
                }
                pointer++;
            }
            rtn += "\n";
        }
        else {
            rtn += "empty tree";
        }
        return rtn;
    };
    return BST;
}(DS_1.DS));
exports.BST = BST;
