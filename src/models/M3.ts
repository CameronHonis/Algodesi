import Helpers from "./Helpers";
import { M2 } from "./M2";
import { V2 } from "./V2";

export class M3 {
  public m00: number;
  public m01: number;
  public m02: number;
  public m10: number;
  public m11: number;
  public m12: number;
  public m20: number;
  public m21: number;
  public m22: number;
  // m00 m01 m02
  // m10 m11 m12
  // m11 m12 m13
  public rightVector: V2; // <m00, m10>
  public upVector: V2; // <m01, m11>
  public position: V2; // <m02, m12>

  constructor(m2: M2)
  constructor(pos: V2, target: V2)
  constructor(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number,
     m20: number, m21: number, m22: number)
  constructor(...args: any) {
    if (args[0] instanceof M2) {
      this.upVector = args[0].r1.add(args[0].r0.scale(-1)).unit();
      this.position = args[0].r0;
    } else if (args[0] instanceof V2 && args[0] instanceof V2) {
      this.position = args[0];
      this.upVector = args[1].add(args[0].scale(-1)).unit();
    } else if (typeof args[0] === "number" && args.length === 9) {
      this.position = new V2(args[2], args[5]);
      this.upVector = new V2(args[1], args[4]);
    } else {
      throw new Error();
    }
    this.m00 = this.upVector.y;
    this.m10 = -this.upVector.x;
    this.m20 = 0;
    this.m01 = this.upVector.x;
    this.m11 = this.upVector.y;
    this.m21 = 0;
    this.m02 = this.position.x;
    this.m12 = this.position.y;
    this.m22 = 1;
    this.rightVector = new V2(this.m00, this.m10);
  }

  translate(v2: V2): V2 {
    return new V2(
      this.m00*v2.x + this.m01*v2.y + this.m02,
      this.m10*v2.x + this.m11*v2.y + this.m12
    );
  }

  inverse(): M3 {
    return new M3(
      new M2(this.m11, this.m12, this.m21, this.m22).det(),
      new M2(this.m02, this.m01, this.m22, this.m21).det(),
      new M2(this.m01, this.m02, this.m11, this.m12).det(),
      new M2(this.m12, this.m10, this.m22, this.m20).det(),
      new M2(this.m00, this.m02, this.m20, this.m22).det(),
      new M2(this.m02, this.m00, this.m12, this.m10).det(),
      new M2(this.m10, this.m11, this.m20, this.m21).det(),
      new M2(this.m01, this.m00, this.m21, this.m20).det(),
      new M2(this.m00, this.m01, this.m10, this.m11).det()
    );
  }

  toString(compact: boolean = false): string {
    if (compact) {
      return "M3[" + Helpers.round(this.m00) + "," + Helpers.round(this.m01) + "," + Helpers.round(this.m02) + "," 
        + Helpers.round(this.m10) + "," + Helpers.round(this.m11) + "," + Helpers.round(this.m12) + "," 
        + Helpers.round(this.m20) + "," + Helpers.round(this.m21) + "," + Helpers.round(this.m22) + "]";
    } else {
      return "M3[" + Helpers.round(this.m00) + "," + Helpers.round(this.m01) + "," + Helpers.round(this.m02) + "]\n  [" 
        + Helpers.round(this.m10) + "," + Helpers.round(this.m11) + "," + Helpers.round(this.m12) + "]\n  ["
        + this.m20 + "," + this.m21 + "," + this.m22 + "]";
    }
  }
}