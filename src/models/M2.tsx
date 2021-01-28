import Helpers from "../Helpers";
import { V2 } from "./V2";

export class M2 {
  public m00: number;
  public m01: number;
  public m10: number;
  public m11: number;
  // m00  m01
  // m10  m11
  public r0: V2;
  public r1: V2;

  constructor(r0: V2, r1: V2) 
  constructor(m00: number, m01: number, m10: number, m11: number)
  constructor(r0: V2, angle: number, magnitude: number)
  constructor(...arg: any) {
    if (arg[0] instanceof V2 && arg[1] instanceof V2) {
      this.m00 = arg[0].x;
      this.m01 = arg[0].y;
      this.m10 = arg[1].x;
      this.m11 = arg[1].y;
      this.r0 = arg[0];
      this.r1 = arg[1];
    } else if (arg.length === 4 && typeof arg[3] === "number") {
      this.m00 = arg[0];
      this.m01 = arg[1];
      this.m10 = arg[2];
      this.m11 = arg[3];
      this.r0 = new V2(arg[0], arg[1]);
      this.r1 = new V2(arg[2], arg[3]);
    } else if (arg[0] instanceof V2 && typeof arg[1] === "number" && typeof arg[2] === "number") {
      const r1: V2 = new V2(arg[0].x + Math.cos(arg[1])*arg[2], arg[0].y + Math.sin(arg[1])*arg[2]);
      this.m00 = arg[0].x;
      this.m01 = arg[0].x;
      this.m10 = r1.x;
      this.m11 = r1.y;
      this.r0 = arg[0];
      this.r1 = r1;
    } else {
      throw new Error();
    }
  }

  pointDistance(p: V2, capEnds: boolean = false): number {
    const m2: M2 = new M2(p.x, p.y, p.x + this.m00 - this.m10, p.y + this.m11 - this.m01);
    const int: V2 = this.intersectVector(m2);
    if (capEnds) {
      const lineMag: number = this.r0.add(this.r1.scale(-1)).magnitude();
      if (this.r0.add(int.scale(-1)).magnitude() < lineMag) { // int resides on line
        return p.add(int.scale(-1)).magnitude();
      } else { // int is outside line bounds
        return Math.min(this.r0.add(p.scale(-1)).magnitude(), this.r1.add(p.scale(-1)).magnitude());
      }
    } else {
      return p.add(int.scale(-1)).magnitude();
    }
  }

  intersectVector(m2: M2): V2 {
    const xTopM00: number = this.det();
    const xTopM01: number = new M2(this.m00, 1, this.m10, 1).det();
    const xTopM10: number = m2.det();
    const xTopM11: number = new M2(m2.m00, 1, m2.m10, 1).det();
    const xBotM00: number = xTopM01;
    const xBotM01: number = new M2(this.m01, 1, this.m11, 1).det();
    const xBotM10: number = xTopM11;
    const xBotM11: number = new M2(m2.m01, 1, m2.m11, 1).det();
    const x: number = new M2(xTopM00, xTopM01, xTopM10, xTopM11).det() / new M2(xBotM00, xBotM01, xBotM10, xBotM11).det();
    const y: number = new M2(xTopM00, xBotM01, xTopM10, xBotM11).det() / new M2(xTopM01, xBotM01, xTopM11, xBotM11).det();
    return new V2(x, y);
  }

  det(): number {
    return this.m00 * this.m11 - this.m01 * this.m10;
  }

  inBounds(p: V2): boolean {
    return Math.min(this.m00, this.m10) <= p.x && Math.max(this.m00 && this.m10) >= p.x 
    && Math.min(this.m01, this.m11) >= p.y && Math.max(this.m01, this.m11) <= p.y;
  }

  fitDiv(div: HTMLDivElement, screenPos: V2, screenSize: V2, minThickness: number = 1, maxThickness: number = 10): void {
    const pixR0: V2 = Helpers.toPixelPos(screenPos, screenSize, this.r0);
    const pixR1: V2 = Helpers.toPixelPos(screenPos, screenSize, this.r1);
    const mag: number = pixR1.add(pixR0.scale(-1)).magnitude();
    const angle: number = pixR1.add(pixR0.scale(-1)).originAngle();
    const thick: number = Math.max(minThickness, Math.min(Math.sqrt(mag)*.1, maxThickness));
    div.style.width = mag + "px";
    div.style.height = thick + "px";
    div.style.left = pixR0.x + "px";
    div.style.top = pixR0.y + "px";
    div.style.transform = "matrix(" + Math.cos(angle) + "," + Math.sin(angle) + "," + -Math.sin(angle) + "," + Math.cos(angle) + "," 
      + (Math.cos(angle)-1)*mag/2 + "," + (Math.sin(angle)*mag/2 - thick/2) + ")";
  }

  matrixString(): string {
    const mag: number = this.r1.add(this.r0.scale(-1)).magnitude();
    const angle: number = this.r1.add(this.r0.scale(-1)).originAngle();
    return "matrix(" + Math.cos(angle) + "," + -Math.sin(angle) + "," + Math.sin(angle) + "," + Math.cos(angle) + "," + (Math.cos(angle)-1)*mag/2 + "," + -Math.sin(angle)*mag/2 + ")";
  }
}