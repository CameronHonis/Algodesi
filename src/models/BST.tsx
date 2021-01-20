import { DS } from './DS'
import { Node, NodeChildCategory } from './Node'
import { V2 } from './V2'

export class BST extends DS { // Lesser than goes left, equal or greater goes right
  // iteractables
  public selfBalanced: Boolean = false;
  // change comparison direction

  // read-onlys vvv
  public root?: Node;
  public nodeCount: number = 0;
  public maxDepth: number = 0;
  public maxDepthNodes: Node[] = [];
  public minDepth: number = 0;
  public minDepthNodes: Node[] = [];
  public balanced: Boolean = true;

  constructor(pos: V2, value: number)
  constructor(pos: V2, value: number, selfBalanced: boolean)
  constructor(pos: V2, valueArray: number[])
  constructor(pos: V2, valueArray: number[], selfBalanced: boolean)
  constructor(...arg: any) {
    super(arg[0]);
    if (typeof(arg[1]) === "number") {
      this.selfBalanced = arg[2];
      this.root = new Node(this, arg[1]);
    } else if (arg[1] instanceof Array) {
      this.selfBalanced = arg[2];
      for (let i = 0; i < arg[1].length; i++) {
        const newNode: Node = new Node(this, arg[1][i]);
        this.insert(newNode);
      }
    }
  }

  insert(node: Node): void
  insert(nodes: Node[]): void
  insert(...arg: any): void { // handle case of adding to minDepth (set minDepthNodes)
    let nodes: Node[];
    if (arg[0] instanceof Array) {
      nodes = arg[0];
    } else {
      nodes = [arg[0]];
    }
    for (let node of nodes) {
      if (!this.root) {
        this.root = node;
        this.maxDepth = 1;
        this.minDepth = 1;
        this.minDepthNodes = [node];
        this.nodeCount++;
        node.ds = this;
        return;
      }
      let pointer: Node = this.root;
      let depth: number = 0;
      while ((node.value < pointer.value && pointer.left) || (node.value >= pointer.value && pointer.right)) {
        if (node.value < pointer.value && pointer.left) {
          pointer = pointer.left;
        } else if (pointer.right) {
          pointer = pointer.right;
        }
        depth++;
      }
      if (node.value < pointer.value) {
        pointer.addChild(NodeChildCategory.LEFT, node);
      } else {
        pointer.addChild(NodeChildCategory.RIGHT, node);
      }
      if (depth + 1 > this.maxDepth) {
        if (depth + 1 > this.maxDepth + 1) {
          console.warn("Detected fault in maxDepth of " + this.toString() + " during BST.insert");
        }
        this.maxDepth = depth + 1;
        this.maxDepthNodes = [node];
      } else if (depth + 1 === this.maxDepth) {
        this.maxDepthNodes.push(node);
      }
      if (depth + 1 < this.minDepth) {
        console.warn("Detected fault in minDepth of " + this.toString() + " during BST.insert");
        this.minDepth = depth + 1;
        this.minDepthNodes = [node];
      } else if (depth + 1 === this.minDepth) {
        this.minDepthNodes.push(node);
      }
      this.nodeCount++;
    }
  }

  remove(node: Node): void { // handle case of subbing from maxDepth (set maxDepthNodes)
    if (node.ds !== this || !this.root) {
      throw new Error("Attempt to remove " + node.toString() + " from an non-inheriting " + this.toString() + " during BST.remove");
    }
    if (node.left && node.right) {
      let pointer: Node = node.left;
      while (pointer.right) {
        pointer = pointer.right;
      }
      this.swap(node, pointer);
      this.remove(node);
    } else if (node.left || node.right) {
      if (this.root === node) {
        if (node.left) {
          this.root = node.left;
        } else if (node.right) {
          this.root = node.right;
        }
        this.root.removeParent();
      } else if (node.parent) {
        const left: Node | null = node.removeChild(NodeChildCategory.LEFT);
        const right: Node | null = node.removeChild(NodeChildCategory.RIGHT);
        const nodeParent: Node = node.parent;
        if (nodeParent.left === node) {
          nodeParent.removeChild(NodeChildCategory.LEFT);
          if (left) {
            nodeParent.addChild(NodeChildCategory.LEFT, left);
          } else if (right) {
            nodeParent.addChild(NodeChildCategory.LEFT, right);
          }
        } else {
          nodeParent.removeChild(NodeChildCategory.RIGHT);
          if (left) {
            nodeParent.addChild(NodeChildCategory.RIGHT, left);
          } else if (right) {
            nodeParent.addChild(NodeChildCategory.RIGHT, right);
          }
        }
      }
    } else {
      if (this.root === node) {
        this.root = undefined;
        this.minDepth = 0;
        this.maxDepth = 0;
        this.minDepthNodes = [];
        this.maxDepthNodes = [];
        this.nodeCount = 0;
        node.ds = null;
      } else {
        node.removeParent();
      }
    }
  }

  swap(nodeOne: Node, nodeTwo: Node): void {
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
    const leftOne: Node | null = nodeOne.removeChild(NodeChildCategory.LEFT);
    const rightOne: Node | null = nodeOne.removeChild(NodeChildCategory.RIGHT);
    if (parentOne && nodeOneDir) {
      parentOne.removeChild(nodeOneDir);
    }
    const leftTwo: Node | null = nodeTwo.removeChild(NodeChildCategory.LEFT);
    const rightTwo: Node | null = nodeTwo.removeChild(NodeChildCategory.RIGHT);
    if (parentTwo && nodeTwoDir) {
      parentTwo.removeChild(nodeTwoDir);
    }
    if (parentOne && nodeOneDir) {
      parentOne.addChild(nodeOneDir, nodeTwo);
    }
    if (leftOne) {
      nodeTwo.addChild(NodeChildCategory.LEFT, leftOne);
    }
    if (rightOne) {
      nodeTwo.addChild(NodeChildCategory.RIGHT, rightOne);
    }
    if (parentTwo && nodeTwoDir) {
      parentTwo.addChild(nodeTwoDir, nodeOne);
    }
    if (leftTwo) {
      nodeOne.addChild(NodeChildCategory.LEFT, leftTwo);
    }
    if (rightTwo) {
      nodeOne.addChild(NodeChildCategory.RIGHT, rightTwo);
    }
    if (this.root === nodeOne) {
      this.root = nodeTwo;
    } else if (this.root === nodeTwo) {
      this.root = nodeOne;
    }
  }

  // replace(fill: Node, pop: Node): void { // handle min/max depth calcs
  //   if (fill.left || fill.right) {
  //     throw new Error("Unhandled exception filler node has child nodes in " + fill.toString() + " for BST.replace");
  //   }
  //   if (fill.parent) {
  //     if (fill.parent.left === fill) {
  //       fill.parent.removeChild(NodeChildCategory.LEFT);
  //     } else {
  //       fill.parent.removeChild(NodeChildCategory.RIGHT);
  //     }
  //   }
  //   const popParent: Node | null = pop.parent;
  //   let popParentDir: NodeChildCategory | null = null;
  //   if (popParent) {
  //     if (popParent.left === pop) {
  //       popParentDir = NodeChildCategory.LEFT;
  //     } else {
  //       popParentDir = NodeChildCategory.RIGHT;
  //     }
  //   }
  //   if (popParent && popParentDir) {
  //     popParent.removeChild(popParentDir);
  //   }
  //   const popLeft: Node | null = pop.removeChild(NodeChildCategory.LEFT);
  //   const popRight: Node | null = pop.removeChild(NodeChildCategory.RIGHT);
  //   if (popParent && popParentDir) {
  //     popParent.addChild(popParentDir, fill);
  //   }
  //   if (popLeft) {
  //     fill.addChild(NodeChildCategory.LEFT, popLeft);
  //   }
  //   if (popRight) {
  //     fill.addChild(NodeChildCategory.RIGHT, popRight);
  //   }
  // }

  balance(): void {

  }

  updateMinDepth(): void {

  }

  updateMaxDepth(): void {

  }

  flatten(node?: Node): number[] {

    return [];
  }

  // breadthFirstSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true): Node[] | null
  // breadthFirstSearch()
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
    while (pointer < queue.length - 1) {
      const [ node, depth ]: [Node, number] = queue[pointer];
      if (callback(node, depth)) {
        rtn.push(node);
        if (stopAtFirst) {
          return rtn;
        }
      }
      console.log(node.value);
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

  depthFirstSearch(callback: (node: Node, depth: number) => boolean, stopAtFirst: boolean = true): Node[] | null {
    const rtn: Node[] = [];
    if (!this.root) {
      return null;
    }
    let stack: [Node, number][] = [[this.root, 0]];
    while (stack.length) {
      const [ node, depth ] = stack[stack.length-1];
      if (callback(node, depth)) {
        rtn.push(node);
        if (stopAtFirst) {
          return rtn;
        }
      }
      console.log(node.value);
      if (node.right) {
        stack.push([node.right, depth + 1]);
      }
      if (node.left) {
        stack.push([node.left, depth + 1]);
      }
    }
    return rtn;
  }


  toString(fields: Array<keyof BST> = ["id", "root"]) {
    let rtn: string = "BST(";
    const addedFields: Set<string> = new Set();
    if (this.root) {
      rtn += "root: " + this.root.toString();
      addedFields.add("root");
    } else {
      rtn += "id: " + this.id;
      addedFields.add("id");
    }
    if (fields) {
      for (let i = 0; i < fields.length; ++i) {
        if (!addedFields.has(fields[i])) {
          rtn += ", " + fields[i] + ": " + this[fields[i]];
          addedFields.add(fields[i]);
        }
      }
    }
    rtn += ")";
    return rtn;
  }
}

        