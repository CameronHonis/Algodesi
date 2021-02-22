import { Node } from "./Node";

export enum DSType {
  "BST",
}

let nextId: number = 0;

export abstract class DS {
  public readonly id: number;
  public readonly type: DSType;
  public nodes: {[index: number]: Node} = {};
  
  constructor(type: DSType) {
    this.id = nextId++;
    this.type = type;
  }
}