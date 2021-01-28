import { V2 } from "./V2";
import { Tri } from "./Tri";

export class DSPhysics {
  public pos?: V2;
  public hitbox: Tri[] = [];

  constructor()
  constructor(pos: V2)
  constructor(pos: V2, hitbox: Tri[])
  constructor(...arg: any) {
    if (arg[0] instanceof V2 && !arg[1]) {
      this.pos = arg[0];
    } else if (arg[0] instanceof V2 && arg[1] instanceof Array) {
      this.pos = arg[0];
      this.hitbox = arg[1];
    }
  }
}