import { V2 } from "./V2";
import { Tri } from "./Tri";
import { DS } from "./DS";
import { Node } from "./Node";
import Helpers from "./Helpers";
import { M2 } from "./M2";
import { M3 } from "./M3";
import * as ENV from "../envVars";

export class DSPhysics {
  public ds: DS;
  public velo: V2 = new V2(0, 0);
  public accel: V2 = new V2(0, 0);
  public forces: [V2, ENV.ForceType, DS?][] = [];
  public mass: number = 0;
  public hull: Node[] = [];
  public center?: V2;
  public hullRadius: number = 0;
  public highPriorityRelations: Set<DSPhysics> = new Set();

  constructor(ds: DS)
  constructor(ds: DS, hitbox: V2[])
  constructor(...arg: any) {
    if (arg[0] instanceof DS && !arg[1]) {
      this.ds = arg[0];
    } else if (arg[0] instanceof DS && arg[1] instanceof Array) {
      this.ds = arg[0];
      this.hull = arg[1];
    } else {
      throw new Error();
    }
  }

  inHull(p: V2): [boolean, Tri?] {
    if (this.hull.length < 3) { return [false]; }
    if (!this.center) { return [false]; }
    for (let i = 2; i < this.hull.length; ++i) {
      const tri: Tri = new Tri(this.hull[0].physics!.pos, this.hull[i].physics!.pos, this.hull[i-1].physics!.pos);
      if (tri.pointInTri(p)) {
        return [true, tri];
      }
    }
    return [false];
  }

  hullDistance(p: V2): number {
    if (this.hull.length < 2) { return 100000; }
    let minDis: number = 100000;
    let pointerIdx: number = 1;
    while (pointerIdx < this.hull.length) {
      const line: M2 = new M2(this.hull[pointerIdx-1].physics!.pos, this.hull[pointerIdx].physics!.pos);
      minDis = Math.min(minDis, line.pointDistance(p, true));
    }
    return minDis;
  }

  addToHull(addNode: Node): void {
    if (this.center) {
      const centerAddNodeAngle: number = addNode.physics!.pos.add(this.center.scale(-1)).originAngle();
      const [ insertIdx, ] = Helpers.binarySearch((node: Node) => {
        return centerAddNodeAngle - node.physics!.pos.add(this.center!.scale(-1)).originAngle();
      }, this.hull);
      this.hull.splice(insertIdx, 0, addNode);
      this.center = this.center!.scale((this.hull.length-1)/this.hull.length).add(addNode.physics!.pos.scale(1/this.hull.length));
      let negOuterPerp: Node | undefined = undefined;
      let negOuterPerpAngle: number = 0;
      let posOuterPerp: Node | undefined = undefined;
      let posOuterPerpAngle: number = 0;
      for (let node of this.hull) {
        const addNodeNodeFrame: M3 = new M3(addNode.physics!.pos, this.center);
        const addNodeNodeDiff: V2 = addNodeNodeFrame.inverse().translate(node.physics!.pos.add(addNode.physics!.pos.scale(-1)));
        if (Math.atan2(addNodeNodeDiff.y, -addNodeNodeDiff.x) > negOuterPerpAngle) {
          negOuterPerp = node;
          negOuterPerpAngle = Math.atan2(addNodeNodeDiff.y, -addNodeNodeDiff.x);
        } else if (Math.atan2(addNodeNodeDiff.y, addNodeNodeDiff.x) > posOuterPerpAngle) {
          posOuterPerp = node;
          posOuterPerpAngle = Math.atan2(addNodeNodeDiff.y, addNodeNodeDiff.x);
        }
      }
      if (negOuterPerp && posOuterPerp) {
        const addedTri: Tri = new Tri(addNode.physics!.pos, negOuterPerp.physics!.pos, posOuterPerp.physics!.pos);
        for (let i = 0; i < this.hull.length; ++i) {
          const node: Node = this.hull[i];
          if (node === addNode || node === negOuterPerp || node === posOuterPerp) { continue; }
          if (addedTri.pointInTri(node.physics!.pos)) {
            this.center = this.center!.add(node.physics!.pos.scale(-1/this.hull.length)).scale(this.hull.length/(this.hull.length-1));
            this.hull.splice(i,1);
          }
        }
      }
    } else {
      this.hull.push(addNode);
      this.center = addNode.physics!.pos;
    }
  }


  updateHull(): void {
    this.hull = [];
    this.center = undefined;
    this.hullRadius = 0;
    this.mass = 0;
    const nodes: Node[] = Object.values(this.ds.nodes);
    if (nodes.length === 0) { return; }
    let boundBox: M2 = new M2(nodes[0].physics!.pos, nodes[0].physics!.pos);
    for (let node of Object.values(this.ds.nodes)) {
      boundBox = new M2(
        Math.min(boundBox.m00, node.physics!.pos.x),
        Math.min(boundBox.m01, node.physics!.pos.y),
        Math.max(boundBox.m10, node.physics!.pos.x),
        Math.max(boundBox.m11, node.physics!.pos.y)
      );
    }
    this.center = new V2(boundBox.m00*.5 + boundBox.m10*.5, boundBox.m01*.5 + boundBox.m11*.5);
    for (let node of Object.values(this.ds.nodes)) {
      this.mass += node.physics!.mass;
      const centerNodeAngle: number = node.physics!.pos.add(this.center.scale(-1)).originAngle();
      let [ insertIdx, ] = Helpers.binarySearch(
        (node2: Node) => Math.sign(node2.physics!.pos.add(this.center!.scale(-1)).originAngle() - centerNodeAngle), 
        this.hull
      );
      let toAdd: boolean = true;
      if (this.hull.length >= 3) {
        const lineOne: M2 = new M2(this.center, this.hull[(this.hull.length+insertIdx-1) % this.hull.length].physics!.pos);
        if (!lineOne.collinear(this.hull[insertIdx % this.hull.length].physics!.pos)) {
          const adjTri: Tri = new Tri(lineOne, this.hull[insertIdx % this.hull.length].physics!.pos)
          if (adjTri.pointInTri(node.physics!.pos)) {
            toAdd = false;
          }
        }
      }
      if (this.hull.length > 0) {
        if (Math.abs(this.hull[insertIdx % this.hull.length].physics!.pos.add(this.center.scale(-1)).originAngle() -
        node.physics!.pos.add(this.center.scale(-1)).originAngle()) > 15) {
          toAdd = false;
          if (node.physics!.pos.add(this.center.scale(-1)).magnitude() >
          this.hull[insertIdx % this.hull.length].physics!.pos.add(this.center.scale(-1)).magnitude()) {
            this.hull[insertIdx % this.hull.length] = node;
          }
        }
      }
      if (toAdd) {
        this.hull.splice(insertIdx, 0, node);
        this.hullRadius = Math.max(this.hullRadius, node.physics!.pos.add(this.center.scale(-1)).magnitude());
        if (this.hull.length > 3) {
          const sharedM2: M2 = new M2(this.center, this.hull[insertIdx].physics!.pos);
          if (!sharedM2.collinear(this.hull[(this.hull.length+insertIdx-2) % this.hull.length].physics!.pos)) {
            const lowerBackTri: Tri = new Tri(sharedM2, this.hull[(this.hull.length+insertIdx-2) % this.hull.length].physics!.pos);
            if (lowerBackTri.pointInTri(this.hull[(this.hull.length+insertIdx-1) % this.hull.length].physics!.pos)) {
              this.hull.splice((this.hull.length + insertIdx - 1) % this.hull.length, 1);
              if ((this.hull.length+1+insertIdx-1) % (this.hull.length+1) < insertIdx) {
                insertIdx--;
              }
            }
          }
          if (!sharedM2.collinear(this.hull[(this.hull.length+insertIdx+2) % this.hull.length].physics!.pos)) {
            const upperBackTri: Tri = new Tri(sharedM2, this.hull[(insertIdx+2) % this.hull.length].physics!.pos);
            if (upperBackTri.pointInTri(this.hull[(insertIdx+1) % this.hull.length].physics!.pos)) {
              this.hull.splice((insertIdx+1) % this.hull.length, 1);
            }
          }
        }
      }
      
    }
  }

  setRelation(that: DSPhysics): void {
    const isInProx = (): boolean => {
      if (!this.center) { return false; }
      if (!that.center) { return false; }
      const dis: number = this.center.add(that.center.scale(-1)).magnitude();
      if (this.hullRadius + that.hullRadius + 10 > dis) {
        return true;
      } else {
        return false;
      }
    }
    if (isInProx()) {
      this.highPriorityRelations.add(that);
      that.highPriorityRelations.add(this);
    } else {
      this.highPriorityRelations.delete(that);
      that.highPriorityRelations.delete(this);
    }
  }

  addForces(that: DSPhysics): void {
    if (!this.center || !that.center) { return; }
    let isClipping: boolean = false;
    for (let thisNode of this.hull) {
      if (!thisNode.physics) { continue; }
      const nodeThatCenter: V2 = that.center.add(thisNode.physics.pos.scale(-1));
      if (nodeThatCenter.magnitude() > that.hullRadius) { continue; }
      const hullCollision: [boolean, Tri?] = that.inHull(thisNode.physics.pos);
      if (hullCollision && hullCollision[0] && hullCollision[1]) {
        isClipping = true;
        break;
      }
    }
    for (let thatNode of that.hull) {
      if (!thatNode.physics) { continue; }
      const nodeThisCenter: V2 = this.center.add(thatNode.physics.pos.scale(-1));
      if (nodeThisCenter.magnitude() > this.hullRadius) { continue; }
      const hullCollision: [boolean, Tri?] = this.inHull(thatNode.physics.pos);
      if (hullCollision && hullCollision[0] && hullCollision[1]) {
        isClipping = true;
        break;
      }
    }
    if (isClipping) {
      this.forces.push([this.center.add(that.center.scale(-1)).unit().scale(ENV.DS_MAX_COLLISION_REPULSIVE_FORCE
        *Math.min(this.mass, that.mass)), ENV.ForceType.REPULSIVE, that.ds]);
      that.forces.push([that.center.add(this.center.scale(-1)).unit().scale(ENV.DS_MAX_COLLISION_REPULSIVE_FORCE
        *Math.min(this.mass, that.mass)), ENV.ForceType.REPULSIVE, this.ds]);
      for (let thisNode of Object.values(this.ds.nodes)) {
        if (!thisNode.physics) { continue; }
        const newThisForces: [V2, ENV.ForceType, Node?][] = [];
        for (let force of thisNode.physics.forces) {
          if (!force[2] || force[2].ds !== that.ds) {
            newThisForces.push(force);
          }
        }
        thisNode.physics.forces = newThisForces;
      }
      for (let thatNode of Object.values(that.ds.nodes)) {
        if (!thatNode.physics) { continue; }
        const newThatForces: [V2, ENV.ForceType, Node?][] = [];
        for (let force of thatNode.physics.forces) {
          if (!force[2] || force[2].ds !== this.ds) {
            newThatForces.push(force);
          }
        }
        thatNode.physics.forces = newThatForces;
      }
    }
  }

  addDrag(): void {
    if (this.velo.magnitude() < 1) {
      this.forces.push([this.velo.scale(-ENV.DS_DRAG_COEFF*this.mass), ENV.ForceType.DRAG]);
    } else {
      this.forces.push([this.velo.pow(2).abs().parallelProduct(this.velo.sign().scale(-ENV.DS_DRAG_COEFF*this.mass)), ENV.ForceType.DRAG]);
    }
  }

  resetForces(): void {
    this.forces = [];
  }

  incrementPhysics(dt: number, physicsSpeed: number = ENV.PHYSICS_SPEED, printForces: boolean = ENV.PRINT_DS_FORCES): void {
    dt = Math.min(dt, ENV.MAX_DT);
    let netForce: V2 = new V2(0, 0);
    if (printForces) { console.group("DS" + this.ds.id + " forces:"); }
    for (const force of this.forces) {
      netForce = netForce.add(force[0]);
      if (printForces) {
        console.log(force[0].toString() + "  " + force[1]);
      }
    }
    if (printForces) { console.groupEnd(); }
    if (this.velo.magnitude() < .01 && netForce.magnitude() < ENV.DS_STATIC_FRIC_COEFF) {
      this.accel = new V2(0, 0);
      this.velo = new V2(0, 0);
    } else {
      this.accel = netForce.scale(1/this.mass);
    }
    this.velo = this.velo.add(this.accel.scale(dt*physicsSpeed));
    if (this.velo.magnitude() > ENV.MAX_SPEED) {
      this.velo = this.velo.scale(ENV.MAX_SPEED/this.velo.magnitude());
    }
    for (let node of Object.values(this.ds.nodes)) {
      node.physics!.pos = node.physics!.pos.add(this.velo.scale(dt*physicsSpeed));
    }
  }

  translateNodes(p: V2): void {
    for (const node of Object.values(this.ds.nodes)) {
      if (!node.physics) { continue; }
      node.physics.pos = node.physics.pos.add(p);
    }
    this.updateHull();
  }
}