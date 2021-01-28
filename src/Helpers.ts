import { V2 } from "./models/V2";
import { RefsAction } from "./Window";

export default class Helpers {
  static binarySearch(callback: (val: any) => number, arr: any[]): [number, boolean]
  static binarySearch(value: number, arr: number[]): [number, boolean]
  static binarySearch(value: string, arr: string[]): [number, boolean]
  static binarySearch(value: boolean, arr: boolean[]): [number, boolean]
  static binarySearch(value: any, arr: any[]): [number, boolean]
  static binarySearch(...arg: any): [idx: number, match: boolean] {
    let arr: any[], comparator: (val: any) => number | undefined;
    if (typeof arg[0] === "function" && arg[1] instanceof Array) {
      comparator = arg[0];
      arr = arg[1];
    } else if ((typeof arg[0] === "number" || typeof arg[0] === "string" || typeof arg[0] === "boolean")
    && arg[1] instanceof Array && typeof arg[0] === typeof arg[1][0]) {
      comparator = (val: number | string | boolean) => {
        if (val < arg[0]) {
          return -1;
        } else if (val > arg[0]) {
          return 1;
        } else {
          return 0;
        }
      }
      arr = arg[1];
    } else if (typeof arg[0]["compare"] === "function" && arg[0].constructor.name === arg[1][0].constructor.name) {
      comparator = arg[0]["compare"];
      arr = arg[1];
    } else {
      let errorStr: string = "Unhandled parameter types: " + arg[0].constructor.name;
      for (let i = 1; i < arg.length; ++i) {
        errorStr += ", " + arg[i].constructor.name;
      }
      errorStr += " for Helpers.binarySearch";
      throw new Error(errorStr);
    }
    if (arr.length === 0) {
      return [0, false];
    }
    let leftPointer: number = 0;
    let rightPointer: number = arr.length - 1;
    let foundMatch: boolean = false;
    while (leftPointer <= rightPointer) {
      const mid: number = Math.floor((leftPointer + rightPointer) / 2);
      if (comparator(arr[mid]) === 1) {
        rightPointer = mid - 1;
      } else if (comparator(arr[mid]) === -1) {
        leftPointer = mid + 1;
      } else {
        rightPointer = mid - 1;
        leftPointer = mid;
        foundMatch = true;
      }
    }
    return [rightPointer + 1, foundMatch];
  }

  static round(num: number, sigFigs: number = 4, sciNotation: boolean = false): string {
    sigFigs = Math.max(sigFigs, 1);
    const coeff: number = Math.pow(10, sigFigs-1);
    const pow10: number = num ? -Math.ceil(Math.log10(Math.abs(1/num))) : 0;
    const rounded: number = Math.round(coeff*Math.pow(10, -pow10)*num)/coeff;
    if (sciNotation) {
      return rounded + (pow10 ? "E" + pow10 : "");
    } else {
      const xStrSize: number = Math.max(
        sigFigs + pow10 + Math.max(-Math.sign(rounded),0),
        sigFigs - pow10 + 1 + Math.max(-Math.sign(rounded),0),
        sigFigs + 1);
      return (rounded*Math.pow(10, pow10)).toString().slice(0, xStrSize);
    }
  }

  static toPixelPos(screenPos: V2, screenSize: V2, pos: V2): V2 { // converts pos from appState dimensions into DOM pix dimension
    return new V2(
      (pos.x - screenPos.x + screenSize.x/2) / screenSize.x * window.innerWidth,
      (1 - (pos.y - screenPos.y + screenSize.y/2) / screenSize.y) * window.innerHeight
    );
  }

  static toScreenPos(screenPos: V2, screenSize: V2, pos: V2): V2 { // converts pos from DOM pix dimensions into appState dimension
    return new V2(
      pos.x / window.innerWidth * screenSize.x - screenSize.x/2 + screenPos.x,
      (1 - pos.y / window.innerHeight) * screenSize.y - screenSize.y/2 + screenPos.y
    );
  }

  static toPixelSize(screenSize: V2, size: V2): V2 { // converts appState dimension to DOM pix dimension
    return new V2(
      size.x / screenSize.x * window.innerWidth,
      size.y / screenSize.y * window.innerHeight
    );
  }

  static toScreenSize(screenSize: V2, size: V2): V2 { // converts DOM pix dimension to appState dimension
    return new V2(
      size.x / window.innerWidth * screenSize.x,
      size.y / window.innerHeight * screenSize.y
    );
  }
}