import React from "react";
import { AppContext, AppContextType } from "./App"
import { V2 } from "./models/V2";
import { DS, DSType } from "./models/DS";
import { BST } from "./models/BST";
import { Node } from "./models/Node";
import { DSPhysics } from "./models/DSPhysics";
import { NodePhysics } from "./models/NodePhysics";
import { NodeComp, Refs as NodeRefs, NodeRefsAction } from "./components/NodeComp";
import { MainContext, Refs as MainContextRefs, RefsAction as MainContextRefsAction } from "./components/MainContext";
import { Refs as MainContextItemRefs, RefsAction as MainContextItemRefsAction } from "./components/MainContextItem";
import { updateTree } from "./services/UITree";
import { EditNode, Refs as EditNodeRefs, RefsAction as EditNodeRefsAction } from "./components/EditNode";
import { initializeClocks, physicsStep } from "./services/physics";
import { windowRender as render } from "./services/render";
import Helpers from "./models/Helpers";
import { EdgeComp } from "./components/EdgeComp";
import { AddNode, Refs as AddNodeRefs, RefsAction as AddNodeRefsAction } from "./components/AddNode";
//import SelectionBar from './components/SelectionBar'
import * as ENV from "./envVars";

export const MAX_WINDOW_SIZE: V2 = new V2(200, 100);
export const MIN_WINDOW_SIZE: V2 = new V2(5, 2.5);
export const MAX_INIT_WINDOW_SIZE: V2 = new V2(30, 30);
export const INIT_WINDOW_POS: V2 = new V2(0, 0);

export const POS_TWEEN_COEFF: number = .9;
export const POS_TWEEN_OFFSET: number = .001;
export const SIZE_TWEEN_COEFF: number = .15;
export const SIZE_TWEEN_OFFSET: number = .001;
export const WINDOW_TWEEN_CLOCK_MS: number = 10;

const initBST: BST = new BST([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31], true);
// const initBST: BST = new BST([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], true);
// const initBST: BST = new BST([1,2,3,4,5,6,7], true);
const initBSTPhys: DSPhysics = new DSPhysics(initBST);
const initNodes: Node[] = initBST.inOrderSearch(() => true, false) as Node[] || [];

const initBST2: BST = new BST([1,2,3,4,5,6], true);
const initBST2Phys: DSPhysics = new DSPhysics(initBST2);
const initNodes2: Node[] = initBST2.inOrderSearch(() => true, false) as Node[] || [];

export enum UILockMode {
  FREE = "FREE",
  STEP = "STEP",
  NO_FORWARD = "NO_FORWARD",
  NO_BACK = "NO_BACK",
  LOCKED = "LOCKED",
}

export interface Message {
  text: string;
  time: number;
  color: string;
  ref: React.MutableRefObject<HTMLParagraphElement>;
}

export interface Refs {
  screen: {
    viewportSize: V2;
    pos: V2;
    size: V2;
    targetPos: V2;
    targetSize: V2;
    isTweeningWindow: boolean;
    posSizeTweenSynced: boolean;
    locked: boolean;
    lockedTargetPos: V2 | NodePhysics | DSPhysics;
    lockedTargetOffset: V2;
    lockedTargetSize: V2;
  };
  dataStructures: {
    [index: number]: {
      ds: DS;
      physics: DSPhysics;
      hullTriRefs: React.MutableRefObject<SVGSVGElement>[];
    };
  };
  nodes: {
    [index: number]: {
      node: Node;
      physics: NodePhysics;
      comp: React.MutableRefObject<HTMLDivElement>;
      compRefs?: NodeRefs;
      compSetRefs?: (refsAction: NodeRefsAction, ...args: any) => void;
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
    mousePos: V2;
  };
  ui: {
    messages: Message[];
    tree: number[];
    treeLock: UILockMode;
    mainContextRefs?: MainContextRefs;
    mainContextSetRefs?: (action: MainContextRefsAction, ...args: any) => void;
    editNodeRefs?: EditNodeRefs;
    editNodeSetRefs?: (action: EditNodeRefsAction, ...args: any) => void;
    addNodeRefs?: AddNodeRefs;
    addNodeSetRefs?: (action: AddNodeRefsAction, ...args: any) => void;
  }
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
    locked: false,
    lockedTargetPos: new V2(0, 0),
    lockedTargetOffset: new V2(0, 0),
    lockedTargetSize: new V2(0, 0),
  },
  dataStructures: {
    0: {
      ds: initBST,
      physics: initBSTPhys,
      hullTriRefs: [],
    },
    1: {
      ds: initBST2,
      physics: initBST2Phys,
      hullTriRefs: [],
    },
  },
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
  },
  ui: {
    messages: [],
    tree: [],
    treeLock: UILockMode.FREE,
  },
}

export enum RefsAction {
  SET_SIZE = "SET_SIZE",
  SET_SIZE_POS = "SET_SIZE_POS",
  SET_TARGET_POS = "SET_TARGET_POS",
  SET_TARGET_SIZE = "SET_TARGET_SIZE",
  SET_TWEEN_SYNCED = "SET_TWEEN_SYNCED",
  SET_IS_TWEENING_WINDOW = "SET_IS_TWEENING_WINDOW",
  SET_VIEWPORT_SIZE = "SET_VIEWPORT_SIZE",
  SET_LOCKED = "SET_LOCKED",
  SET_LOCKED_POS = "SET_LOCKED_POS",
  SET_LOCKED_SIZE = "SET_LOCKED_SIZE",
  SET_CLAMPED = "SET_CLAMPED",
  SET_SELECT_ANCHOR = "SET_SELECT_ANCHOR",
  SET_GHOST = "SET_GHOST",
  SET_MOUSE_DOWN = "SET_MOUSE_DOWN",
  SET_MOUSE_DOWN_POS = "SET_MOUSE_DOWN_POS",
  SET_MOUSE_POS = "SET_MOUSE_POS",
  SET_UI_TREE = "SET_UI_TREE",
  ADD_MESSAGE = "ADD_MESSAGE",
  REMOVE_MESSAGE = "REMOVE_MESSAGE",
  SET_NODES_VALUE = "SET_NODES_VALUE",
  SET_BST_SELF_BALANCING = "SET_BST_SELF_BALANCING",
  POP_BST = "POP_BST",
  ADD_DS = "ADD_DS",
  ADD_NODE = "ADD_NODE",
  ADD_NODE_TO_DS = "ADD_NODE_TO_DS",
  REACT_RENDER = "REACT_RENDER",
  STEP_PHYSICS = "STEP_PHYSICS"
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

let initNodeCount2: number = 0;
for (let node of initNodes2) {
  initRefs.nodes[node.id] = {
    node,
    physics: new NodePhysics(node, new V2(initNodeCount2 - Math.floor(.5*initNodes.length), 0)),
    comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  }
  initNodeCount2++;
}

export const Window: React.FC = () => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const [ state, setState ] = React.useState<State>(initState); //eslint-disable-line

  const reactRender = () => {
    setState({rerender: state.rerender + 1});
  }

  React.useEffect(() => { // []
    appRefs.windowRefs = refs;
    appRefs.setWindowRefs = setRefs;
    window.addEventListener("resize", () => {
      if (Math.abs(refs.screen.viewportSize.x - window.innerWidth) > 10 || Math.abs(refs.screen.viewportSize.y - window.innerHeight) > 10) {
        setRefs(RefsAction.SET_VIEWPORT_SIZE, new V2(window.innerWidth, window.innerHeight));
      }
    });
    initializeClocks(appRefs, refs, setRefs);
  }, []) //eslint-disable-line

  const { current: refs } = React.useRef(initRefs);
  const setRefs = (action: RefsAction, ...args: any): any => {
    if (action === RefsAction.SET_SIZE && args[0] instanceof V2) {
      refs.screen.size = args[0];
      render(refs, setRefs);
    } else if (action === RefsAction.SET_SIZE_POS && args[0] && args[0].pos instanceof V2 && args[0].size instanceof V2) {
      refs.screen.pos = args[0].pos;
      refs.screen.size = args[0].size;
      render(refs, setRefs);
    } else if (action === RefsAction.SET_TARGET_POS && args[0] instanceof V2) {
      if (refs.screen.locked) { return; }
      refs.screen.targetPos = args[0];
      initWindowTween();
    } else if (action === RefsAction.SET_TARGET_SIZE && args[0] instanceof V2) {
      if (refs.screen.locked) { return; }
      refs.screen.targetSize = args[0];
      initWindowTween();
    } else if (action === RefsAction.SET_TWEEN_SYNCED && typeof args[0] === "boolean") {
      refs.screen.posSizeTweenSynced = args[0];
    } else if (action === RefsAction.SET_IS_TWEENING_WINDOW && typeof args[0] === "boolean") {
      refs.screen.isTweeningWindow = args[0];
    } else if (action === RefsAction.SET_VIEWPORT_SIZE && args[0] instanceof V2) {
      if (refs.screen.viewportSize.x === args[0].x) {
        const uncappedYSize: number = refs.screen.targetSize.y * args[0].y/refs.screen.viewportSize.y;
        const newYSize: number = Math.max(MIN_WINDOW_SIZE.y, Math.min(uncappedYSize, MAX_WINDOW_SIZE.y));
        const ratio: number = refs.screen.targetSize.x / uncappedYSize;
        const newXSize: number = newYSize * ratio;
        setRefs(RefsAction.SET_SIZE, refs.screen.size.parallelProduct(newXSize / refs.screen.targetSize.x, newYSize / refs.screen.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      } else {
        const uncappedXSize: number = refs.screen.targetSize.x * args[0].x/refs.screen.viewportSize.x;
        const newXSize: number = Math.max(MIN_WINDOW_SIZE.x, Math.min(uncappedXSize, MAX_WINDOW_SIZE.x));
        const ratio: number = uncappedXSize / refs.screen.targetSize.y;
        const newYSize: number = newXSize / ratio;
        setRefs(RefsAction.SET_SIZE, refs.screen.size.parallelProduct(newXSize / refs.screen.targetSize.x, newYSize / refs.screen.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      }
      refs.screen.viewportSize = args[0];
    } else if (action === RefsAction.SET_LOCKED && typeof args[0] === "boolean") {
      if (refs.screen.locked === args[0]) { return; }
      refs.screen.locked = args[0];
      initWindowTween();
    } else if (action === RefsAction.SET_LOCKED_POS && (args[0] instanceof V2 || args[0] instanceof NodePhysics || args[0] instanceof DSPhysics) 
    && (!args[1] || args[1] instanceof V2)) {
      refs.screen.lockedTargetPos = args[0];
      if (args[1]) {
        refs.screen.lockedTargetOffset = args[1];
      } else {
        refs.screen.lockedTargetOffset = new V2(0, 0);
      }
      initWindowTween();
    } else if (action === RefsAction.SET_LOCKED_SIZE && args[0] instanceof V2) {
      if (refs.screen.lockedTargetSize.equals(args[0])) { return; }
      refs.screen.lockedTargetSize = args[0];
      initWindowTween();
    } else if (action === RefsAction.SET_CLAMPED && (args[0] instanceof Node || !args[0])) {
      refs.interacts.clamped = args[0];
    } else if (action === RefsAction.SET_SELECT_ANCHOR && (args[0] instanceof Node || !args[0])) {
      const oldAnchor: Node | null = refs.interacts.selectAnchor;
      refs.interacts.selectAnchor = args[0];
      if (oldAnchor) {
        for (const { compSetRefs } of Object.values(refs.nodes)) {
          if (compSetRefs) { 
            compSetRefs(NodeRefsAction.SET_SELECTED, false); 
          }
        }
      }
      if (args[0]) {
        if (appRefs.keysDown.has("Control")) {
          if (refs.nodes[args[0].id].compSetRefs) { 
            refs.nodes[args[0].id].compSetRefs!(NodeRefsAction.SET_SELECTED, true); 
          }
        } else if (appRefs.keysDown.has("Shift")) {
          if (args[0].ds) {
            if (args[0].ds.type === DSType.BST) {
              const childNodes: Node[] | null = (args[0].ds as BST).inOrderSearch(() => true, false, args[0]) as Node[];
              if (childNodes) {
                for (const { id } of childNodes) {
                  if (refs.nodes[id].compSetRefs) { 
                    refs.nodes[id].compSetRefs!(NodeRefsAction.SET_SELECTED, true); 
                  }
                }
              }
            }
          } else if (args[0].id in refs.nodes && refs.nodes[args[0].id].compSetRefs) {
            refs.nodes[args[0].id].compSetRefs!(NodeRefsAction.SET_SELECTED, true);
          }
        } else {
          for (const { node, compSetRefs } of Object.values(refs.nodes)) {
            if ((args[0] === node || (args[0].ds && node.ds === args[0].ds)) && compSetRefs) { 
              compSetRefs(NodeRefsAction.SET_SELECTED, true); 
            }
          }
        }
      }
      if (args[0]) {
        setRefs(RefsAction.SET_UI_TREE, [0]);
      } else {
        setRefs(RefsAction.SET_UI_TREE, []);
      }
    } else if (action === RefsAction.SET_GHOST && typeof args[0] === "boolean") {
      if (args[0] && !Object.values(refs.ghostNodes).length) {
        if (!refs.interacts.clamped) { return; }
        if (!(refs.interacts.clamped.id in refs.nodes)) { return; }
        if (refs.interacts.selectAnchor && (!refs.nodes[refs.interacts.clamped.id].compRefs 
          || !refs.nodes[refs.interacts.clamped.id].compRefs!.interacts.selected)){ return; }
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
      } else if (!args[0] && Object.values(refs.ghostNodes).length) {
        refs.ghostNodes = {};
        reactRender();
      }
    } else if (action === RefsAction.SET_MOUSE_DOWN && args[0].constructor.name === "SyntheticBaseEvent" 
    && (!args[1] || args[1] instanceof Node)) {
      const isDown: boolean = args[0].type === "mousedown";
      const isMiddleButton: boolean = args[0].button === 1;
      const downPos: V2 = new V2(args[0].clientX, args[0].clientY);
      const wasClamped: Node | null = refs.interacts.clamped;
      refs.inputs.mouseDown = isDown;
      if (isDown && !isMiddleButton) {
        setRefs(RefsAction.SET_CLAMPED, args[1]);
      } else {
        setRefs(RefsAction.SET_CLAMPED, null);
      }
      if (isDown) {
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
        if (Object.values(refs.ghostNodes).length) {
          const screenPosDiff: V2 = Helpers.toScreenSize(refs.screen.size, downPos.add(refs.inputs.mouseDownPos.scale(-1)));
          if (args[1] && wasClamped && wasClamped.id in refs.nodes && refs.nodes[wasClamped.id].compRefs && args[1].ds !== wasClamped.ds) {
            let oldDS: DS | null = wasClamped.ds;
            if (wasClamped.ds && wasClamped.ds.type === DSType.BST) {
              const bst: BST = wasClamped.ds as BST;
              const bfsNodes: Node[] = bst.breadthFirstSearch(() => true, false) || [];
              for (let i = bfsNodes.length-1; i >= 0; --i) { //reverse bfs order to optimize removes
                if (bfsNodes[i].id in refs.ghostNodes) {
                  bst.remove(bfsNodes[i]);
                }
              }
            }
            if (args[1].ds.type === DSType.BST) {
              const bst: BST = args[1].ds as BST;
              for (const { cloneNode } of Object.values(refs.ghostNodes)) {
                const res: boolean = bst.insert(cloneNode);
                if (!res && oldDS) {
                  if (oldDS.type === DSType.BST) {
                    (oldDS as BST).insert(cloneNode);
                  }
                }
              }
            }
            reactRender();
          } else {
            let oldDS: DS | undefined;
            const targetPoss: {[index: number]: V2} = {};
            for (const { cloneNode } of Object.values(refs.ghostNodes)) {
              if (!cloneNode.physics) { continue; }
              targetPoss[cloneNode.id] = cloneNode.physics.pos.add(screenPosDiff);
            }
            const checkPop = (): void => {
              if (refs.interacts.selectAnchor && refs.interacts.selectAnchor.ds) {
                if (refs.interacts.selectAnchor.ds.type === DSType.BST) {
                  const bst: BST = refs.interacts.selectAnchor.ds as BST;
                  if (!bst.root) { return; }
                  if (!(bst.root.id in refs.ghostNodes)) {
                    oldDS = refs.interacts.selectAnchor.ds;
                    setRefs(RefsAction.POP_BST, refs.interacts.selectAnchor);
                  }
                }
              } else if (wasClamped && wasClamped.ds) {
                if (wasClamped.ds.type === DSType.BST) {
                  const bst: BST = wasClamped.ds as BST;
                  if (!bst.root) { return; }
                  if (!(bst.root.id in refs.ghostNodes)) {
                    oldDS = wasClamped.ds;
                    setRefs(RefsAction.POP_BST, wasClamped);
                  }
                }
              }
            }; checkPop();
            for (const { cloneNode } of Object.values(refs.ghostNodes)) {
              if (!cloneNode.physics) { continue; }
              if (!(cloneNode.id in targetPoss)) { continue; }
              cloneNode.physics.pos = targetPoss[cloneNode.id];
            }
            if (wasClamped && wasClamped.ds && wasClamped.ds.id in refs.dataStructures && refs.dataStructures[wasClamped.ds.id].physics) {
              refs.dataStructures[wasClamped.ds.id].physics.updateHull();
            }
            if (oldDS) {
              refs.dataStructures[oldDS.id].physics.updateHull();
            }
          }
          setRefs(RefsAction.SET_GHOST, false);
        }
      }
    } else if (action === RefsAction.SET_MOUSE_DOWN_POS && args[0] instanceof V2) {
      refs.inputs.mouseDownPos = args[0];
    } else if (action === RefsAction.SET_MOUSE_POS && args[0] && args[0].constructor.name === "SyntheticBaseEvent") {
      const pos: V2 = new V2(args[0].clientX, args[0].clientY);
      if (!refs.inputs.mousePos) {
        refs.inputs.mousePos = pos;
        return;
      }
      const posDiffPix: V2 = pos.add(refs.inputs.mousePos.scale(-1));
      refs.inputs.mousePos = pos;
      if (!refs.interacts.clamped && (appRefs.keysDown.has(0) || appRefs.keysDown.has(1) || appRefs.keysDown.has(" "))) {
        setRefs(RefsAction.SET_TWEEN_SYNCED, false);
        setRefs(RefsAction.SET_TARGET_POS, refs.screen.targetPos.add(Helpers.toScreenSize(refs.screen.size, posDiffPix).scale(-1)));
      } else if (refs.interacts.clamped) {
        if (refs.inputs.mouseDownPos.add(refs.inputs.mousePos.scale(-1)).magnitude() > Helpers.toPixelSize(refs.screen.size, new V2(1,1)).x) {
          setRefs(RefsAction.SET_GHOST, true);
        } else {
          setRefs(RefsAction.SET_GHOST, false); 
        }
      }
    } else if (action === RefsAction.SET_UI_TREE && args[0] instanceof Array) {
      updateTree(appRefs, refs, setRefs, args[0]);
    } else if (action === RefsAction.ADD_MESSAGE && typeof args[0] === "string") {
      refs.ui.messages.push({
        text: args[0],
        color: typeof args[1] === "string" ? args[1] : "rgb(255,255,255)",
        time: 0,
        ref: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
      });
      reactRender();
    } else if (action === RefsAction.REMOVE_MESSAGE && typeof args[0] === "number") {
      refs.ui.messages.splice(args[0], 1);
      reactRender();
    } else if (action === RefsAction.SET_NODES_VALUE && args[0] instanceof Node && typeof args[1] === "number") {
      if (args[0].value === args[1]) { return; }
      if (args[0].ds && args[0].ds.type === DSType.BST) {
        if (!(args[0].ds as BST).changeNodeValue(args[0], args[1])) {
          setRefs(RefsAction.ADD_MESSAGE, "node value already exists in DS", "rgba(255,0,0,.5)");
        }
      } else {
        args[0].value = args[1];
      }
      reactRender();
    } else if (action === RefsAction.SET_BST_SELF_BALANCING && args[0] instanceof BST && typeof args[1] === "boolean") {
      if (args[0].selfBalancing === args[1]) { return; }
      args[0].setSelfBalancing(args[1]);
      reactRender();
    } else if (action === RefsAction.ADD_DS && args[0] instanceof DS && (!args[1] || args[1] instanceof DSPhysics)) {
      if (!args[1]) {
        args[1] = new DSPhysics(args[0]);
      }
      refs.dataStructures[args[0].id] = {
        ds: args[0],
        physics: args[1],
        hullTriRefs: [],
      }
      for (let node of Object.values(args[0].nodes)) {
        if (!node.physics) {
          node.physics = new NodePhysics(node, new V2(0, 0));
        }
        if (!(node.id in refs.nodes)) {
          refs.nodes[node.id] = {
            node,
            physics: node.physics,
            comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
          }
        }
      }
      refs.dataStructures[args[0].id].physics.updateHull();
      reactRender();
    } else if (action === RefsAction.ADD_NODE && args[0] instanceof Node) {
      if (args[0].id in refs.nodes) { return; }
      if (!args[0].physics) {
        new NodePhysics(args[0], new V2(0, 0));
      }
      refs.nodes[args[0].id] = {
        node: args[0],
        physics: args[0].physics!,
        comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
      }
      reactRender();
    } else if (action === RefsAction.ADD_NODE_TO_DS && args[0] instanceof Node && args[1] instanceof DS) {
      setRefs(RefsAction.ADD_NODE, args[0]);
      if (args[1].type === DSType.BST) {
        const bst: BST = args[1] as BST;
        bst.insert(args[0]);
      }
      reactRender();
    } else if (action === RefsAction.POP_BST && args[0] instanceof Node) {
      const bst: BST = args[0].ds as BST;
      const nodes: Node[] = bst.breadthFirstSearch(() => true, false, args[0]) || [];
      for (let i = nodes.length-1; i >= 0; --i) {
        bst.remove(nodes[i]);
        nodes[i].physics!.velo = new V2(0, ENV.MAX_SPEED);
      }
      if (nodes.length > 1) {
        const bst2: BST = new BST(nodes, !!bst.selfBalancing);
        setRefs(RefsAction.ADD_DS, bst2);
      } else {
        reactRender();
      }
    } else if (action === RefsAction.REACT_RENDER) {
      reactRender();
    } else if (action === RefsAction.STEP_PHYSICS) {
      physicsStep(appRefs, refs, setRefs, ENV.PHYSICS_CLOCK_MS*ENV.PHYSICS_SPEED/1000);
    } else {
      throw new Error("Error on Window.setRefs, unhandled parameter types: " + action + ", " + Helpers.listTypes(args));
    }
  }

  const initWindowTween = (): void => {
    const windowTween = (): void => {
      setRefs(RefsAction.SET_IS_TWEENING_WINDOW, true);
      setTimeout(() => {
        let targetSize: V2, targetPos: V2;
        if (refs.screen.locked) {
          targetSize = refs.screen.lockedTargetSize;
          if (refs.screen.lockedTargetPos instanceof V2) {
            targetPos = refs.screen.lockedTargetPos;
          } else if (refs.screen.lockedTargetPos instanceof NodePhysics) {
            targetPos = refs.screen.lockedTargetPos.pos;
          } else if (refs.screen.lockedTargetPos instanceof DSPhysics && refs.screen.lockedTargetPos.center) {
            targetPos = refs.screen.lockedTargetPos.center;
          } else {
            targetPos = refs.screen.targetPos;
          }
        } else {
          targetSize = refs.screen.targetSize;
          targetPos = refs.screen.targetPos;
        }
        targetPos = targetPos.add(refs.screen.lockedTargetOffset);
        let [ newSize, sizeMet ] = refs.screen.size.tween(targetSize, SIZE_TWEEN_COEFF, SIZE_TWEEN_OFFSET*targetSize.x);
        let [ newPos, posMet ] = refs.screen.pos.tween(targetPos, POS_TWEEN_COEFF, POS_TWEEN_OFFSET*targetSize.x);
        if (refs.screen.posSizeTweenSynced) {
          let relSizeDiff: number = 1;
          if (refs.screen.size.add(targetSize.scale(-1)).magnitude() !== 0) {
            relSizeDiff = refs.screen.size.add(newSize.scale(-1)).magnitude() / refs.screen.size.add(targetSize.scale(-1)).magnitude();
          }
          let relPosDiff: number = 1;
          if (refs.screen.pos.add(targetPos.scale(-1)).magnitude() !== 0) {
            relPosDiff = refs.screen.pos.add(newPos.scale(-1)).magnitude() / refs.screen.pos.add(targetPos.scale(-1)).magnitude();
          }
          [ newSize, sizeMet ] = refs.screen.size.tween(targetSize, Math.min(relSizeDiff, relPosDiff, 1), 0);
          [ newPos, posMet ] = refs.screen.pos.tween(targetPos, Math.min(relSizeDiff, relPosDiff, 1), 0);
        }
        setRefs(RefsAction.SET_SIZE_POS, {size: newSize, pos: newPos});
        if (sizeMet && posMet && !(refs.screen.locked 
        && (refs.screen.lockedTargetPos instanceof NodePhysics || refs.screen.lockedTargetPos instanceof DSPhysics))) {
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
    if (cloneNode.left && cloneNode.left.id in refs.ghostNodes) {
      if (!(cloneNode.id + "-" + cloneNode.left.id in refs.ghostEdges)) {
        refs.ghostEdges[cloneNode.id + "-" + cloneNode.left.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      ghostEdgeComps.push(<EdgeComp key={cloneNode.id + "-" + cloneNode.left.id} 
        node1={cloneNode} node2={cloneNode.left} windowRefs={refs} setWindowRefs={setRefs} isGhost={true}/>);
    }
    if (cloneNode.right && cloneNode.right.id in refs.ghostNodes) {
      if (!(cloneNode.id + "-" + cloneNode.right.id in refs.ghostEdges)) {
        refs.ghostEdges[cloneNode.id + "-" + cloneNode.right.id] = {
          comp: React.createRef() as React.MutableRefObject<HTMLDivElement>,
        };
      }
      ghostEdgeComps.push(<EdgeComp key={cloneNode.id + "-" + cloneNode.right.id}
        node1={cloneNode} node2={cloneNode.right} windowRefs={refs} setWindowRefs={setRefs} isGhost={true}/>);
    }
  }
  const hullTris: JSX.Element[] = [];
  for (let ds of Object.values(refs.dataStructures)) {
    for (let triRef of ds.hullTriRefs) {
      hullTris.push(
        <svg className="screenTri" viewBox="0 0 100 100" preserveAspectRatio="none" ref={triRef}>
          <path />
        </svg>
      );
    }
  }
  const messages: JSX.Element[] = [];
  for (let i = 0; i < refs.ui.messages.length; ++i) {
    const { ref, text, color}: Message = refs.ui.messages[i];
    messages.push(<p className="message noselect ui" ref={ref} style={{color}} key={i}>{text}</p>);
  }

  if (ENV.PRINT_COMPS_RERENDER || ENV.PRINT_WINDOW_RERENDER) {
    console.log("Window rerender");
  }
  return(
    <>
    <div 
      id="window"
      className="mainFrame"
      onMouseDown={e => setRefs(RefsAction.SET_MOUSE_DOWN, e, null)}
      onMouseMove={e => setRefs(RefsAction.SET_MOUSE_POS, e)}
      onMouseUp={e => setRefs(RefsAction.SET_MOUSE_DOWN, e, null)}
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
      <div id="hullTris">
        {hullTris}
      </div>
    </div>
    <div id="ui" className="mainFrame">
      {/* <SelectionBar/> */}
      <MainContext windowRefs={refs} setWindowRefs={setRefs} />
      <EditNode windowRefs={refs} setWindowRefs={setRefs} />
      <AddNode windowRefs={refs} setWindowRefs={setRefs} />
      <div id="messages">
        {messages}
      </div>
    </div>
    </>
  );
}