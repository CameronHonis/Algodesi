import { DS, DSType } from './DS'
import Helpers from './Helpers';
import { Node, NodeChildCategory } from './Node'
import { V2 } from './V2';

export const BST_PRINTS: boolean = false;

export class BST extends DS { // Lesser than goes left, equal or greater goes right
  // iteractables
  public selfBalancing: Boolean = false;
  // change comparison direction
  public root?: Node;
  public anchorPos?: V2;
  public balanced: boolean = true;
  public values: Set<number> = new Set();

  constructor(selfBalancing?: boolean)
  constructor(value: number, selfBalancing?: boolean)
  constructor(node: Node, selfBalancing?: boolean)
  constructor(valueArray: number[], selfBalancing?: boolean)
  constructor(nodeArray: Node[], selfBalancing?: boolean)
  constructor(...args: any) {
    super(DSType.BST);
    if (typeof args[0] === "boolean") {
      this.selfBalancing = args[0];
    } else if (typeof args[0 ] === "number") {
      this.root = new Node(this, args[0]);
      this.values.add(this.root.value);
      this.selfBalancing = args[1] || false;
    } else if (args[0] instanceof Node) {
      this.root = args[0];
      this.root.ds = this;
      this.values.add(this.root.value);
      this.selfBalancing = args[1] || false;
    } else if (args[0] instanceof Array && typeof args[0][0] === "number") {
      this.selfBalancing = args[1] || false;
      const nodes: Node[] = [];
      for (let i = 0; i < args[0].length; i++) {
        nodes.push(new Node(this, args[0][i]));
      }
      this.insert(nodes);
    } else if (args[0] instanceof Array && args[0][0] instanceof Node) {
      this.selfBalancing = args[1] || false;
      this.insert(args[0]);
    } else {
      throw new Error("Error constructing BST, unhandled types: " + Helpers.listTypes(args));
    }
  }

  insert(node: Node, skipBalance?: boolean): boolean
  insert(nodes: (Node | null)[], skipBalance?: boolean): boolean[]
  insert(...args: any): boolean | boolean[] {
    if (BST_PRINTS) {
      if (args[0] instanceof Node) {
        console.log("insert: " + args[0].toString());
      } else {
        console.log("insert: " + args[0].map(v => v ? v.toString() : v));
      }
    }
    const rtn: boolean[] = [];
    const nodes: Node[] = [];
    const unsplitNodes: (Node | null)[] = args[0] instanceof Array ? args[0] : [args[0]];
    let pointer = 0;
    for (let unsplitNode of unsplitNodes) {
      if (!unsplitNode) { 
        if (unsplitNodes.length === 1) {
          return false;
        } else {
          for (let i = 0; i < unsplitNodes.length; ++i) {
            rtn.push(false);
          }
          return rtn;
        }
      }
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
      rtn.push(false);
      if (this.values.has(node.value)) { continue; }
      this.values.add(node.value);
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
      rtn[rtn.length-1] = true;
    }
    if (this.root) {
      const maxDepth: number = Math.max(this.root.rightDepth, this.root.leftDepth);
      for (let node of nodes) {
        if (!node.physics) { continue; }
        let pointer: Node | null = this.root as (Node | null);
        let relXPos: number = .5;
        let depth: number = 0;
        while (pointer && pointer !== node) {
          depth++;
          if (node.value > pointer.value) {
            pointer = pointer.right;
            relXPos += 1/Math.pow(2, depth + 1);
          } else {
            pointer = pointer.left;
            relXPos -= 1/Math.pow(2, depth + 1);
          }
        }
        if (!pointer) { continue; }
        let rootPos: V2 | undefined = node === this.root ? this.anchorPos : this.root.physics?.pos
        if (!rootPos) { continue; }
        node.physics.pos = rootPos.add(new V2((1.75*Math.pow(2, maxDepth) - 1)*(relXPos - .5), -1.75*depth));
      }
    }
    if (BST_PRINTS) { console.log(this.treeString()); }
    if (!args[1] && this.selfBalancing) {
      this.balance();
    }
    if (args[0] instanceof Node) {
      return rtn[0] || false;
    } else {
      return rtn;
    }
  }

  binaryInsert(arr: (Node | null)[]): void {
    if (this.root && this.root.physics) {
      this.anchorPos = this.root.physics.pos;
    }
    const filteredArr: (Node | null)[] = [];
    let lastPushedIdx: number = -1;
    for (let i = 0; i < arr.length; ++i) {
      if (lastPushedIdx < 0 || !arr[i] || arr[i]!.value > arr[lastPushedIdx]!.value) {
        if (arr[i]) {
          lastPushedIdx = i;
        }
        filteredArr.push(arr[i]);
      }
    }
    const toInsert: (Node | null)[] = [];
    this.root = undefined;
    this.values = new Set();
    const idxBoundsQueue: [number, number][] = [[0, filteredArr.length-1]];
    let pointer: number = 0;
    if (BST_PRINTS) { console.log(arr.map(v => v ? v.value : v))}
    while (pointer < idxBoundsQueue.length) {
      const [ low, high ]: [number, number] = idxBoundsQueue[pointer];
      if (low <= high) {
        const mid: number = Math.floor((low + high)/2);
        idxBoundsQueue.push([low, mid-1]);
        idxBoundsQueue.push([mid+1, high]);
        if (filteredArr[mid]) {
          filteredArr[mid]!.removeChild(NodeChildCategory.LEFT);
          filteredArr[mid]!.removeChild(NodeChildCategory.RIGHT);
          filteredArr[mid]!.removeParent();
          toInsert.push(filteredArr[mid]);
        }
      }
      pointer++;
    }
    this.insert(toInsert, true);
    if (BST_PRINTS) { console.log(this.treeString()); }
  }

  removeAll(): void {
    if (this.root) {
      this.root.ds = null;
    }
    this.root = undefined;
    this.values = new Set();
    this.nodes = {};
  }

  remove(node: Node): void {
    if (node.ds !== this || !this.root) {
      console.warn("Attempt to remove " + node.toString() + " from an non-inheriting " + this.toString() + " during BST.remove");
      return;
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
          this.removeAll();
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
          this.removeAll();
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
        this.removeAll();
        this.insert((left || right) as Node);
      }
    } else {
      if (this.root === node) {
        this.removeAll();
      } else {
        node.removeParent();
      }
    }
    if (BST_PRINTS) { console.log(this.treeString()); }
    if (this.selfBalancing) {
      this.balance();
    }
  }

  balance(): void {
    if (!this.root) { return; }
    if (BST_PRINTS) { console.log("balance: " + this.treeString()); }
    const inOrderNodes: Node[] = this.inOrderSearch(() => true, false) as Node[] || [];
    this.binaryInsert(inOrderNodes);
  }

  changeNodeValue(node: Node, value: number): boolean {
    if (this.values.has(value)) { return false; }
    this.remove(node);
    node.value = value;
    this.insert(node);
    return true;
  }

  changeNodeValue2(node: Node, value: number): boolean {
    if (this.values.has(value)) { return false; }
    const inOrderNodes: (Node | null)[] | null = this.inOrderSearch(() => true, false, this.root, true);
    if (!inOrderNodes) { return false; }
    let changeNodeIdx: number = -1;
    for (let i = 0; i < inOrderNodes.length; ++i) {
      if (inOrderNodes[i] === node) {
        changeNodeIdx = i;
        break;
      }
    }
    if (changeNodeIdx === -1) { return false; }
    inOrderNodes[changeNodeIdx]!.value = value;
    let leftPointer: number = changeNodeIdx-1;
    while (leftPointer >= 0) {
      if (!inOrderNodes[leftPointer]) {
        leftPointer--;
      } else {
        if (inOrderNodes[leftPointer]!.value > inOrderNodes[changeNodeIdx]!.value) {
          const swap: Node = inOrderNodes[leftPointer]!;
          inOrderNodes[leftPointer] = inOrderNodes[changeNodeIdx];
          inOrderNodes[changeNodeIdx] = swap;
          changeNodeIdx = leftPointer;
          leftPointer--;
        } else {
          break;
        }
      }
    }
    let rightPointer: number = changeNodeIdx+1;
    while (rightPointer < inOrderNodes.length) {
      if (!inOrderNodes[rightPointer]) {
        rightPointer++;
      } else {
        if (inOrderNodes[rightPointer]!.value < inOrderNodes[changeNodeIdx]!.value) {
          const swap: Node = inOrderNodes[rightPointer]!;
          inOrderNodes[rightPointer] = inOrderNodes[changeNodeIdx];
          inOrderNodes[changeNodeIdx] = swap;
          changeNodeIdx = rightPointer;
          rightPointer++;
        } else {
          break;
        }
      }
    }
    this.binaryInsert(inOrderNodes);
    return true;
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

  inOrderSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true, 
  origin?: Node, includeEmpty: boolean = false): (Node | null)[] | null {
    if (!this.root) { return null; }
    const rtn: (Node | null)[] = [];
    let stack: [Node, number][];
    let stackSet: Set<Node> = new Set();
    if (!origin) {
      stack = [[this.root, 0]];
    } else if (origin.ds === this) {
      stack = [[origin, 0]];
    } else {
      return null;
    }
    const maxDepth: number = Math.max(this.root.leftDepth, this.root.rightDepth);
    while (stack.length) {
      const [ node, depth ] = stack[stack.length-1];
      stackSet.add(node);
      if (node.left && !stackSet.has(node.left)) {
        stack.push([node.left, depth + 1]);
        continue;
      }
      if (includeEmpty && !node.left) {
        let iMax: number = 0;
        for (let i = 0; i < maxDepth - depth; ++i) {
          iMax += Math.pow(2, i);
        }
        for (let i = 0; i < iMax; ++i) {
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
        stack.push([node.right, depth  +1]);
      }
      if (includeEmpty && !node.right) {
        let iMax: number = 0;
        for (let i = 0; i < maxDepth - depth; ++i) {
          iMax += Math.pow(2, i);
        }
        for (let i = 0; i < iMax; ++i) {
          rtn.push(null);
        }
      }
    }
    return rtn;
  }

  binarySearch(callback: (node: Node) => number, origin?: Node): Node | null
  binarySearch(value: number, origin?: Node): Node | null
  binarySearch(...args: any): Node | null {
    if (!this.root) { return null; }
    if (typeof args[0] === "number") {
      args[0] = (node: Node) => Math.sign(args[0] - node.value);
    }
    let pointer: Node = args[1] || this.root;
    while ((args[0](pointer) === 1 && pointer.right) || (args[0](pointer) === -1 && pointer.left)) {
      if (args[0](pointer) === 1 && pointer.right) {
        pointer = pointer.right;
      } else if (pointer.left) {
        pointer = pointer.left
      }
    }
    if (args[0](pointer) === 0) {
      return pointer;
    } else {
      return null;
    }
  }

  setSelfBalancing(value: boolean): void {
    if (!this.selfBalancing && value) {
      this.balance();
    }
    this.selfBalancing = value;
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