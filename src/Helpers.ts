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
}