import React from "react";
import { Refs as AppRefs } from "../App";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { DSPhysics } from "../models/DSPhysics";
import { M2 } from "../models/M2";
import { NodePhysics } from "../models/NodePhysics";
import { windowRender as render } from "./render";
import * as ENV from "../envVars";

export const initializeClocks = (appRefs: AppRefs, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void): void => {
  hullUpdateClock(appRefs, refs, setRefs);
  prioritiesClock(refs);
  physicsClock(appRefs, refs, setRefs, window.performance.now());
}

export const hullUpdateClock = (appRefs: AppRefs, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => {
  for (const ds of Object.values(refs.dataStructures)) {
    ds.physics.updateHull();
    if (!ENV.HULL_TRIS_VISIBLE && !appRefs.envOverrides["HULL_TRIS_VISIBLE"]) { continue; }
    ds.hullTriRefs = [];
    if (ds.physics.hull.length < 2) { continue; }
    if (!ds.physics.center) { continue; }
    for (let i = 0; i < ds.physics.hull.length; ++i) {
      ds.hullTriRefs.push(React.createRef() as React.MutableRefObject<SVGSVGElement>);
    }
    setRefs(WindowRefsAction.REACT_RENDER);
  }
  setTimeout(() => {
    hullUpdateClock(appRefs, refs, setRefs);
  }, ENV.HULL_UPDATE_CLOCK_MS);
};

export const prioritiesClock = (refs: WindowRefs) => {
  const dsPhysicsArr: DSPhysics[] = Object.values(refs.dataStructures).map(v => v.physics);
  for (let i = 0; i < dsPhysicsArr.length; ++i) {
    for (let j = i+1; j < dsPhysicsArr.length; ++j) {
      dsPhysicsArr[i].setRelation(dsPhysicsArr[j]);
    }
  }
  const nodePhysicsArr: NodePhysics[] = Object.values(refs.nodes).map(v => v.physics);
  for (let i = 0; i < nodePhysicsArr.length; ++i) {
    const predPath: M2 = new M2(nodePhysicsArr[i].pos, nodePhysicsArr[i].pos.add(nodePhysicsArr[i].velo.scale(2)));
    for (let j = i+1; j < nodePhysicsArr.length; ++j) {
      nodePhysicsArr[i].setRelation(nodePhysicsArr[j], predPath);
    }
  }
  setTimeout(() => {
    prioritiesClock(refs);
  }, ENV.PRIORITIES_CLOCK_MS);
};

const physicsClock = (appRefs: AppRefs, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void, lastMiS: number) => {
  const currMiS: number = window.performance.now()
  const dt: number = (currMiS - lastMiS) / 1000;
  if (!ENV.PHYSICS_PAUSED && !appRefs.envOverrides["PHYSICS_PAUSED"]) {
    physicsStep(appRefs, refs, setRefs, dt);
  }
  setTimeout(() => {
    physicsClock(appRefs, refs, setRefs, currMiS);
  }, ENV.PHYSICS_CLOCK_MS);
};

export const physicsStep = (appRefs: AppRefs, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void, dt: number) => {
  if (document.hidden) { return; }
  const nodePhysicsArr: NodePhysics[] = Object.values(refs.nodes).map(v => v.physics);
  for (const nodePhysics of nodePhysicsArr) {
    nodePhysics.resetForces();
  }
  for (let i = 0; i < nodePhysicsArr.length; ++i) {
    for (let j = i+1; j < nodePhysicsArr.length; ++j) {
      nodePhysicsArr[i].addForces(nodePhysicsArr[j]);
    }
  }
  for (let nodePhysics of nodePhysicsArr) {
    nodePhysics.addDrag();
  }
  const dsPhysicsArr: DSPhysics[] = Object.values(refs.dataStructures).map(v => v.physics);
  for (const dsPhysics of dsPhysicsArr) {
    dsPhysics.resetForces();
  }
  for (let i = 0; i < dsPhysicsArr.length; ++i) {
    for (let j = i+1; j < dsPhysicsArr.length; ++j) {
      dsPhysicsArr[i].addForces(dsPhysicsArr[j]);
    }
  }
  for (let dsPhysics of dsPhysicsArr) {
    dsPhysics.addDrag();
  }
  for (let dsPhysics of dsPhysicsArr) {
    dsPhysics.incrementPhysics(dt, appRefs.envOverrides["PHYSICS_SPEED"], appRefs.envOverrides["PRINT_DS_FORCES"]);
  }
  for (let nodePhysics of nodePhysicsArr) {
    nodePhysics.incrementPhysics(dt, appRefs.envOverrides["PHYSICS_SPEED"]);
  }
  render(refs, setRefs, dt);
}