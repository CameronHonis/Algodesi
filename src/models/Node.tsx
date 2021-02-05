import { DS } from "./DS";
import Helpers from "./Helpers";
import { BST } from "./BST";
import { NodePhysics } from "./NodePhysics";

export enum NodeChildCategory {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
  GROUP = "GROUP"
}

let nextId: number = 0;
export class Node {
  // iteractables vvv
  public ds: DS | null = null;
  public physics: NodePhysics | null = null;
  public value: number;
  public left: Node | null = null;
  public right: Node | null = null;
  public children: Node[] = [];
  public parent: Node | null = null;
  public displayChar: boolean = false;
  // read-onlys vvv
  public readonly id: number;
  public depth: number = 0;
  public leftCount: number = 0;
  public leftDepth: number = 0;
  public rightCount: number = 0;
  public rightDepth: number = 0;
  public childrenCount: number = 0;
  public toRender: boolean = true;

  constructor(ds: DS | null, value: number, left?: Node, right?: Node, children?: Node[], parent?: Node, displayChar?: boolean)
  constructor(object: {ds: DS | null, value: number, left?: Node, right?: Node, children?: Node[], displayChar?: boolean})
  constructor(...arg: any) {
    if (arg[0] instanceof DS || !arg[0]) {
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
    } else if (typeof(arg[0]) === "object") {
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
    } else {
      let errorStr: string = "Unhandled parameter types: " + arg[0].constructor.name;
      for (let i = 0; i < arg.length; ++i) {
        errorStr += ", " + arg[i].constructor.name;
      }
      errorStr += " for Node.constructor";
      throw new Error(errorStr);
    }
    this.id = nextId++;
  }

  removeParent(): boolean {
    if (!this.parent) {
      return false;
    }
    if (this.parent.left === this) {
      this.parent.removeChild(NodeChildCategory.LEFT);
    } else if (this.parent.right === this) {
      this.parent.removeChild(NodeChildCategory.RIGHT);
    } else {
      this.parent.removeChild(NodeChildCategory.GROUP, this);
    }
    return true;
  }

  addChild(childCategory: NodeChildCategory, node: Node): void {
    const queue: Node[] = [node];
    let pointer: number = 0
    while (pointer < queue.length) {
      const node2: Node = queue[pointer];
      if (node2.left) {
        queue.push(node2.left);
      }
      if (node2.right) {
        queue.push(node2.right);
      }
      if (childCategory === NodeChildCategory.LEFT && node2.value >= this.value) {
        throw new Error("Unable to add " + node2.toString() + " in " + (this.ds as BST).treeString(node) + 
          " to left of " + this.toString() + " in " + (this.ds as BST).treeString() + " for Node.addChild(LEFT)");
      } else if (childCategory === NodeChildCategory.RIGHT && node2.value < this.value) {
        throw new Error("Unable to add " + node2.toString() + " in " + (this.ds as BST).treeString(node) + 
          " to right of " + this.toString() + " in " + (this.ds as BST).treeString() + " for Node.addChild(RIGHT)");
      }
      pointer++;
    }
    if (childCategory === NodeChildCategory.LEFT) {
      if (this.left) throw new Error("Unable to push " + node.toString() + ". Left node already exists on " + this.toString() + " for Node.addChild");
      if (this.children.length > 0) console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild");
      if (node.parent) console.warn("Forced parent override of " + this.toString() + " for Node.addChild");
      node.removeParent();
      node.parent = this;
      node.updateDS(this.ds);
      node.updateDepth(this.depth + 1);
      this.left = node;
      this.addChildrenCount(node.childrenCount + 1, NodeChildCategory.LEFT);
      this.updateChildrenDepth(NodeChildCategory.LEFT, Math.max(node.leftDepth, node.rightDepth) + 1);
    } else if (childCategory === NodeChildCategory.RIGHT) {
      if (this.right) throw new Error("Unable to push " + node.id + ". Right node already exists on " + this.toString() + " for Node.addChild(RIGHT)");
      if (this.children.length > 0) console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(RIGHT)");
      if (node.parent) console.warn("Forced parent override of " + this.toString() + " for Node.addChild(RIGHT)");
      node.removeParent();
      node.parent = this;
      node.updateDS(this.ds);
      node.updateDepth(this.depth + 1);
      this.right = node;
      this.addChildrenCount(node.childrenCount + 1, NodeChildCategory.RIGHT);
      this.updateChildrenDepth(NodeChildCategory.RIGHT, Math.max(node.leftDepth, node.rightDepth) + 1);
    } else {
      if (this.left || this.right) console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(GROUP)");
      if (node.parent) console.warn("Forced parent override of " + this.toString() + " for Node.addChild(GROUP)");
      node.removeParent();
      node.parent = this;
      node.ds = this.ds;
      this.children.push(node);
      let pointer: Node | null = this;
      while (pointer) {
        pointer.childrenCount += node.childrenCount + 1;
        pointer = pointer.parent;
      }
    }
  }

  removeChild(childCategory: NodeChildCategory, node?: Node): Node | null {
    if (childCategory === NodeChildCategory.LEFT || childCategory === NodeChildCategory.RIGHT) {
      let removeNode: Node;
      if (childCategory === NodeChildCategory.LEFT) {
        if (this.left) {
          removeNode = this.left;
          this.left = null;
        } else {
          return null;
        }
      } else {
        if (this.right) {
          removeNode = this.right;
          this.right = null;
        } else {
          return null;
        }
      }
      this.addChildrenCount(-removeNode.childrenCount - 1, childCategory);
      this.updateChildrenDepth(childCategory, 0);
      removeNode.parent = null;
      removeNode.ds = null;
      removeNode.updateDepth(0);
      return removeNode;
    } else if (childCategory === NodeChildCategory.GROUP && node) {
      const [ idx, match ] = Helpers.binarySearch((v: Node) => Math.sign(node.id - v.id), this.children);
      if (!match) {
        return null;
      }
      this.children[idx].parent = null;
      this.children[idx].ds = null;
      this.children.splice(idx);
      let pointer: Node | null = this;
      while (pointer) {
        pointer.childrenCount -= node.childrenCount + 1;
        pointer = pointer.parent;
      }
      return node;
    } else {
      throw new Error("Unhandled parameter types: " + childCategory + " for Node.removeChild()");
    }
  }

  // chained iterators vvvv
  addChildrenCount(adder: number, category?: NodeChildCategory): void { // can be negative
    if (category === NodeChildCategory.LEFT) {
      this.leftCount += adder;
    } else if (category === NodeChildCategory.RIGHT) {
      this.rightCount += adder;
    }
    this.childrenCount += adder;
    if (this.parent && this.ds instanceof BST) {
      if (this.parent.left === this) {
        this.parent.addChildrenCount(adder, NodeChildCategory.LEFT);
      } else {
        this.parent.addChildrenCount(adder, NodeChildCategory.RIGHT);
      }
    }
  }

  updateDepth(newValue: number): void {
    this.depth = newValue;
    if (this.left) {
      this.left.updateDepth(newValue+1);
    }
    if (this.right) {
      this.right.updateDepth(newValue+1);
    }
  }

  updateChildrenDepth(category: NodeChildCategory, newValue: number): void {
    if (category === NodeChildCategory.LEFT) {
      this.leftDepth = newValue;
    } else {
      this.rightDepth = newValue;
    }
    if (this.parent) {
      if (this.parent.left === this) {
        this.parent.updateChildrenDepth(NodeChildCategory.LEFT, newValue + 1);
      } else {
        this.parent.updateChildrenDepth(NodeChildCategory.RIGHT, newValue + 1);
      }
    }
  }

  updateDS(ds: DS | null): void {
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
  }

  getContextActions(): [string, (e: React.MouseEvent) => void][] {
    return([
      ["nodeTest1", (e: React.MouseEvent) => console.log("nodeTest1")],
    ]);
  }

  compare(node: Node): number {
    if (this.value < node.value) {
      return -1;
    } else if (this.value > node.value) {
      return 1;
    } else {
      return 0;
    }
  }

  toString(fields: Array<keyof Node> = ["id", "value"]): string {
    let rtn: string = "Node("
    const addedFields: Set<string> = new Set();
    for (let i = 0; i < fields.length; ++i) {
      if (!addedFields.has(fields[i])) {
        rtn += (i ? ", " : "") + fields[i] + ": " + this[fields[i]];
        addedFields.add(fields[i]);
      }
    }
    rtn += ")";
    return rtn;
  }
}