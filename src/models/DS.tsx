import { V2 } from "./V2";

let nextId: number = 0
export class DS {
  public pos: V2;
  public size: V2;
  public isGhost: boolean = true;
  public id: number;
  
  constructor(pos: V2, size: V2) {
    this.pos = pos;
    this.size = size;
    this.id = nextId++;
  }
}

// class Child extends DS {
//   public test: string = "test";
// }

// const a: DS = new Child();