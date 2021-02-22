import Helpers from "./Helpers";
import { M2 } from "./M2";
import { V2 } from "./V2";

export class Tri {
  public p1: V2;
  public p2: V2;
  public p3: V2;

  constructor(m2: M2, p1: V2)
  constructor(p1: V2, p2: V2, p3: V2)
  constructor(...args: any) {
    let p1: V2, p2: V2, p3: V2;
    if (args[0] instanceof M2 && args[1] instanceof V2) {
      p1 = args[1];
      p2 = args[0].r0;
      p3 = args[0].r1;
    } else if (args[0] instanceof V2 && args[1] instanceof V2 && args[2] instanceof V2) {
      p1 = args[0];
      p2 = args[1];
      p3 = args[2];
    } else {
      throw new Error("Error constructing Tri, unhandled parameter types " + Helpers.listTypes(args));
    }
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    if (new M2(p1, p2).collinear(p3)) {
      console.warn("Tri constructed with 3 collinear points");
    }
  }

  pointInTri(p: V2): boolean {
    const sign = (p0: V2, p1: V2, p: V2): number => {
      return (p0.x - p.x) * (p1.y - p.y) - (p1.x - p.x) * (p0.y - p.y);
    }
    const d1: number = sign(p, this.p1, this.p2);
    const d2: number = sign(p, this.p2, this.p3);
    const d3: number = sign(p, this.p3, this.p1);
    const hasNeg: boolean = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos: boolean = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
  }

  pointInTri2(p: V2): boolean {
    const det123: number = Math.abs(new M2(this.p2.add(this.p1.scale(-1)), this.p3.add(this.p1.scale(-1))).det());
    const det12p: number = Math.abs(new M2(this.p2.add(this.p1.scale(-1)), p.add(this.p1.scale(-1))).det());
    const det13p: number = Math.abs(new M2(this.p3.add(this.p1.scale(-1)), p.add(this.p1.scale(-1))).det());
    const det23p: number = Math.abs(new M2(this.p3.add(this.p2.scale(-1)), p.add(this.p2.scale(-1))).det());
    return det12p + det13p + det23p <= det123;
  }

  toString(): string {
    return "Tri[" + this.p1.toString() + "," + this.p2.toString() + "," + this.p3.toString() + "]";
  }
}