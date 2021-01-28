
let nextId: number = 0
export abstract class DS {
  public readonly id: number;
  public isGhost: boolean = true;
  
  constructor() {
    this.id = nextId++;
  }
}