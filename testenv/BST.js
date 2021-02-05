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
var Node_1 = require("./Node");
exports.BST_PRINTS = false;
var BST = /** @class */ (function (_super) {
    __extends(BST, _super);
    function BST() {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var _this = _super.call(this, DS_1.DSType.BST) || this;
        // iteractables
        _this.selfBalancing = false;
        _this.balanced = true;
        _this.selfBalancing = arg[1] || false;
        if (typeof (arg[0]) === "number") {
            _this.root = new Node_1.Node(_this, arg[0]);
        }
        else if (arg[0] instanceof Node_1.Node) {
            _this.root = arg[0];
            _this.root.ds = _this;
        }
        else if (arg[0] instanceof Array) {
            var nodes = [];
            for (var i = 0; i < arg[0].length; i++) {
                nodes.push(new Node_1.Node(_this, arg[0][i]));
            }
            _this.insert(nodes);
        }
        return _this;
    }
    BST.prototype.insert = function () {
        var _this = this;
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        var nodes = [];
        var unsplitNodes = arg[0] instanceof Array ? arg[0] : [arg[0]];
        var pointer = 0;
        for (var _a = 0, unsplitNodes_1 = unsplitNodes; _a < unsplitNodes_1.length; _a++) {
            var unsplitNode = unsplitNodes_1[_a];
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
        for (var _b = 0, nodes_1 = nodes; _b < nodes_1.length; _b++) {
            var node = nodes_1[_b];
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
        if (exports.BST_PRINTS) {
            console.log(this.treeString());
        }
        if (this.selfBalancing) {
            this.balance();
        }
    };
    BST.prototype.remove = function (node) {
        if (node.ds !== this || !this.root) {
            throw new Error("Attempt to remove " + node.toString() + " from an non-inheriting " + this.toString() + " during BST.remove");
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
                    this.root.ds = null;
                    this.root = undefined;
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
                    this.root.ds = null;
                    this.root = undefined;
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
                this.root.ds = null;
                this.root = undefined;
                this.nodes = {};
                this.insert((left || right));
            }
        }
        else {
            if (this.root === node) {
                this.root = undefined;
                this.nodes = {};
                node.ds = null;
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
    BST.prototype.swap = function (nodeOne, nodeTwo) {
        if (exports.BST_PRINTS) {
            console.log("swap: " + nodeOne.toString() + ", " + nodeTwo.toString());
        }
        if (nodeOne.left && nodeTwo.left) {
            throw new Error();
        }
        var parentOne = nodeOne.parent;
        var nodeOneDir = null;
        if (parentOne) {
            if (parentOne.left === nodeOne) {
                nodeOneDir = Node_1.NodeChildCategory.LEFT;
            }
            else {
                nodeOneDir = Node_1.NodeChildCategory.RIGHT;
            }
        }
        var parentTwo = nodeTwo.parent;
        var nodeTwoDir = null;
        if (parentTwo) {
            if (parentTwo.left === nodeTwo) {
                nodeTwoDir = Node_1.NodeChildCategory.LEFT;
            }
            else {
                nodeTwoDir = Node_1.NodeChildCategory.RIGHT;
            }
        }
        nodeOne.removeParent();
        nodeTwo.removeParent();
        var leftOne = nodeOne.removeChild(Node_1.NodeChildCategory.LEFT);
        var rightOne = nodeOne.removeChild(Node_1.NodeChildCategory.RIGHT);
        var leftTwo = nodeTwo.removeChild(Node_1.NodeChildCategory.LEFT);
        var rightTwo = nodeTwo.removeChild(Node_1.NodeChildCategory.RIGHT);
        if (exports.BST_PRINTS) {
            console.log((parentOne ? parentOne.value + " " + nodeOneDir + " " : "") + nodeOne.value + " "
                + (leftOne ? leftOne.value + " " : "") + (rightOne ? rightOne.value : ""));
            console.log((parentTwo ? parentTwo.value + " " + nodeTwoDir + " " : "") + nodeTwo.value + " "
                + (leftTwo ? leftTwo.value + " " : "") + (rightTwo ? rightTwo.value : ""));
        }
        if (parentOne === nodeTwo && nodeOneDir) {
            nodeOne.addChild(nodeOneDir, nodeTwo);
        }
        else if (parentOne && nodeOneDir) {
            parentOne.addChild(nodeOneDir, nodeTwo);
        }
        else {
            this.root = nodeTwo;
            this.root.ds = this;
        }
        if (parentTwo === nodeOne && nodeTwoDir) {
            nodeTwo.addChild(nodeTwoDir, nodeOne);
        }
        else if (parentTwo && nodeTwoDir) {
            parentTwo.addChild(nodeTwoDir, nodeOne);
        }
        else {
            this.root = nodeOne;
            this.root.ds = this;
        }
        if (leftOne) {
            nodeTwo.addChild(Node_1.NodeChildCategory.LEFT, leftOne);
        }
        if (rightOne) {
            nodeTwo.addChild(Node_1.NodeChildCategory.RIGHT, rightOne);
        }
        if (leftTwo) {
            nodeOne.addChild(Node_1.NodeChildCategory.LEFT, leftTwo);
        }
        if (rightTwo) {
            nodeOne.addChild(Node_1.NodeChildCategory.RIGHT, rightTwo);
        }
        if (exports.BST_PRINTS) {
            console.log(this.treeString());
        }
    };
    BST.prototype.balance = function () {
        if (!this.root) {
            return;
        }
        var maxDepth = Math.floor(Math.log2(Object.values(this.nodes).length)) + 1;
        if (this.root.leftDepth + 1 > maxDepth || this.root.rightDepth + 1 > maxDepth) {
            if (exports.BST_PRINTS) {
                console.log("balance: " + this.treeString());
            }
            var inOrderNodes = this.inOrderSearch(function () { return true; }, false) || [];
            this.root = undefined;
            var idxBoundsQueue = [[0, inOrderNodes.length - 1]];
            var pointer = 0;
            if (exports.BST_PRINTS) {
                console.log(inOrderNodes.map(function (v) { return v.value; }));
            }
            while (pointer < idxBoundsQueue.length) {
                var _a = idxBoundsQueue[pointer], low = _a[0], high = _a[1];
                if (low <= high) {
                    var mid = Math.floor((low + high) / 2);
                    idxBoundsQueue.push([low, mid - 1]);
                    idxBoundsQueue.push([mid + 1, high]);
                    inOrderNodes[mid].removeChild(Node_1.NodeChildCategory.LEFT);
                    inOrderNodes[mid].removeChild(Node_1.NodeChildCategory.RIGHT);
                    inOrderNodes[mid].removeParent();
                    this.insert(inOrderNodes[mid]);
                }
                pointer++;
            }
            if (exports.BST_PRINTS) {
                console.log(this.treeString());
            }
        }
    };
    /* Balancing algo 2
    if (!this.root) { return; }
    const queue: [Node, number][] = [[this.root, 1]];
    let pointer: number = 0;
    const maxDepth: number = Math.floor(Math.log2(this.nodeCount)) + 1;
    while (pointer < queue.length && (this.root.leftCount + 1 > maxDepth || this.root.rightCount + 1 > maxDepth)) {
      const [ node, depth ]: [Node, number] = queue[pointer];
      if (node.left) {
        queue.push([node.left, depth + 1]);
      } else if (node.right) {
        let repl: Node = node.right;
        while (repl.left) {
          repl = repl.left;
        }
        this.swap(node, repl);

      }
      if (node.right) {
        queue.push([node.right, depth + 1]);
      }
      pointer++;
    }
    const stack: [Node, number][] = [[this.root, 1]];
    const stackSet: Set<Node> = new Set();
    const maxDepth: number = Math.floor(Math.log2(this.nodeCount)) + 1;
    while (stack.length) {
      const [ node, depth ]: [Node, number] = stack[stack.length-1];
      console.log(stack.map(v => v[0].value), stackSet);
      stackSet.add(node.id);
      if (node.right && !stackSet.has(node.right.id)) {
        stack.push([node.right, depth + 1]);
        continue;
      } else {
        console.log(node.right?.toString(), node.right ? stackSet.has(node.right.id) : "");
      }
      if (node.left && !stackSet.has(node.left.id)) {
        stack.push([node.left, depth + 1]);
        continue;
      }

      console.log("balanceCheck: " + node.toString());
      if (node.leftDepth >= 2 && depth + node.leftDepth > maxDepth) {
        if (!node.left) { throw new Error(); }
        let replNode: Node = node.left;
        while (replNode.right) {
          replNode = replNode.right;
        }
        console.log("top: " + node.toString() + " bottom: " + replNode.toString());
        const replNodeLeft: Node | null = replNode.removeChild(NodeChildCategory.LEFT);
        const nodeParent: Node | null = node.parent;
        let nodeParentDir: NodeChildCategory | null = null;
        if (nodeParent) {
          node.removeParent();
          if (nodeParent.left === node) {
            nodeParentDir = NodeChildCategory.LEFT;
          } else {
            nodeParentDir = NodeChildCategory.RIGHT;
          }
        }
        const nodeLeft: Node | null = node.removeChild(NodeChildCategory.LEFT);
        const nodeRight: Node | null = node.removeChild(NodeChildCategory.RIGHT);
        replNode.removeParent();
        if (nodeParent && nodeParentDir) {
          nodeParent.addChild(nodeParentDir, replNode);
        } else {
          this.root = undefined;
          this.insert(replNode);
        }
        if (nodeLeft && nodeLeft !== replNode) {
          replNode.addChild(NodeChildCategory.LEFT, nodeLeft);
        }
        replNode.addChild(NodeChildCategory.RIGHT, node);
        if (replNodeLeft) {
          this.insert(replNodeLeft);
        }
        if (nodeRight) {
          this.insert(nodeRight);
        }
      }
      if (node.rightDepth >= 2 && depth + node.rightDepth > maxDepth) {
        if (!node.right) { throw new Error(); }
        let replNode: Node = node.right;
        while (replNode.left) {
          replNode = replNode.left;
        }
        console.log("top: " + node.toString() + " bottom: " + replNode.toString());
        const replNodeRight: Node | null = replNode.removeChild(NodeChildCategory.RIGHT);
        const nodeParent: Node | null = node.parent;
        let nodeParentDir: NodeChildCategory | null = null;
        if (nodeParent) {
          node.removeParent();
          if (nodeParent.left === node) {
            nodeParentDir = NodeChildCategory.LEFT;
          } else {
            nodeParentDir = NodeChildCategory.RIGHT;
          }
        }
        const nodeLeft: Node | null = node.removeChild(NodeChildCategory.LEFT);
        const nodeRight: Node | null = node.removeChild(NodeChildCategory.RIGHT);
        replNode.removeParent();
        if (nodeParent && nodeParentDir) {
          nodeParent.addChild(nodeParentDir, replNode);
        } else {
          this.root = undefined;
          this.insert(replNode);
        }
        if (nodeRight && nodeRight !== replNode) {
          replNode.addChild(NodeChildCategory.RIGHT, nodeRight);
        }
        replNode.addChild(NodeChildCategory.LEFT, node);
        if (replNodeRight) {
          this.insert(replNodeRight);
        }
        if (nodeLeft) {
          this.insert(nodeLeft);
        }
      }
      stack.pop();
    } */
    /* Balancing algo 1 (doesnt handle more global cases inbalances)
    while (stack.length) {
      const [ node, depth ]: [Node, number] = stack[stack.length-1];
      stackSet.add(node);
      if (node.right && !stackSet.has(node.right)) {
        stack.push([node.right, depth + 1]);
        continue;
      }
      if (node.left && !stackSet.has(node.left)) {
        stack.push([node.left, depth + 1]);
        continue;
      }
      console.log("balancing " + node.toString());
      const maxDepth: number = Math.floor(Math.log2(this.nodeCount)) + 1;
      if ((node.rightDepth - node.leftDepth > 1 || depth + node.rightDepth > maxDepth) && node.right) {
        console.log(this.treeString());
        if (node.right.rightDepth >= node.right.leftDepth) { // right-right case
          console.log("right-right on " + node.toString());
          const pivotLeft: Node | null = node.right.removeChild(NodeChildCategory.LEFT);
          const pivotRight: Node | null = node.right.removeChild(NodeChildCategory.RIGHT);
          const pivot: Node | null = node.removeChild(NodeChildCategory.RIGHT);
          if (!pivot) { throw new Error(); }
          if (node.parent) {
            const nodeParent: Node = node.parent;
            let nodeParentCategory: NodeChildCategory;
            if (node.parent.left === node) {
              nodeParentCategory = NodeChildCategory.LEFT;
            } else {
              nodeParentCategory = NodeChildCategory.RIGHT;
            }
            node.parent.removeChild(nodeParentCategory);
            nodeParent.addChild(nodeParentCategory, pivot);
          } else if (this.root === node) {
            this.root = pivot;
          } else {
            throw new Error();
          }
          pivot.addChild(NodeChildCategory.LEFT, node);
          if (pivotRight) {
            pivot.addChild(NodeChildCategory.RIGHT, pivotRight);
          }
          if (pivotLeft) {
            node.addChild(NodeChildCategory.RIGHT, pivotLeft);
          }
        } else { // right-left case
          console.log("right-left on " + node.toString());
          if (!node.right.left) { throw new Error(); }
          const pivotLeft: Node | null = node.right.left.removeChild(NodeChildCategory.LEFT);
          const pivotRight: Node | null = node.right.left.removeChild(NodeChildCategory.RIGHT);
          const pivot: Node | null = node.right.removeChild(NodeChildCategory.LEFT);
          if (!pivot) { throw new Error(); }
          const hinge: Node | null = node.removeChild(NodeChildCategory.RIGHT);
          if (!hinge) { throw new Error(); }
          if (node.parent) {
            const nodeParent: Node = node.parent;
            let nodeParentCategory: NodeChildCategory;
            if (nodeParent.left === node) {
              nodeParentCategory = NodeChildCategory.LEFT;
            } else {
              nodeParentCategory = NodeChildCategory.RIGHT;
            }
            nodeParent.removeChild(nodeParentCategory);
            this.insert(pivot);
            //nodeParent.addChild(nodeParentCategory, pivot);
          } else if (this.root === node) {
            this.root = pivot;
          } else {
            throw new Error();
          }
          // pivot.addChild(NodeChildCategory.RIGHT, hinge);
          // pivot.addChild(NodeChildCategory.LEFT, node);
          // if (pivotLeft) {
          //   node.addChild(NodeChildCategory.RIGHT, pivotLeft);
          // }
          // if (pivotRight) {
          //   hinge.addChild(NodeChildCategory.LEFT, pivotRight);
          // }
          this.insert(hinge);
          this.insert(node);
          if (pivotLeft) {
            this.insert(pivotLeft);
          }
          if (pivotRight) {
            this.insert(pivotRight);
          }
        }
        console.log(this.treeString());
      } else if ((node.leftDepth - node.rightDepth > 1 || depth + node.leftDepth > maxDepth) && node.left) {
        console.log(this.treeString());
        if (node.left.leftDepth >= node.left.rightDepth) { // left-left case
          console.log("left-left on " + node.toString());
          const pivotRight: Node | null = node.left.removeChild(NodeChildCategory.RIGHT);
          const pivotLeft: Node | null = node.left.removeChild(NodeChildCategory.LEFT);
          const pivot: Node | null = node.removeChild(NodeChildCategory.LEFT);
          if (!pivot) { throw new Error(); }
          if (node.parent) {
            const nodeParent: Node = node.parent;
            let nodeParentCategory: NodeChildCategory;
            if (node.parent.left === node) {
              nodeParentCategory = NodeChildCategory.LEFT;
            } else {
              nodeParentCategory = NodeChildCategory.RIGHT;
            }
            node.parent.removeChild(nodeParentCategory);
            nodeParent.addChild(nodeParentCategory, pivot);
          } else if (this.root === node) {
            this.root = pivot;
          } else {
            throw new Error();
          }
          pivot.addChild(NodeChildCategory.RIGHT, node);
          if (pivotLeft) {
            pivot.addChild(NodeChildCategory.LEFT, pivotLeft);
          }
          if (pivotRight) {
            node.addChild(NodeChildCategory.LEFT, pivotRight);
          }
        } else { //left-right case
          console.log("left-right on " + node.toString());
          if (!node.left.right) { throw new Error(); }
          const pivotLeft: Node | null = node.left.right.removeChild(NodeChildCategory.LEFT);
          const pivotRight: Node | null = node.left.right.removeChild(NodeChildCategory.RIGHT);
          const pivot: Node | null = node.left.removeChild(NodeChildCategory.RIGHT);
          if (!pivot) { throw new Error(); }
          const hinge: Node | null = node.removeChild(NodeChildCategory.LEFT);
          if (!hinge) { throw new Error(); }
          if (node.parent) {
            const nodeParent: Node = node.parent;
            let nodeParentCategory: NodeChildCategory;
            if (nodeParent.left === node) {
              nodeParentCategory = NodeChildCategory.LEFT;
            } else {
              nodeParentCategory = NodeChildCategory.RIGHT;
            }
            nodeParent.removeChild(nodeParentCategory);
            nodeParent.addChild(nodeParentCategory, pivot);
          } else if (this.root === node) {
            this.root = pivot;
          } else {
            throw new Error();
          }
          pivot.addChild(NodeChildCategory.LEFT, hinge);
          pivot.addChild(NodeChildCategory.RIGHT, node);
          if (pivotLeft) {
            hinge.addChild(NodeChildCategory.RIGHT, pivotLeft);
          }
          if (pivotRight) {
            node.addChild(NodeChildCategory.LEFT, pivotRight);
          }
        }
        console.log(this.treeString());
      }
      stack.pop();
    } */
    BST.prototype.flatten = function (node) {
        return [];
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
    BST.prototype.inOrderSearch = function (callback, stopAtFirst, origin) {
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
            if (node.right && !stackSet.has(node.right)) {
                stack.push([node.right, depth + 1]);
            }
        }
        return rtn;
    };
    BST.prototype.binarySearch = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        if (!this.root) {
            return null;
        }
        if (typeof arg[0] === "number") {
            arg[0] = function (node) { return Math.sign(arg[0] - node.value); };
        }
        var pointer = arg[1] || this.root;
        while ((arg[0](pointer) === 1 && pointer.right) || (arg[0](pointer) === -1 && pointer.left)) {
            if (arg[0](pointer) === 1 && pointer.right) {
                pointer = pointer.right;
            }
            else if (pointer.left) {
                pointer = pointer.left;
            }
        }
        if (arg[0](pointer) === 0) {
            return pointer;
        }
        else {
            return null;
        }
    };
    BST.prototype.getContextActions = function () {
        return ([
            ["bstAction1", function (e) { return console.log("bstAction1"); }],
        ]);
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
