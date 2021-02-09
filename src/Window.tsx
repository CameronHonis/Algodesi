import React from "react";
import { AppContext, AppContextType } from "./App"
import { V2 } from "./models/V2";
import { DS, DSType } from "./models/DS";
import { BST } from "./models/BST";
import { Node } from "./models/Node";
import { DSPhysics } from "./models/DSPhysics";
import { ForceType, NodePhysics } from "./models/NodePhysics";
import { M2 } from "./models/M2";
import Helpers from "./models/Helpers";
import { NodeComp, Refs as NodeRefs, NodeRefsAction } from "./components/NodeComp";
import { EdgeComp, Refs as EdgeRefs, EdgeRefsAction } from "./components/EdgeComp";
import { ContextWindow, Refs as ContextWindowRefs, RefsAction as ContextWindowRefsAction } from "./components/ContextWindow";
import SelectionBar from './components/SelectionBar'

type ForceTypeKeys = keyof typeof ForceType;

export const MAX_WINDOW_SIZE: V2 = new V2(200, 100);
export const MIN_WINDOW_SIZE: V2 = new V2(5, 2.5);
export const MAX_INIT_WINDOW_SIZE: V2 = new V2(30, 30);
export const INIT_WINDOW_POS: V2 = new V2(0, 0);

export const POS_TWEEN_COEFF: number = .9;
export const POS_TWEEN_OFFSET: number = .001;
export const SIZE_TWEEN_COEFF: number = .15;
export const SIZE_TWEEN_OFFSET: number = .001;
export const WINDOW_TWEEN_CLOCK_MS: number = 10;

export const PHYSICS_CLOCK_MS: number = 20;

export const PRIORITIES_CLOCK_MS: number = 1000;

//  DEBUGGER vvv
export const NODE_POS_LABELS: boolean = false;
export const NODE_POS_LABELS_WHITELIST: Set<number> = new Set([]);
export const NODE_FORCES_VECTORS: boolean = false;
export const FORCES_VECTORS_WHITELIST: Set<ForceType> = new Set([]);
export const NODE_FORCES_VECTORS_WHITELIST: Set<number> = new Set([]);
export const NODE_FORCES_VECTORS_COLORS: {[key in ForceTypeKeys]: string} = {
  REPULSIVE: "rgba(255,255,0,1)",
  DRAG: "rgba(255,0,0,1)",
  BOND_ANGLE: "rgba(0,255,0,1)",
  BOND_LENGTH: "rgba(0,0,255,1)",
}

const initBST: BST = new BST([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31], true);
// const initBST: BST = new BST([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], true);
// const initBST: BST = new BST([1,2,3,4,5,6,7], true);
const initNodes: Node[] = initBST.inOrderSearch(() => true, false) as Node[] || [];

export interface Refs {
  screen: {
    viewportSize: V2;
    pos: V2;
    size: V2;
    targetPos: V2;
    targetSize: V2;
    isTweeningWindow: boolean;
    posSizeTweenSynced: boolean;
  };
  dataStructures: {
    [index: number]: {
      ds: DS;
      physics: DSPhysics;
    };
  };
  nodes: {
    [index: number]: {
      node: Node;
      physics: NodePhysics;
      comp: React.MutableRefObject<HTMLDivElement>;
      compRefs?: NodeRefs;
      compSetRefs?: (refsAction: NodeRefsAction, ...arg: any) => void;
    }
  };
  ghostNodes: {
    [index: number]: {
      cloneNode: Node;
      comp: React.MutableRefObject<HTMLDivElement>;
    };
  };
  edges: {
    [index: string]: { // index: parentNode.id + "-" + childNode.id
      comp: React.MutableRefObject<HTMLDivElement>;
      compRefs?: EdgeRefs;
      compSetRefs?: (refsAction: NodeRefsAction | EdgeRefsAction, ...arg: any) => void;
    };
  };
  ghostEdges: {
    [index: string]: {
      comp: React.MutableRefObject<HTMLDivElement>;
    };
  };
  interacts: {
    clamped: Node | null;
    selectAnchor: Node | null;
  };
  inputs: {
    mouseDown: boolean;
    mouseDownPos: V2;
    mousePos: V2 | null;
  };
  contextWindowRefs?: ContextWindowRefs;
  contextWindowSetRefs?: (action: ContextWindowRefsAction, arg: any) => void
}

const initWindowSize: V2 = new V2(
  MAX_INIT_WINDOW_SIZE.x * Math.min(window.innerWidth / window.innerHeight, 1),
  MAX_INIT_WINDOW_SIZE.y * Math.min(window.innerHeight / window.innerWidth, 1)
);

export const initRefs: Refs = {
  screen: {
    viewportSize: new V2(window.innerWidth, window.innerHeight),
    pos: INIT_WINDOW_POS,
    size: initWindowSize,
    targetPos: INIT_WINDOW_POS,
    targetSize: initWindowSize,
    isTweeningWindow: false,
    posSizeTweenSynced: true,
  },
  dataStructures: {},
  nodes: {},
  ghostNodes: {},
  edges: {},
  ghostEdges: {},
  interacts: {
    clamped: null,
    selectAnchor: null,
  },
  inputs: {
    mouseDown: false,
    mouseDownPos: new V2(0, 0),
    mousePos: new V2(0,0),
  }
}

export enum RefsAction {
  SET_SIZE,
  SET_SIZE_POS,
  SET_TARGET_POS,
  SET_TARGET_SIZE,
  SET_TWEEN_SYNCED,
  SET_IS_TWEENING_WINDOW,
  SET_VIEWPORT_SIZE,
  SET_CLAMPED,
  SET_SELECT_ANCHOR,
  SET_GHOST,
  SET_MOUSE_DOWN,
  SET_MOUSE_DOWN_POS,
  SET_MOUSE_POS,
}

export interface State {
  rerender: number;
}

export const initState: State = {
  rerender: 0,
}

let initNodeCount: number = 0
for (let node of initNodes) {
  initRefs.nodes[node.id] = {
    node,
    physics: new NodePhysics(node, new V2(initNodeCount - Math.floor(.5*initNodes.length), 0)),
    comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  };
  initNodeCount++;
}

export const Window: React.FC = () => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const [ state, setState ] = React.useState<State>(initState); //eslint-disable-line

  const reactRender = () => {
    setState({rerender: state.rerender + 1});
  }

  const { current: refs } = React.useRef(initRefs);
  const setRefs = (action: RefsAction, arg: any): any => {
    if (action === RefsAction.SET_SIZE && arg instanceof V2) {
      refs.screen.size = arg;
      render();
    } else if (action === RefsAction.SET_SIZE_POS && arg && arg.pos instanceof V2 && arg.size instanceof V2) {
      refs.screen.pos = arg.pos;
      refs.screen.size = arg.size;
      render();
    } else if (action === RefsAction.SET_TARGET_POS && arg instanceof V2) {
      refs.screen.targetPos = arg;
      initWindowTween();
    } else if (action === RefsAction.SET_TARGET_SIZE && arg instanceof V2) {
      refs.screen.targetSize = arg;
      initWindowTween();
    } else if (action === RefsAction.SET_TWEEN_SYNCED && typeof arg === "boolean") {
      refs.screen.posSizeTweenSynced = arg;
    } else if (action === RefsAction.SET_IS_TWEENING_WINDOW && typeof arg === "boolean") {
      refs.screen.isTweeningWindow = arg;
    } else if (action === RefsAction.SET_VIEWPORT_SIZE && arg instanceof V2) {
      if (refs.screen.viewportSize.x === arg.x) {
        const uncappedYSize: number = refs.screen.targetSize.y * arg.y/refs.screen.viewportSize.y;
        const newYSize: number = Math.max(MIN_WINDOW_SIZE.y, Math.min(uncappedYSize, MAX_WINDOW_SIZE.y));
        const ratio: number = refs.screen.targetSize.x / uncappedYSize;
        const newXSize: number = newYSize * ratio;
        setRefs(RefsAction.SET_SIZE, refs.screen.size.parallelProduct(newXSize / refs.screen.targetSize.x, newYSize / refs.screen.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      } else {
        const uncappedXSize: number = refs.screen.targetSize.x * arg.x/refs.screen.viewportSize.x;
        const newXSize: number = Math.max(MIN_WINDOW_SIZE.x, Math.min(uncappedXSize, MAX_WINDOW_SIZE.x));
        const ratio: number = uncappedXSize / refs.screen.targetSize.y;
        const newYSize: number = newXSize / ratio;
        setRefs(RefsAction.SET_SIZE, refs.screen.size.parallelProduct(newXSize / refs.screen.targetSize.x, newYSize / refs.screen.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      }
      refs.screen.viewportSize = arg;

    } else if (action === RefsAction.SET_CLAMPED && (arg instanceof Node || !arg)) {
      refs.interacts.clamped = arg;
    } else if (action === RefsAction.SET_SELECT_ANCHOR && (arg instanceof Node || !arg)) {
      const oldAnchor: Node | null = refs.interacts.selectAnchor;
      refs.interacts.selectAnchor = arg;
      if (arg) {
        if (appRefs.keysDown.has("Control")) {
          if (oldAnchor) {
            for (const { compSetRefs } of Object.values(refs.nodes)) {
              if (compSetRefs) { compSetRefs(NodeRefsAction.SET_SELECTED, false); }
            }
          }
          if (refs.nodes[arg.id].compSetRefs) { refs.nodes[arg.id].compSetRefs!(NodeRefsAction.SET_SELECTED, true); }
        } else if (appRefs.keysDown.has("Shift")) {
          if (oldAnchor) {
            for (const { compSetRefs } of Object.values(refs.nodes)) {
              if (compSetRefs) { compSetRefs(NodeRefsAction.SET_SELECTED, false); }
            }
          }
          if (arg.ds) {
            if (arg.ds.type === DSType.BST) {
              const childNodes: Node[] | null = (arg.ds as BST).inOrderSearch(() => true, false, arg);
              if (childNodes) {
                for (const { id } of childNodes) {
                  if (refs.nodes[id].compSetRefs) { refs.nodes[id].compSetRefs!(NodeRefsAction.SET_SELECTED, true); }
                }
              }
            }
          }
        } else {
          for (const { compSetRefs } of Object.values(refs.nodes)) {
            if (compSetRefs) { compSetRefs(NodeRefsAction.SET_SELECTED, true); }
          }
        }
      } else { // new anchor is null
        if (oldAnchor) {
          for (const { compSetRefs } of Object.values(refs.nodes)) {
            if (compSetRefs) { compSetRefs(NodeRefsAction.SET_SELECTED, false); }
          }
        }
      }
      if (refs.contextWindowSetRefs) {
        refs.contextWindowSetRefs!(ContextWindowRefsAction.UPDATE_ITEMS, arg);
      }
    } else if (action === RefsAction.SET_GHOST && typeof arg === "boolean") {
      if (arg && !Object.values(refs.ghostNodes).length) {
        if (!refs.interacts.clamped) { return; }
        for (const node of Object.values(refs.nodes)) {
          if (!node.compRefs) { continue; }
          if (node.compRefs.interacts.selected || (!refs.interacts.selectAnchor && node.compRefs.interacts.highlighted)) {
            refs.ghostNodes[node.node.id] = {
              cloneNode: node.node,
              comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
            }
          }
        }
        reactRender();
      } else if (!arg && Object.values(refs.ghostNodes).length) {
        refs.ghostNodes = {};
        reactRender();
      }
    } else if (action === RefsAction.SET_MOUSE_DOWN) {
      const down: boolean = arg[0].type === "mousedown";
      const downPos: V2 = new V2(arg[0].clientX, arg[0].clientY);
      const wasClamped: Node | null = refs.interacts.clamped;
      refs.inputs.mouseDown = down;
      if (down) {
        setRefs(RefsAction.SET_CLAMPED, arg[1]);
      } else {
        setRefs(RefsAction.SET_CLAMPED, null);
      }
      if (down) {
        setRefs(RefsAction.SET_MOUSE_DOWN_POS, downPos);
      } else { // mouse up
        if (refs.inputs.mouseDownPos.add(downPos.scale(-1)).magnitude() < 10) {
          if (wasClamped === refs.interacts.selectAnchor) {
            setRefs(RefsAction.SET_SELECT_ANCHOR, null);
          } else if (wasClamped) {
            setRefs(RefsAction.SET_SELECT_ANCHOR, wasClamped);
          } else {
            setRefs(RefsAction.SET_SELECT_ANCHOR, null);
          }
        } else {
          for (const { compSetRefs } of Object.values(refs.nodes)) {
            if (compSetRefs) {
              compSetRefs(NodeRefsAction.UPDATE_HIGHLIGHTED, false);
              break;
            }
          }
        }
        for (const ghostNode of Object.values(refs.ghostNodes)) { //eslint-disable-line
          //remove and reposition
        }
        setRefs(RefsAction.SET_GHOST, false);
      }
      
    } else if (action === RefsAction.SET_MOUSE_DOWN_POS && arg instanceof V2) {
      refs.inputs.mouseDownPos = arg;
    } else if (action === RefsAction.SET_MOUSE_POS) {
      const pos: V2 = new V2(arg.clientX, arg.clientY);
      if (!refs.inputs.mousePos) {
        refs.inputs.mousePos = pos;
        return;
      }
      const posDiffPix: V2 = pos.add(refs.inputs.mousePos.scale(-1));
      refs.inputs.mousePos = pos;
      if (!refs.interacts.clamped && (appRefs.keysDown.has(0) || appRefs.keysDown.has(1) || appRefs.keysDown.has(" "))) {
        setRefs(RefsAction.SET_TWEEN_SYNCED, false);
        setRefs(RefsAction.SET_TARGET_POS, refs.screen.targetPos.add(
          -posDiffPix.x / window.innerWidth * refs.screen.targetSize.x,
          posDiffPix.y / window.innerHeight * refs.screen.targetSize.y
        ))
      } else if (refs.interacts.clamped) {
        if (refs.inputs.mouseDownPos.add(refs.inputs.mousePos.scale(-1)).magnitude() > 50) {
          setRefs(RefsAction.SET_GHOST, true);
        } else {
          setRefs(RefsAction.SET_GHOST, false); 
        }
      }
    }
  }

  React.useEffect(() => { // []
    window.addEventListener("resize", () => {
      if (Math.abs(refs.screen.viewportSize.x - window.innerWidth) > 10 || Math.abs(refs.screen.viewportSize.y - window.innerHeight) > 10) {
        setRefs(RefsAction.SET_VIEWPORT_SIZE, new V2(window.innerWidth, window.innerHeight));
      }
    });
    const prioritiesClock = () => {
      const history: Set<NodePhysics> = new Set();
      for (const { physics: nodePhysics } of Object.values(refs.nodes)) {
        const predPath: M2 = new M2(nodePhysics.pos, nodePhysics.pos.add(nodePhysics.velo.scale(2)));
        history.add(nodePhysics);
        for (const { physics: nodePhysics2 } of Object.values(refs.nodes)) {
          if (!history.has(nodePhysics2)) {
            nodePhysics.setRelation(nodePhysics2, predPath);
          }
        }
      }
      setTimeout(() => {
        prioritiesClock();
      }, PRIORITIES_CLOCK_MS);
    }
    prioritiesClock();
    const physicsClock = (lastMiS: number) => {
      const currMiS: number = window.performance.now()
      const dt: number = (currMiS - lastMiS) / 1000;
      physicsStep(dt);
      setTimeout(() => {
        physicsClock(currMiS);
      }, PHYSICS_CLOCK_MS);
    }
    physicsClock(window.performance.now());
  }, []) //eslint-disable-line

  const physicsStep = (dt: number) => {
    if (document.hidden) { return; }
    let history: Set<NodePhysics> = new Set();
    for (const { physics: nodePhysics } of Object.values(refs.nodes)) {
      nodePhysics.resetForces();
    }
    for (const { physics: nodePhysics } of Object.values(refs.nodes)) {
      history.add(nodePhysics);
      for (const nodePhysics2 of nodePhysics.highPriorityRelations) {
        if (!history.has(nodePhysics2)) {
          nodePhysics.addForces(nodePhysics2);
        }
      }
    }
    for (const { physics } of Object.values(refs.nodes)) {
      physics.addDrag();
    }
    history = new Set();
    for (const { physics } of Object.values(refs.nodes)) {
      physics.incrementPhysics(dt);
    }
    render();
  }

  const render = (): void => {
    const renderNodes = (nodeDiv: HTMLDivElement, nodePixPos: V2, nodePixSize: V2) => {
      const nodeSVG: SVGSVGElement | null = nodeDiv.querySelector("svg");
      const nodeP: HTMLParagraphElement | null = nodeDiv.querySelector(".nodeValue");
      if (!nodeSVG || !nodeP) { return; }
      nodeDiv.style.left = nodePixPos.x + "px";
      nodeDiv.style.top = nodePixPos.y + "px";
      nodeDiv.style.width = nodePixSize.x + "px";
      nodeDiv.style.height = nodePixSize.y + "px";
      nodeP.style.fontSize = window.innerWidth * .65 / refs.screen.size.x + "px";
      nodeP.style.lineHeight = nodePixSize.y + "px";
      nodeP.style.height = nodePixSize.y + "px";
    }
    const renderEdges = (edgeDiv: HTMLDivElement, pos1: V2, pos2: V2) => {
      new M2(pos1, pos2).fitDiv(edgeDiv, refs.screen.pos, refs.screen.size, 
        150/Math.max(refs.screen.size.x,refs.screen.size.y), 150/Math.max(refs.screen.size.x,refs.screen.size.y));
    }
    for (const { node, comp, physics } of Object.values(refs.nodes)) {
      const nodeDiv: HTMLDivElement = comp.current;
      if (!nodeDiv) { continue; }
      const nodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, physics.pos);
      const nodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1, 1));
      renderNodes(nodeDiv, nodePixPos, nodePixSize);
      if (node.left && node.left.id in refs.nodes) {
        const edgeId: string = node.id + "-" + node.left.id;
        if (edgeId in refs.edges && refs.edges[edgeId].comp.current) { 
          renderEdges(refs.edges[edgeId].comp.current, physics.pos, refs.nodes[node.left.id].physics.pos);
        }
      }
      if (node.right && node.right.id in refs.nodes) {
        const edgeId: string = node.id + "-" + node.right.id;
        if (edgeId in refs.edges && refs.edges[edgeId].comp.current) {
          renderEdges(refs.edges[edgeId].comp.current, physics.pos, refs.nodes[node.right.id].physics.pos);
        }
      }
      // annotations vvv
      const renderPosLabels = () => {
        if (!NODE_POS_LABELS) {
          return;
        }
        if (NODE_POS_LABELS_WHITELIST.size && !NODE_POS_LABELS_WHITELIST.has(node.id)) {
          return;
        }
        const posAnno: HTMLParagraphElement | null = document.querySelector("#node" + node.id + "label1");
        if (posAnno) {
          posAnno.style.left = nodePixPos.x + nodePixSize.x/2 + 5 + "px";
          posAnno.style.top = nodePixPos.y - nodePixSize.y/2 + "px";
          posAnno.textContent = "pos: " + physics.pos.toString(3);
        }
      }; renderPosLabels();
      const renderForcesVectors = () => {
        if (!NODE_FORCES_VECTORS) {
          return;
        }
        if (NODE_FORCES_VECTORS_WHITELIST.size && !NODE_FORCES_VECTORS_WHITELIST.has(node.id)) {
          return;
        }
        let lastIdx: number = 0;
        for (let i = 0; i < physics.forces.length; ++i) {
          if (FORCES_VECTORS_WHITELIST.size && !FORCES_VECTORS_WHITELIST.has(physics.forces[i][1])) {
            continue;
          }
          lastIdx = i;
          const forceVector: HTMLDivElement | null = document.querySelector("#node" + node.id + "vector" + i);
          if (forceVector) {
            forceVector.style.backgroundColor = NODE_FORCES_VECTORS_COLORS[ForceType[physics.forces[i][1]] as ForceTypeKeys];
            new M2(physics.pos, physics.pos.add(physics.forces[i][0].scale(.1))).fitDiv(forceVector, refs.screen.pos, refs.screen.size);
          } else { console.warn("ran out of free force vector divs"); }
        }
        for (let i = lastIdx + 1; i < 20; ++i) {
          const forceVector: HTMLDivElement | null = document.querySelector("#node" + node.id + "vector" + i);
          if (forceVector) {
            forceVector.style.backgroundColor = "rgba(0,0,0,0)";
          }
        }
      }
      renderForcesVectors();
    }
    for (const { cloneNode, comp } of Object.values(refs.ghostNodes)) {
      if (!cloneNode.physics) { continue; }
      const ghostNodeDiv: HTMLDivElement = comp.current;
      if (!ghostNodeDiv) { continue; }
      const nodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, cloneNode.physics.pos).add(appRefs.mousePos.add(refs.inputs.mouseDownPos.scale(-1)));
      const nodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1, 1));
      renderNodes(ghostNodeDiv, nodePixPos, nodePixSize);
      if (cloneNode.left && cloneNode.left.id in refs.nodes) {
        const edgeId: string = cloneNode.id + "-" + cloneNode.left.id;
        if (edgeId in refs.ghostEdges && refs.ghostEdges[edgeId].comp.current) {
          const leftNodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, refs.nodes[cloneNode.left.id].physics.pos)
            .add(appRefs.mousePos.add(refs.inputs.mouseDownPos.scale(-1)));
          const screenPos1: V2 = Helpers.toScreenPos(refs.screen.pos, refs.screen.size, nodePixPos);
          const screenPos2: V2 = Helpers.toScreenPos(refs.screen.pos, refs.screen.size, leftNodePixPos);
          renderEdges(
            refs.ghostEdges[edgeId].comp.current, 
            screenPos1.add(screenPos2.add(screenPos1.scale(-1)).unit().scale(.48)), 
            screenPos2.add(screenPos1.add(screenPos2.scale(-1)).unit().scale(.48))
          );
        }
      }
      if (cloneNode.right && cloneNode.right.id in refs.nodes) {
        const edgeId: string = cloneNode.id + "-" + cloneNode.right.id;
        if (edgeId in refs.ghostEdges && refs.ghostEdges[edgeId].comp.current) {
          const rightNodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, refs.nodes[cloneNode.right.id].physics.pos)
            .add(appRefs.mousePos.add(refs.inputs.mouseDownPos.scale(-1)));
          const screenPos1: V2 = Helpers.toScreenPos(refs.screen.pos, refs.screen.size, nodePixPos);
          const screenPos2: V2 = Helpers.toScreenPos(refs.screen.pos, refs.screen.size, rightNodePixPos);
          renderEdges(
            refs.ghostEdges[edgeId].comp.current,
            screenPos1.add(screenPos2.add(screenPos1.scale(-1)).unit().scale(.48)),
            screenPos2.add(screenPos1.add(screenPos2.scale(-1)).unit().scale(.48))
          );
        }
      }
    }
    if (refs.interacts.selectAnchor && refs.contextWindowRefs && refs.contextWindowRefs.ref.current) {
      if (!refs.contextWindowRefs) { return; }
      if (!refs.contextWindowRefs.ref.current) { return; }
      if (!refs.interacts.selectAnchor.physics) { return; }
      const anchorPixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, refs.interacts.selectAnchor.physics.pos);
      const anchorPixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1,1));
      refs.contextWindowRefs.ref.current.style.top = anchorPixPos.y - .5*anchorPixSize.y + "px";
      refs.contextWindowRefs.ref.current.style.left = anchorPixPos.x + .75*anchorPixSize.x + "px";
      refs.contextWindowRefs.ref.current.style.height = anchorPixSize.y * refs.contextWindowRefs.items.length + "px";
      for (const { refs: itemRefs } of Object.values(refs.contextWindowRefs.items)) {
        if (!itemRefs) { continue; }
        if (!itemRefs.ref?.current) { continue; }
        itemRefs.ref.current.style.fontSize = anchorPixSize.y/2 + "px";
        itemRefs.ref.current.style.height = anchorPixSize.y + "px";
        itemRefs.ref.current.style.lineHeight = anchorPixSize.y + "px";
      }
    }
  }

  const initWindowTween = (): void => {
    const windowTween = (): void => {
      setRefs(RefsAction.SET_IS_TWEENING_WINDOW, true);
      let [ newSize, sizeMet ] = refs.screen.size.tween(refs.screen.targetSize, SIZE_TWEEN_COEFF, SIZE_TWEEN_OFFSET*refs.screen.targetSize.x);
      let [ newPos, posMet ] = refs.screen.pos.tween(refs.screen.targetPos, POS_TWEEN_COEFF, POS_TWEEN_OFFSET*refs.screen.targetSize.x);
      if (refs.screen.posSizeTweenSynced) {
        let relSizeDiff: number = 1;
        if (refs.screen.size.add(refs.screen.targetSize.scale(-1)).magnitude() !== 0) {
          relSizeDiff = refs.screen.size.add(newSize.scale(-1)).magnitude() / refs.screen.size.add(refs.screen.targetSize.scale(-1)).magnitude();
        }
        let relPosDiff: number = 1;
        if (refs.screen.pos.add(refs.screen.targetPos.scale(-1)).magnitude() !== 0) {
          relPosDiff = refs.screen.pos.add(newPos.scale(-1)).magnitude() / refs.screen.pos.add(refs.screen.targetPos.scale(-1)).magnitude();
        }
        [ newSize, sizeMet ] = refs.screen.size.tween(refs.screen.targetSize, Math.min(relSizeDiff, relPosDiff, 1), 0);
        [ newPos, posMet ] = refs.screen.pos.tween(refs.screen.targetPos, Math.min(relSizeDiff, relPosDiff, 1), 0);
      }
      setTimeout(() => {
        setRefs(RefsAction.SET_SIZE_POS, {size: newSize, pos: newPos});
        if (sizeMet && posMet) {
          setRefs(RefsAction.SET_IS_TWEENING_WINDOW, false);
          setRefs(RefsAction.SET_TWEEN_SYNCED, true);
          return;
        }
        windowTween();
      }, WINDOW_TWEEN_CLOCK_MS);
    }
    if (!refs.screen.isTweeningWindow) {
      windowTween();
    }
  }

  const mouseWheel = (e: React.WheelEvent) => {
    const deltaSize: V2 = new V2(e.deltaY/1000*refs.screen.targetSize.x, e.deltaY/1000*refs.screen.targetSize.y);
    const mousePos: V2 = refs.screen.targetPos.add(
      refs.screen.targetSize.parallelProduct(.5 - e.clientX/window.innerWidth, e.clientY/window.innerHeight - .5));
    const deltaPos: V2 = mousePos.add(
      refs.screen.targetPos.scale(-1)).parallelProduct(deltaSize.x/refs.screen.targetSize.x, deltaSize.y/refs.screen.targetSize.y);
    let minCoeff: number = 1;
    if (refs.screen.targetSize.x + deltaSize.x > MAX_WINDOW_SIZE.x) {
      minCoeff = Math.min(minCoeff, (MAX_WINDOW_SIZE.x - refs.screen.targetSize.x) / deltaSize.x);
    }
    if (refs.screen.targetSize.x + deltaSize.x < MIN_WINDOW_SIZE.x) {
      minCoeff = Math.min(minCoeff, -(refs.screen.targetSize.x - MIN_WINDOW_SIZE.x) / deltaSize.x);
    }
    if (refs.screen.targetSize.y + deltaSize.y > MAX_WINDOW_SIZE.y) {
      minCoeff = Math.min(minCoeff, (MAX_WINDOW_SIZE.y - refs.screen.targetSize.y) / deltaSize.y);
    }
    if (refs.screen.targetSize.y + deltaSize.y < MIN_WINDOW_SIZE.y) {
      minCoeff = Math.min(minCoeff, -(MIN_WINDOW_SIZE.y - refs.screen.targetSize.y) / deltaSize.y);
    }
    setRefs(RefsAction.SET_TARGET_SIZE, refs.screen.targetSize.add(deltaSize.scale(minCoeff)));
    setRefs(RefsAction.SET_TARGET_POS, refs.screen.targetPos.add(deltaPos.scale(minCoeff)));
  }

  const nodeComps: JSX.Element[] = [];
  const edgeComps: JSX.Element[] = [];
  for (let { node } of Object.values(refs.nodes)) {
    nodeComps.push(<NodeComp key={node.id} node={node} windowRefs={refs} setWindowRefs={setRefs} />);
    if (node.left) {
      if (!(node.id + "-" + node.left.id in refs.edges)) {
        refs.edges[node.id + "-" + node.left.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      edgeComps.push(<EdgeComp key={node.id + "-" + node.left.id} node1={node} node2={node.left} windowRefs={refs} setWindowRefs={setRefs} />);
    }
    if (node.right) {
      if (!(node.id + "-" + node.right.id in refs.edges)) {
        refs.edges[node.id + "-" + node.right.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      edgeComps.push(<EdgeComp key={node.id + "-" + node.right.id} node1={node} node2={node.right} windowRefs={refs} setWindowRefs={setRefs} />);
    }
  }
  const ghostNodeComps: JSX.Element[] = [];
  const ghostEdgeComps: JSX.Element[] = [];
  for (const { cloneNode } of Object.values(refs.ghostNodes)) {
    ghostNodeComps.push(<NodeComp key={cloneNode.id} node={cloneNode} windowRefs={refs} setWindowRefs={setRefs} isGhost={true}/>);
    if (cloneNode.left) {
      if (!(cloneNode.id + "-" + cloneNode.left.id in refs.ghostEdges)) {
        refs.ghostEdges[cloneNode.id + "-" + cloneNode.left.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      ghostEdgeComps.push(<EdgeComp key={cloneNode.id + "-" + cloneNode.left.id} 
        node1={cloneNode} node2={cloneNode.left} windowRefs={refs} setWindowRefs={setRefs} isGhost={true}/>);
    }
    if (cloneNode.right) {
      if (!(cloneNode.id + "-" + cloneNode.right.id in refs.ghostEdges)) {
        refs.ghostEdges[cloneNode.id + "-" + cloneNode.right.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      ghostEdgeComps.push(<EdgeComp key={cloneNode.id + "-" + cloneNode.right.id}
        node1={cloneNode} node2={cloneNode.right} windowRefs={refs} setWindowRefs={setRefs} isGhost={true}/>);
    }
  }

  console.log("window rerender");
  return(
    <div 
      id="window"
      style={{position: "absolute", zIndex: 1000}}
      onMouseDown={e => setRefs(RefsAction.SET_MOUSE_DOWN, [e, null])}
      onMouseMove={e => setRefs(RefsAction.SET_MOUSE_POS, e)}
      onMouseUp={e => setRefs(RefsAction.SET_MOUSE_DOWN, [e, null])}
      onWheel={e => mouseWheel(e)}
    >
      <div id="nodeComps">
        {nodeComps}
      </div>
      <div id="edgeComps">
        {edgeComps}
      </div>
      <div id="ghostNodeComps">
        {ghostNodeComps}
      </div>
      <div id="ghostEdgeComps">
        {ghostEdgeComps}
      </div>
      <SelectionBar/>
      <ContextWindow windowRefs={refs}/>
    </div>
  )
}