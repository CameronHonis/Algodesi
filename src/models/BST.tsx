import { DS, DSType } from './DS'
import { Node, NodeChildCategory } from './Node'

export const BST_PRINTS: boolean = false;

export class BST extends DS { // Lesser than goes left, equal or greater goes right
  // iteractables
  public selfBalancing: Boolean = false;
  // change comparison direction

  // read-onlys vvv
  public root?: Node;
  public balanced: boolean = true;

  constructor(value: number, selfBalancing?: boolean)
  constructor(node: Node, selfBalancing?: boolean)
  constructor(valueArray: number[], selfBalancing?: boolean)
  constructor(...arg: any) {
    super(DSType.BST);
    this.selfBalancing = arg[1] || false;
    if (typeof(arg[0]) === "number") {
      this.root = new Node(this, arg[0]);
    } else if (arg[0] instanceof Node) {
      this.root = arg[0];
      this.root.ds = this;
    } else if (arg[0] instanceof Array) {
      const nodes: Node[] = [];
      for (let i = 0; i < arg[0].length; i++) {
        nodes.push(new Node(this, arg[0][i]));
      }
      this.insert(nodes);
    }
  }

  insert(node: Node): void
  insert(nodes: Node[]): void
  insert(...arg: any): void {
    const nodes: Node[] = [];
    const unsplitNodes: Node[] = arg[0] instanceof Array ? arg[0] : [arg[0]];
    let pointer = 0;
    for (let unsplitNode of unsplitNodes) {
      nodes.push(unsplitNode);
      while (pointer < nodes.length) {
        const node: Node = nodes[pointer];
        if (node.left) {
          nodes.push(node.left);
        }
        if (node.right) {
          nodes.push(node.right);
        }
        node.removeParent();
        node.removeChild(NodeChildCategory.LEFT);
        node.removeChild(NodeChildCategory.RIGHT);
        pointer++;
      }
    }
    for (let node of nodes) {
      if (BST_PRINTS) { console.log("insert: " + node.toString()); }
      if (!this.root) {
        this.root = node;
        this.inOrderSearch((n) => {
          this.nodes[n.id] = n;
          return false;
        })
        node.ds = this;
        continue;
      }
      let pointer: Node = this.root;
      while ((node.value < pointer.value && pointer.left) || (node.value >= pointer.value && pointer.right)) {
        if (node.value < pointer.value && pointer.left) {
          pointer = pointer.left;
        } else if (pointer.right) {
          pointer = pointer.right;
        }
      }
      if (node.value < pointer.value) {
        pointer.addChild(NodeChildCategory.LEFT, node);
      } else {
        pointer.addChild(NodeChildCategory.RIGHT, node);
      }
    }
    if (BST_PRINTS) { console.log(this.treeString()); }
    if (this.selfBalancing) {
      this.balance();
    }
  }

  remove(node: Node): void {
    if (node.ds !== this || !this.root) {
      throw new Error("Attempt to remove " + node.toString() + " from an non-inheriting " + this.toString() + " during BST.remove");
    }
    if (BST_PRINTS) { console.log("remove: " + node.toString()); }
    if (node.left && node.right) {
      if (node.right.left) {
        let pointer: Node = node.right;
        while (pointer.left) {
          pointer = pointer.left;
        }
        const nodePar: Node | null = node.parent;
        let nodeParDir: NodeChildCategory | undefined = undefined;
        if (nodePar) {
          if (nodePar.left === node) {
            nodeParDir = NodeChildCategory.LEFT;
          } else {
            nodeParDir = NodeChildCategory.RIGHT;
          }
          node.removeParent();
        }
        const nodeLeft: Node | null = node.removeChild(NodeChildCategory.LEFT);
        const nodeRight: Node | null = node.removeChild(NodeChildCategory.RIGHT);
        if (!nodeLeft || !nodeRight) { throw new Error(); }
        const pointerPar: Node | null = pointer.parent;
        if (!pointerPar) { throw new Error(); }
        pointer.removeParent();
        const pointerRight: Node | null = pointer.removeChild(NodeChildCategory.RIGHT);
        if (nodePar && nodeParDir) {
          nodePar.addChild(nodeParDir, pointer);
        } else {
          this.root.ds = null;
          this.root = undefined;
          this.insert(pointer);
        }
        pointer.addChild(NodeChildCategory.LEFT, nodeLeft);
        pointer.addChild(NodeChildCategory.RIGHT, nodeRight);
        if (pointerRight) {
          pointerPar.addChild(NodeChildCategory.LEFT, pointerRight);
        }
      } else {
        const nodePar: Node | null = node.parent;
        let nodeParDir: NodeChildCategory | undefined = undefined;
        if (nodePar) {
          if (nodePar.left === node) {
            nodeParDir = NodeChildCategory.LEFT;
          } else {
            nodeParDir = NodeChildCategory.RIGHT;
          }
        }
        const nodeLeft: Node | null = node.removeChild(NodeChildCategory.LEFT);
        const nodeRight: Node | null = node.removeChild(NodeChildCategory.RIGHT);
        if (!nodeLeft || !nodeRight) { throw new Error(); }
        node.removeParent();
        if (nodePar && nodeParDir) {
          nodePar.addChild(nodeParDir, nodeRight);
        } else {
          this.root.ds = null;
          this.root = undefined;
          this.insert(nodeRight);
        }
        nodeRight.addChild(NodeChildCategory.LEFT, nodeLeft);
      }
    } else if (node.left || node.right) {
      const left: Node | null = node.removeChild(NodeChildCategory.LEFT);
      const right: Node | null = node.removeChild(NodeChildCategory.RIGHT);
      if (!((!left && right) || (left && !right))) { throw new Error(); }
      const nodeParent: Node | null = node.parent;
      if (nodeParent) {
        if (nodeParent.left === node) {
          node.removeParent();
          nodeParent.addChild(NodeChildCategory.LEFT, (left || right) as Node);
        } else {
          node.removeParent();
          nodeParent.addChild(NodeChildCategory.RIGHT, (left || right) as Node);
        }
      } else {
        this.root.ds = null;
        this.root = undefined;
        this.nodes = {};
        this.insert((left || right) as Node);
      }
    } else {
      if (this.root === node) {
        this.root = undefined;
        this.nodes = {};
        node.ds = null;
      } else {
        node.removeParent();
      }
    }
    if (BST_PRINTS) { console.log(this.treeString()); }
    if (this.selfBalancing) {
      this.balance();
    }
  }

  swap(nodeOne: Node, nodeTwo: Node): void {
    if (BST_PRINTS) { console.log("swap: " + nodeOne.toString() + ", " + nodeTwo.toString()); }
    if (nodeOne.left && nodeTwo.left) { throw new Error(); }
    const parentOne: Node | null = nodeOne.parent;
    let nodeOneDir: NodeChildCategory | null = null;
    if (parentOne) {
      if (parentOne.left === nodeOne) {
        nodeOneDir = NodeChildCategory.LEFT;
      } else {
        nodeOneDir = NodeChildCategory.RIGHT;
      }
    }
    const parentTwo: Node | null = nodeTwo.parent;
    let nodeTwoDir: NodeChildCategory | null = null;
    if (parentTwo) {
      if (parentTwo.left === nodeTwo) {
        nodeTwoDir = NodeChildCategory.LEFT;
      } else {
        nodeTwoDir = NodeChildCategory.RIGHT;
      }
    }
    nodeOne.removeParent();
    nodeTwo.removeParent();
    const leftOne: Node | null = nodeOne.removeChild(NodeChildCategory.LEFT);
    const rightOne: Node | null = nodeOne.removeChild(NodeChildCategory.RIGHT);
    const leftTwo: Node | null = nodeTwo.removeChild(NodeChildCategory.LEFT);
    const rightTwo: Node | null = nodeTwo.removeChild(NodeChildCategory.RIGHT);
    if (BST_PRINTS) { 
      console.log((parentOne ? parentOne.value + " " + nodeOneDir + " " : "") + nodeOne.value + " "
        + (leftOne ? leftOne.value + " ": "") + (rightOne ? rightOne.value : ""));
      console.log((parentTwo ? parentTwo.value + " " + nodeTwoDir + " ": "") + nodeTwo.value + " " 
        + (leftTwo ? leftTwo.value + " " : "") + (rightTwo ? rightTwo.value : "")); 
    }
    if (parentOne === nodeTwo && nodeOneDir) {
      nodeOne.addChild(nodeOneDir, nodeTwo);
    } else if (parentOne && nodeOneDir) {
      parentOne.addChild(nodeOneDir, nodeTwo);
    } else {
      this.root = nodeTwo;
      this.root.ds = this;
    }
    if (parentTwo === nodeOne && nodeTwoDir) {
      nodeTwo.addChild(nodeTwoDir, nodeOne);
    } else if (parentTwo && nodeTwoDir) {
      parentTwo.addChild(nodeTwoDir, nodeOne);
    } else {
      this.root = nodeOne;
      this.root.ds = this;
    }
    if (leftOne) {
      nodeTwo.addChild(NodeChildCategory.LEFT, leftOne);
    }
    if (rightOne) {
      nodeTwo.addChild(NodeChildCategory.RIGHT, rightOne);
    }
    
    if (leftTwo) {
      nodeOne.addChild(NodeChildCategory.LEFT, leftTwo);
    }
    if (rightTwo) {
      nodeOne.addChild(NodeChildCategory.RIGHT, rightTwo);
    }
    if (BST_PRINTS) { console.log(this.treeString()); }
  }

  balance(): void {
    if (!this.root) { return; }
    const maxDepth: number = Math.floor(Math.log2(Object.values(this.nodes).length)) + 1;
    if (this.root.leftDepth + 1 > maxDepth || this.root.rightDepth + 1 > maxDepth) {
      if (BST_PRINTS) { console.log("balance: " + this.treeString()); }
      const inOrderNodes: Node[] = this.inOrderSearch(() => true, false) || [];
      this.root = undefined;
      const idxBoundsQueue: [number, number][] = [[0, inOrderNodes.length-1]];
      let pointer: number = 0;
      if (BST_PRINTS) { console.log(inOrderNodes.map(v => v.value)); }
      while (pointer < idxBoundsQueue.length) {
        const [ low, high ]: [number, number] = idxBoundsQueue[pointer];
        if (low <= high) {
          const mid: number = Math.floor((low + high)/2);
          idxBoundsQueue.push([low, mid - 1]);
          idxBoundsQueue.push([mid + 1, high]);
          inOrderNodes[mid].removeChild(NodeChildCategory.LEFT);
          inOrderNodes[mid].removeChild(NodeChildCategory.RIGHT);
          inOrderNodes[mid].removeParent();
          this.insert(inOrderNodes[mid]);
        }
        pointer++;
      }
      if (BST_PRINTS) { console.log(this.treeString()); }
    }
  }
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

  flatten(node?: Node): number[] {

    return [];
  }

  breadthFirstSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true, origin?: Node): Node[] | null {
    const rtn: Node[] = [];
    let queue: [Node, number][];
    if (!origin) {
      if (!this.root) {
        return null
      }
      queue = [[this.root, 0]];
    } else if (origin.ds === this) {
      queue = [[origin, 0]];
    } else {
      return null;
    }
    let pointer: number = 0;
    while (pointer < queue.length) {
      const [ node, depth ]: [Node, number] = queue[pointer];
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
  }

  depthFirstSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true, origin?: Node): Node[] | null {
    const rtn: Node[] = [];
    let stack: [Node, number][];
    let stackSet: Set<Node> = new Set();
    if (!origin) {
      if (!this.root) {
        return null;
      }
      stack = [[this.root, 0]];
    } else if (origin.ds === this) {
      stack = [[origin, 0]];
    } else {
      return null;
    }
    while (stack.length) {
      const [ node, depth ] = stack[stack.length-1];
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
  }

  inOrderSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true, origin?: Node): Node[] | null {
    const rtn: Node[] = [];
    let stack: [Node, number][];
    let stackSet: Set<Node> = new Set();
    if (!origin) {
      if (!this.root) {
        return null;
      }
      stack = [[this.root, 0]];
    } else if (origin.ds === this) {
      stack = [[origin, 0]];
    } else {
      return null;
    }
    while (stack.length) {
      const [ node, depth ] = stack[stack.length-1];
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
        stack.push([node.right, depth  +1]);
      }
    }
    return rtn;
  }

  binarySearch(callback: (node: Node) => number, origin?: Node): Node | null
  binarySearch(value: number, origin?: Node): Node | null
  binarySearch(...arg: any): Node | null {
    if (!this.root) { return null; }
    if (typeof arg[0] === "number") {
      arg[0] = (node: Node) => Math.sign(arg[0] - node.value);
    }
    let pointer: Node = arg[1] || this.root;
    while ((arg[0](pointer) === 1 && pointer.right) || (arg[0](pointer) === -1 && pointer.left)) {
      if (arg[0](pointer) === 1 && pointer.right) {
        pointer = pointer.right;
      } else if (pointer.left) {
        pointer = pointer.left
      }
    }
    if (arg[0](pointer) === 0) {
      return pointer;
    } else {
      return null;
    }
  }

  getContextActions(): [string, (e: React.MouseEvent) => void][] {
    return([
      ["bstAction1", (e: React.MouseEvent) => console.log("bstAction1")],
    ]);
  }

  toString(fields: Array<keyof BST> = ["id", "root"]) {
    let rtn: string = "BST(";
    const addedFields: Set<string> = new Set();
    if (fields) {
      for (let i = 0; i < fields.length; ++i) {
        if (!addedFields.has(fields[i])) {
          rtn += (i ? ", " : "") + fields[i] + ": " + this[fields[i]];
          addedFields.add(fields[i]);
        }
      }
    }
    rtn += ")";
    return rtn;
  }

  treeString(root: Node | undefined = this.root): string {
    let rtn: string = "";
    if (root) {
      rtn += "\n";
      const maxDepth: number = Math.max(root.rightDepth, root.leftDepth) + 1;
      const queue: [Node | null, number, number][] = [[root, 1, 1]];
      let pointer: number = 0;
      while (pointer < queue.length) {
        const [ node, depth, lineCount ] = queue[pointer];
        const maxLineCount: number = Math.pow(2, depth - 1);
        const edgeStraddleCount: number = Math.pow(2, maxDepth - depth);
        const edgeSpace: number = maxDepth !== depth ? Math.floor((2*edgeStraddleCount - 1)/2) : 0;
        if (lineCount === 1) {
          rtn += "   ";
          for (let i = 0; i < edgeSpace; ++i) {
            rtn += " ";
          }
        }
        rtn += node ? node.value : ".";
        if (lineCount !== maxLineCount) {
          const totalSpace: number = 2*Math.pow(2, maxDepth - 1) - 1;
          const spacing: number = Math.floor((totalSpace - maxLineCount - 2*edgeSpace) / (maxLineCount - 1));
          for (let i = 0; i < spacing; ++i) {
            rtn += " ";
          }
        } else {
          for (let i = 0; i < maxDepth - 4; ++i) {
            rtn += "\n";
          }
          rtn += "\n";
        }
        if (depth < maxDepth) {
          if (!node || !node.left) {
            queue.push([null, depth + 1, 2*lineCount - 1]);
          } else {
            queue.push([node.left, depth + 1, 2*lineCount - 1]);
          }
          if (!node || !node.right) {
            queue.push([null, depth + 1, 2*lineCount]);
          } else {
            queue.push([node.right, depth + 1, 2*lineCount]);
          }
        }
        pointer++;
      }
      rtn += "\n";
    } else {
      rtn += "empty tree";
    }
    return rtn;
  }
}