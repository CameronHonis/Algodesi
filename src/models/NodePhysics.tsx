import { Node } from "./Node";
import { V2 } from "./V2";
import { M2 } from "./M2";
import Helpers from "./Helpers";
import { BST } from "./BST";

export const PHYSICS_SPEED: number = 1;
export const MAX_DT: number = .2;
export const MAX_SPEED: number = 10;
export const PRIORITY_RANGE: number = 5;

export const MAX_REPULSIVE_FORCE: number = 80;
export const REPULSIVE_COEFF: number = 10;
export const REPULSIVE_OFFSET: number = -2.5;

export const DRAG_COEFF: number = 3;
export const STATIC_FRIC_COEFF: number = 5;

export const BOND_BASE_LENGTH: number = 2;
export const BOND_LENGTH_COEFF: number = 400;
export const BOND_LENGTH_POW: number = 2;
export const BOND_ANGLE: number = 30;
export const BOND_ANGLE_COEFF: number = 80;

export enum ForceType {
  REPULSIVE,
  DRAG,
  BOND_ANGLE,
  BOND_LENGTH
}

export class NodePhysics {
  public node: Node;
  public pos: V2;
  public velo: V2 = new V2(0, 0);
  public accel: V2 = new V2(0, 0);
  public forces: [V2, ForceType][] = [];
  public mass: number = 1;
  public anchored: boolean = false;
  public highPriorityRelations: Set<NodePhysics> = new Set();
  public highPriorityRender: boolean = true;

  constructor(node: Node, pos: V2) {
    this.node = node;
    this.node.physics = this;
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
          if (predPath.r0.add(predPath2.r0.scale(-1)).magnitude() < PRIORITY_RANGE) {
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

  addForces(that: NodePhysics): void {
    if (this.pos.equals(that.pos)) {
      const angle: number = Math.random()*2*Math.PI;
      this.pos = this.pos.add(new V2(Math.cos(angle)*.01, Math.sin(angle)*.01));
    }
    const addRepulsiveForce = (): void => {
      const dis: number = this.pos.add(that.pos.scale(-1)).magnitude();
      const force: number = Math.max(0,Math.min(REPULSIVE_COEFF*Math.pow(1/dis, 2) + REPULSIVE_OFFSET, MAX_REPULSIVE_FORCE));
      const thisForce: V2 = this.pos.add(that.pos.scale(-1)).unit().scale(force)
      const thatForce: V2 = that.pos.add(this.pos.scale(-1)).unit().scale(force)
      this.forces.push([thisForce, ForceType.REPULSIVE]);
      that.forces.push([thatForce, ForceType.REPULSIVE]);
    }
    addRepulsiveForce();
    const addBondForce = (): void => {
      if (!this.node.ds || this.node.ds !== that.node.ds) { return; }
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
        const bst: BST = parent.node.ds as BST;
        if (!bst.root) { throw new Error(); }
        const maxDepth: number = Math.max(bst.root.leftDepth, bst.root.rightDepth);
        const bondStrength: number = 1 - .25*(parent.node.depth/maxDepth);
        const x: number = .4*Math.pow(2, maxDepth - parent.node.depth) + .2;
        const bondAngle: number = Math.atan(x/2);
        const bondLength: number = Math.sqrt(Math.pow(x, 2) + Math.pow(1.5, 2));
        const currBond: V2 = child.pos.add(parent.pos.scale(-1));
        let anchorAngle: number = 3*Math.PI/2;
        if (parent.node.parent && parent.node.parent.id in bst.nodes) {
          const par2Physics: NodePhysics | null = bst.nodes[parent.node.parent.id].physics;
          if (!par2Physics) { throw new Error(); }
          if (parent.node.parent.left && parent.node.parent.right) {
            const par2LeftPhysics: NodePhysics | null = bst.nodes[parent.node.parent.left.id].physics;
            if (!par2LeftPhysics) { throw new Error(); }
            const par2RightPhysics: NodePhysics | null = bst.nodes[parent.node.parent.right.id].physics;
            if (!par2RightPhysics) { throw new Error(); }
            const par2LeftBond: V2 = par2LeftPhysics.pos.add(par2Physics.pos.scale(-1));
            const par2RightBond: V2 = par2RightPhysics.pos.add(par2Physics.pos.scale(-1));
            anchorAngle = (par2LeftBond.originAngle() + par2RightBond.originAngle())/2;
          } else if (parent.node.parent.left) {
            const par2Bond: V2 = parent.pos.add(par2Physics.pos.scale(-1));
            const par2BondAngle: number = par2Bond.originAngle();
            anchorAngle = par2BondAngle + bondAngle/2;
          } else if (parent.node.parent.right) {
            const par2Bond: V2 = parent.pos.add(par2Physics.pos.scale(-1));
            const par2BondAngle: number = par2Bond.originAngle();
            anchorAngle = par2BondAngle - bondAngle/2;
          }
        }
        let targAngle: number = anchorAngle;
        if (parent.node.left === child.node) {
          targAngle -= bondAngle;
        } else {
          targAngle += bondAngle;
        }
        let angleDiff: number = Helpers.snapAngle(targAngle - currBond.originAngle(), -Math.PI);
        const bondAngleForce: V2 = new V2(currBond.y, -currBond.x).unit().scale(bondStrength*BOND_ANGLE_COEFF*-angleDiff);
        child.forces.push([bondAngleForce, ForceType.BOND_ANGLE]);
        parent.forces.push([bondAngleForce.scale(-1), ForceType.BOND_ANGLE]);
        const bondLengthDiff: number = currBond.magnitude() - bondLength;
        const bondLengthForce: V2 = currBond.unit().scale(bondStrength*BOND_LENGTH_COEFF*Math.sign(bondLengthDiff)*Math.abs(Math.pow(bondLengthDiff, BOND_LENGTH_POW)));
        parent.forces.push([bondLengthForce, ForceType.BOND_LENGTH]);
        child.forces.push([bondLengthForce.scale(-1), ForceType.BOND_LENGTH]);
      }
    }
    addBondForce();
  }

  addDrag(): void {
    if (this.velo.magnitude() < 1) {
      this.forces.push([this.velo.scale(-DRAG_COEFF), ForceType.DRAG]);
    } else {
      this.forces.push([this.velo.pow(2).abs().parallelProduct(this.velo.sign().scale(-DRAG_COEFF)), ForceType.DRAG]);
    }
  }

  resetForces(): void {
    this.forces = [];
  }

  incrementPhysics(dt: number): void {
    dt = Math.min(dt, MAX_DT);
    let netForce: V2 = new V2(0, 0);
    for (const [ force ] of this.forces) {
      netForce = netForce.add(force);
    }
    if (this.anchored || (this.velo.magnitude() < .01 && netForce.magnitude() < STATIC_FRIC_COEFF)) {
      this.accel = new V2(0, 0);
      this.velo = new V2(0, 0);
    } else {
      this.accel = netForce.scale(1/this.mass);
    }
    this.velo = this.velo.add(this.accel.scale(dt*PHYSICS_SPEED));
    if (this.velo.magnitude() > MAX_SPEED) {
      this.velo = this.velo.scale(MAX_SPEED/this.velo.magnitude());
    }
    this.pos = this.pos.add(this.velo.scale(dt*PHYSICS_SPEED));
  }
}