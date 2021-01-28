import { Node } from "./Node";
import { V2 } from "./V2";
import { M2 } from "./M2";

export const PHYSICS_SPEED: number = .1;

export const MAX_REPULSIVE_LENGTH: number = 2;
export const MAX_REPULSIVE_FORCE: number = 80;
export const REPULSIVE_COEFF: number = 10;

export const KINETIC_DRAG_COEFF: number = 3;
export const STATIC_DRAG_COEFF: number = 4;

export const BOND_LENGTH: number = 2;
export const BOND_LENGTH_COEFF: number = 30;
export const BOND_LENGTH_POW: number = 2;

export class NodePhysics {
  public node: Node;
  public pos: V2;
  public velo: V2 = new V2(0, 0);
  public accel: V2 = new V2(0, 0);
  public mass: number = 1;
  public anchored: boolean = false;
  public highPriorityRelations: Set<NodePhysics> = new Set();
  public highPriorityRender: boolean = true;

  constructor(node: Node, pos: V2) {
    this.node = node;
    this.pos = pos;
  }

  setRelation(that: NodePhysics, predPath?: M2): void {
    if (!predPath) {
      predPath = new M2(this.pos, this.pos.add(this.velo.scale(2)));
    }
    const predPath2: M2 = new M2(that.pos, that.pos.add(that.velo.scale(2)));
    const isInProx = (): boolean => {
      if (this.node.parent === that.node || that.node.parent === this.node) { return true; }
      if (predPath) {
        const int: V2 = predPath.intersectVector(predPath2);
        if (predPath.inBounds(int) && predPath2.inBounds(int)) {
          return true;
        }
        if (predPath.r0.equals(predPath.r1) && predPath2.r0.equals(predPath2.r1)) {
          if (predPath.r0.add(predPath2.r0.scale(-1)).magnitude() < 3) {
            return true;
          }
        } else if (predPath.r0.equals(predPath.r1)) {
          if (predPath2.pointDistance(predPath.r0) < 3) {
            return true;
          }
        } else if (predPath2.r0.equals(predPath2.r1)) {
          if (predPath.pointDistance(predPath2.r0) < 3) {
            return true;
          }
        } else {
          if (predPath.pointDistance(predPath2.r0) < 3) {
            return true;
          } else if (predPath.pointDistance(predPath2.r1) < 3) {
            return true;
          } else if (predPath2.pointDistance(predPath.r0) < 3) {
            return true;
          } else if (predPath2.pointDistance(predPath.r1) < 3) {
            return true;
          }
        }
      }
      return false;
    }
    if (isInProx()) {
      this.highPriorityRelations.add(that);
      that.highPriorityRelations.add(this);
    } else {
      this.highPriorityRelations.delete(that);
      that.highPriorityRelations.delete(this);
    }
  }

  addForce(that: NodePhysics, nodePhysicsAll: {[index: number]: NodePhysics}): void {
    const dis: number = this.pos.add(that.pos.scale(-1)).magnitude();
    if (dis > MAX_REPULSIVE_LENGTH) { return; }
    const force: number = Math.min(MAX_REPULSIVE_FORCE, REPULSIVE_COEFF*Math.pow(1/dis, 2));
    const thisAccelDiff: number = force / this.mass;
    const thatAccelDiff: number = force / that.mass;
    this.accel = this.accel.add(this.pos.add(that.pos.scale(-1)).unit().scale(thisAccelDiff));
    that.accel = that.accel.add(that.pos.add(this.pos.scale(-1)).unit().scale(thatAccelDiff));

    let parent: NodePhysics | undefined = undefined;
    let child: NodePhysics | undefined = undefined;
    if (this.node.parent === that.node) {
      parent = that;
      child = this;
    } else if (that.node.parent === this.node) {
      parent = this;
      child = that;
    }
    if (parent && child) {
      const currBond: V2 = child.pos.add(parent.pos.scale(-1));
      let anchorBond: V2 = new V2(0, 1);
      if (parent.node.parent && parent.node.parent.id in nodePhysicsAll) {
        anchorBond = parent.pos.add(nodePhysicsAll[parent.node.parent.id].pos.scale(-1));
      }
      let targAngleVert: number = new V2(0, 1).angleBetween(anchorBond);
      if (anchorBond.x < 0) {
        targAngleVert *= -1;
      }
      if (child.node.left === child.node) {
        targAngleVert -= 30;
      } else {
        targAngleVert += 30;
      }
      const bondAngleForce = new V2(currBond.y, -currBond.x).unit().scale(targAngleVert);
      const bondLengthForce = currBond.unit().scale(BOND_LENGTH_COEFF*Math.pow(BOND_LENGTH - currBond.magnitude(), BOND_LENGTH_POW));
      child.accel = child.accel.add(bondAngleForce).add(bondLengthForce);
    }
  }

  addDrag(): void {
    this.accel = this.accel.add(this.velo.scale(-KINETIC_DRAG_COEFF));
    if (this.velo.magnitude() < .01 && this.accel.magnitude() < STATIC_DRAG_COEFF/this.mass) {
      this.accel = new V2(0, 0);
    }
  }

  incrementPhysics(dt: number, screenPos?: V2, screenSize?: V2): void {
    if (!this.anchored) {
      this.velo = this.velo.add(this.accel.scale(dt*PHYSICS_SPEED));
      this.pos = this.pos.add(this.velo.scale(dt*PHYSICS_SPEED));
    }
  }
}