export interface V2Constructor {
  x?: number | string;
  y?: number | string;
  xy?: [number | string, number | string]
  v2?: V2;
  
}

export class V2 {
  public x: number = 0;
  public y: number = 0;

  constructor(first: number, second: number)
  constructor(first: string, second: string)
  constructor(first: [number, number])
  constructor(first: V2)
  constructor(first?: number | string | [number, number] | V2, second?: number | string) {
    if (typeof(first) === "number" && typeof(second) === "number") {
      this.x = first;
      this.y = second;
    } else if (typeof(first) === "string" && typeof(second) === "string") {
      this.x = parseInt(first);
      this.y = parseInt(second);
    } else if (first instanceof Array) {
      this.x = first[0];
      this.y = first[1];
    } else if (first instanceof V2) {
      this.x = first.x;
      this.y = first.y;
    }
  }

  add(first: V2): V2
  add(first: number, second: number): V2
  add(first: V2 | number, second?: number): V2 {
    if (first instanceof V2) {
      console.log('first')
      return new V2(this.x + first.x, this.y + first.y);
    } else if (typeof(second) === "number") {
      console.log('second')
      return new V2(this.x + first, this.y + second);
    } else {
      console.warn("Error adding V2s");
      return new V2(0,0);
    }
  }
}
