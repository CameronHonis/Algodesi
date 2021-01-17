import { DS } from "./DS";

let nextId: number = 0;
export class Node {
  // iteractables vvv
  public ds: DS;
  public value: number;
  public left?: Node;
  public right?: Node;
  public children?: Node[];
  public displayChar: boolean = false;
  // read-onlys vvv
  public id: number;

  constructor(ds: DS, value: number, left?: Node, right?: Node, children?: Node[], displayChar?: boolean)
  constructor(object: {ds: DS, value: number, left?: Node, right?: Node, children?: Node[], displayChar?: boolean})
  constructor(first: any, second?: any, third?: any, fourth?: any, fifth?: any, sixth?: any) {
    if (first instanceof DS) {
      this.ds = first;
      this.value = second;
      this.left = third;
      this.right = fourth;
      this.children = fifth;
      this.displayChar = sixth;
    } else if (typeof(first) === "object") {
      this.ds = first.ds;
      this.value = first.value;
      this.left = first.left;
      this.right = first.right;
      this.children = first.children;
      this.displayChar = first.displayChar;
    } else {
      throw new Error("Unhandled parameter types: " + typeof(first) + (second ? ", " + typeof(second) : "") + (third ? ", " + typeof(third) : "") +
      (fourth ? ", " + typeof(fourth) : "") + (fifth ? ", " + typeof(fifth) : "") + (sixth ? ", " + typeof(sixth) : "") + " for V2.constructor");
    }
    this.id = nextId++;
  }
}