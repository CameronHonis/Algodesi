import { V2 } from "./V2";

let nextId: number = 0
export abstract class DS {
  public readonly id: number;
  public size: V2 = new V2(1, 1);
  public pos: V2;
  public boxTopLeft: V2;
  public boxBottomRight: V2;
  public isGhost: boolean = true;
  public toRender: boolean = true;
  
  constructor(pos: V2, size?: V2) {
    this.id = nextId++;
    this.pos = pos;
    if (size) {
      this.size = size;
    }
    this.boxTopLeft = pos.add(this.size.scale(-.5));
    this.boxBottomRight = pos.add(this.size.scale(.5));
  }

  // Getters
  getId(): number {
    return this.id;
  }

  getSize(): V2 {
    return this.size;
  }

  getBoxTopLeft(): V2 {
    return this.boxTopLeft;
  }

  getBoxBottomRight(): V2 {
    return this.boxBottomRight;
  }

}