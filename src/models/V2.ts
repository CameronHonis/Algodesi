import Helpers from "./Helpers";

export class V2 {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number, y: number)
  constructor(x: string, y: string)
  constructor(xy: [number, number])
  constructor(xy: [string, string])
  constructor(v2: V2)
  constructor(...arg: any) {
    if (typeof(arg[0]) === "number" && typeof(arg[1]) === "number") {
      this.x = arg[0];
      this.y = arg[1];
    } else if (typeof(arg[0]) === "string" && typeof(arg[1]) === "string") {
      this.x = parseInt(arg[0]);
      this.y = parseInt(arg[1]);
    } else if (arg[0] instanceof Array && typeof(arg[0][0]) === "number" && typeof(arg[0][1]) === "number") {
      this.x = arg[0][0];
      this.y = arg[0][1];
    } else if (arg[0] instanceof Array && typeof(arg[0][0]) === "string" && typeof(arg[0][1]) === "string") {
      this.x = parseInt(arg[0][0]);
      this.y = parseInt(arg[0][1]);
    } else if (arg[0] instanceof V2) {
      this.x = arg[0].x;
      this.y = arg[0].y;
    } else {
      throw new Error("Error constructing V2, Unhandled parameter types: " + Helpers.listTypes(arg));
    }
  }

  add(x: number, y: number): V2
  add(x: string, y: string): V2
  add(xy: [number, number]): V2
  add(xy: [string, string]): V2
  add(v2: V2): V2
  add(...arg: any): V2 {
    if (typeof(arg[0]) === "number" && typeof(arg[1]) === "number") {
      return new V2(this.x + arg[0], this.y + arg[1]);
    } else if (typeof(arg[0]) === "string" && typeof(arg[1]) === "string") {
      return new V2(this.x + parseInt(arg[0]), this.y + parseInt(arg[1]));
    } else if (arg[0] instanceof Array && typeof(arg[0][0]) === "number" && typeof(arg[0][1]) === "number") {
      return new V2(this.x + arg[0][0], this.y + arg[0][1]);
    } else if (arg[0] instanceof Array && typeof(arg[0][0]) === "string" && typeof(arg[0][1]) === "string") {
      return new V2(this.x + parseInt(arg[0][0]), this.y + parseInt(arg[0][1]));
    } else if (arg[0] instanceof V2) {
      return new V2(this.x + arg[0].x, this.y + arg[0].y);
    } else {
      throw new Error("Unhandled parameter types: " + typeof(arg[0]) + (arg[1] ? ", " + typeof(arg[1]) : "") + " for V2.add");
    }
  }

  scale(coeff: number): V2 {
    return new V2(coeff * this.x, coeff * this.y);
  }

  unit(): V2 {
    const coeff: number = 1 / this.magnitude();
    if (coeff === Infinity || coeff === -Infinity) {
      throw new Error("V2.unit cannot calculate unit of vector with magnitude of 0");
    }
    return new V2(coeff * this.x, coeff * this.y);
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
  }

  sign(): V2 {
    return new V2(Math.sign(this.x), Math.sign(this.y));
  }

  abs(): V2 {
    return new V2(Math.abs(this.x), Math.abs(this.y));
  }

  pow(pow: number): V2 {
    return new V2(Math.pow(this.x, pow), Math.pow(this.y, pow));
  }

  originAngle(lowerBound: number = 0): number { // counter-clockwise angle between vector and positive x-axis above the lower bound
    return (Math.atan2(this.y, this.x) + 2*Math.PI) % (2*Math.PI) + lowerBound;
  }

  minOriginAngle(): number { //min angle between vector and positive x-axis
    const originAngle: number = this.originAngle();
    return Math.min(Math.abs(originAngle), Math.abs(originAngle - 2*Math.PI));
  }

  angleBetween(v2: V2) {
    const angleOne: number = this.originAngle();
    const angleTwo: number = v2.originAngle();
    return angleTwo - angleOne;
  }

  minAngleBetween(v2: V2) {
    const angleBetween: number = this.angleBetween(v2);
    return Math.min(Math.abs(angleBetween), Math.abs(angleBetween - 2*Math.PI));
  }

  dot(v2: V2): number
  dot(x: number, y: number): number
  dot(x: string, y: string): number
  dot(xy: [number, number]): number
  dot(xy: [string, string]): number
  dot(...arg: any): number {
    const that: V2 = new V2(arg[0], arg[1]);
    return this.x*that.x + this.y*that.y;
  }

  cross(v2: V2): number
  cross(x: number, y: number): number
  cross(x: string, y: string): number
  cross(xy: [number, number]): number
  cross(xy: [string, string]): number
  cross(...arg: any): number {
    const that: V2 = new V2(arg[0], arg[1]);
    return this.x*that.y - this.y*that.x;
  }

  parallelProduct(v2: V2): V2
  parallelProduct(x: number, y: number): V2
  parallelProduct(x: string, y: string): V2
  parallelProduct(xy: [number, number]): V2
  parallelProduct(xy: [string, string]): V2
  parallelProduct(...arg: any): V2 { // multiplies vector x's and y's as columns. [a,b].parallelProduct([c,d]) => [ac,bd]
    const dotV2: V2 = new V2(arg[0], arg[1]);
    return new V2(this.x * dotV2.x, this.y * dotV2.y);
  }

  tween(target: V2, c0: number, c1: number): [V2, boolean] {
    const diff: V2 = target.add(this.scale(-1));
    let offset: V2 = diff.scale(c0).add(diff.sign().parallelProduct(c1, c1));
    const postOffsetDiff: V2 = target.add(this.add(offset).scale(-1));
    if (Math.sign(postOffsetDiff.x) !== Math.sign(diff.x)) {
      offset = offset.add(postOffsetDiff.x, 0);
    }
    if (Math.sign(postOffsetDiff.y) !== Math.sign(diff.y)) {
      offset = offset.add(0, postOffsetDiff.y);
    }
    return [this.add(offset), this.add(offset).equals(target)];
  }

  equals(v2: V2): boolean
  equals(x: number, y: number): boolean
  equals(x: string, y: string): boolean
  equals(xy: [number, number]): boolean
  equals(xy: [string ,string]): boolean
  equals(...arg: any): boolean {
    const dotV2: V2 = new V2(arg[0], arg[1]);
    return this.x === dotV2.x && this.y === dotV2.y;
  }

  toString(sigFigs: number = 4, sciNotation: boolean = false): string {
    sigFigs = Math.max(sigFigs, 1);
    const coeff: number = Math.pow(10, sigFigs-1);
    const xPow10: number = this.x ? -Math.ceil(Math.log10(Math.abs(1/this.x))) : 0;
    const yPow10: number = this.y ? -Math.ceil(Math.log10(Math.abs(1/this.y))) : 0;
    const xRound: number = Math.round(coeff*Math.pow(10, -xPow10)*this.x)/coeff;
    const yRound: number = Math.round(coeff*Math.pow(10, -yPow10)*this.y)/coeff;
    if (sciNotation) {
      return "V2[" + xRound + (xPow10 ? "E" + xPow10 : "") + ", " + yRound + (yPow10 ? "E" + yPow10 : "") + "]";
    } else {
      const xStrSize: number = Math.max(sigFigs + xPow10 + Math.max(-Math.sign(xRound),0), sigFigs - xPow10 + 1 + Math.max(-Math.sign(xRound),0), sigFigs + 1);
      const yStrSize: number = Math.max(sigFigs + yPow10 + Math.max(-Math.sign(yRound),0), sigFigs - yPow10 + 1 + Math.max(-Math.sign(yRound),0), sigFigs + 1);
      return "V2[" + (xRound*Math.pow(10, xPow10)).toString().slice(0, xStrSize) 
        + ", " + (yRound*Math.pow(10, yPow10)).toString().slice(0, yStrSize) + "]";
    }
  }
}
