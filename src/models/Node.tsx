import { DS } from "./DS";
import Helpers from "../Helpers";
import { BST } from "./BST";

export enum NodeChildCategory {
  LEFT,
  RIGHT,
  GROUP
}

let nextId: number = 0;
export class Node {
  // iteractables vvv
  public ds: DS | null = null;
  public value: number;
  public left: Node | null = null;
  public right: Node | null = null;
  public children: Node[] = [];
  public parent: Node | null = null;
  public displayChar: boolean = false;
  // read-onlys vvv
  public readonly id: number;
  public leftCount: number = 0;
  public rightCount: number = 0;
  public childrenCount: number = 0;

  constructor(ds: DS, value: number, left?: Node, right?: Node, children?: Node[], parent?: Node, displayChar?: boolean)
  constructor(object: {ds: DS, value: number, left?: Node, right?: Node, children?: Node[], displayChar?: boolean})
  constructor(...arg: any) {
    if (arg[0] instanceof DS) {
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

  addChild(childCategory: NodeChildCategory, node: Node): void { //handle node with children attached
    if (childCategory === NodeChildCategory.LEFT) {
      if (this.left) throw new Error("Unable to push node " + node.toString() + ". Left node already exists on " + this.toString() + " for Node.addChild(LEFT)");
      if (node.value >= this.value) throw new Error("Cannot push node of greater/equal value to " + this.toString() + " for Node.addChild(LEFT)");
      if (this.children.length > 0) console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(LEFT)");
      if (node.parent) console.warn("Forced parent override of " + this.toString() + " for Node.addChild(LEFT)");
      node.removeParent();
      node.parent = this;
      node.ds = this.ds;
      this.left = node;
      this.leftCount += node.childrenCount + 1;
      this.childrenCount += node.childrenCount + 1;
      let pointer: Node = this;
      while (pointer.parent) {
        if (pointer.parent.left === pointer) {
          pointer.parent.leftCount += node.childrenCount + 1;
        } else {
          pointer.parent.rightCount += node.childrenCount + 1;
        }
        pointer.parent.childrenCount += node.childrenCount + 1;
        pointer = pointer.parent;
      }
    } else if (childCategory === NodeChildCategory.RIGHT) {
      if (this.right) throw new Error("Unable to push node " + node.id + ". Right node already exists on " + this.toString() + " for Node.addChild(RIGHT)");
      if (node.value < this.value) throw new Error("Cannot push node of lesser value to " + this.toString() + " for Node.addChild(RIGHT)");
      if (this.children.length > 0) console.warn("inconsistent children categories on " + this.toString() + " for Node.addChild(RIGHT)");
      if (node.parent) console.warn("Forced parent override of " + this.toString() + " for Node.addChild(RIGHT)");
      node.removeParent();
      node.parent = this;
      node.ds = this.ds;
      this.right = node;
      this.rightCount += node.childrenCount + 1;
      this.childrenCount += node.childrenCount + 1;
      let pointer: Node = this;
      while (pointer.parent) {
        if (pointer.parent.left === pointer) {
          pointer.parent.leftCount += node.childrenCount + 1;
        } else {
          pointer.parent.rightCount += node.childrenCount + 1;
        }
        pointer.parent.childrenCount += node.childrenCount + 1;
        pointer = pointer.parent;
      }
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
      removeNode.parent = null;
      removeNode.ds = null;
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

  addChildrenCount(adder: number, category?: NodeChildCategory): void { // can be negative
    if (category === NodeChildCategory.LEFT) {
      this.leftCount += adder;
    } else if (category === NodeChildCategory.RIGHT) {
      this.rightCount += adder;
    }
    this.childrenCount += adder;
    if (this.parent) {
      if (this.ds instanceof BST) {
        if (this.parent.left === this) {
          this.parent.addChildrenCount(adder, NodeChildCategory.LEFT);
        } else {
          this.parent.addChildrenCount(adder, NodeChildCategory.RIGHT);
        }
      } else {
        this.parent.addChildrenCount(adder);
      }
    }
  }

  setMinDepth(minDepth: number): void {
    
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
    for (let i = 0; i < arguments.length; ++i) {
      if (!addedFields.has(fields[i])) {
        rtn += (i ? "" : ", ") + fields[i] + ": " + this[fields[i]];
        addedFields.add(fields[i]);
      }
    }
    rtn += ")";
    return rtn;
  }
}