import React from "react";
import { BSTComp } from "./components/BSTComp";
import { AppContext, AppContextType } from "./App"
import { V2 } from "./models/V2";
import { DS } from "./models/DS";
import { BST } from "./models/BST";
import { Node } from "./models/Node";
import { DSPhysics } from "./models/DSPhysics";
import { NodePhysics } from "./models/NodePhysics";
import { M2 } from "./models/M2";
import Helpers from "./Helpers";
import { NodeComp } from "./components/NodeComp";
import { EdgeComp } from "./components/EdgeComp";
import SelectionBar from './components/SelectionBar'

export const MAX_WINDOW_SIZE: V2 = new V2(100, 50);
export const MIN_WINDOW_SIZE: V2 = new V2(5, 2.5);
export const MAX_INIT_WINDOW_SIZE: V2 = new V2(20, 20);
export const INIT_WINDOW_POS: V2 = new V2(0, 0);

export const POS_TWEEN_COEFF: number = .9;
export const POS_TWEEN_OFFSET: number = .001;
export const SIZE_TWEEN_COEFF: number = .15;
export const SIZE_TWEEN_OFFSET: number = .001;
export const WINDOW_TWEEN_CLOCK_MS: number = 10;

export const PHYSICS_CLOCK_MS: number = 20;

export const PRIORITIES_CLOCK_MS: number = 1000;

const Node0: Node = new Node(null, 0);
const BST0: BST = new BST(Node0);
const Node0Physics: NodePhysics = new NodePhysics(Node0, new V2(0, 0));

const Node1: Node = new Node(null, 1);
BST0.insert(Node1);
const Node1Physics: NodePhysics = new NodePhysics(Node1, new V2(0, 1));

export interface Refs {
  viewportSize: V2;
  pos: V2;
  size: V2;
  targetPos: V2;
  targetSize: V2;
  isTweeningWindow: boolean;
  posSizeTweenSynced: boolean;
  debugElements: Partial<{
    pos: React.MutableRefObject<HTMLParagraphElement>;
    size: React.MutableRefObject<HTMLParagraphElement>;
    targetPos: React.MutableRefObject<HTMLParagraphElement>;
    targetSize: React.MutableRefObject<HTMLParagraphElement>;
    synced: React.MutableRefObject<HTMLParagraphElement>;
    physicsFreq: React.MutableRefObject<HTMLParagraphElement>;
  }>;
  nodeElements: {
    [index: number]: React.MutableRefObject<HTMLDivElement>;
  };
  edgeElements: {
    [index: string]: React.MutableRefObject<HTMLDivElement>;
  }
  physics: {
    DSComps: {[index: number]: DSPhysics};
    NodeComps: {[index: number]: NodePhysics};
  };
}

const initWindowSize: V2 = new V2(
  20 * Math.min(window.innerWidth/window.innerHeight, 1),
  20 * Math.min(window.innerHeight / window.innerWidth, 1)
);

export const initRefs: Refs = {
  viewportSize: new V2(window.innerWidth, window.innerHeight),
  pos: INIT_WINDOW_POS,
  size: initWindowSize,
  targetPos: INIT_WINDOW_POS,
  targetSize: initWindowSize,
  isTweeningWindow: false,
  posSizeTweenSynced: true,
  debugElements: {
    pos: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    size: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    targetPos: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    targetSize: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    synced: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
    physicsFreq: React.createRef() as React.MutableRefObject<HTMLParagraphElement>,
  },
  nodeElements: {},
  edgeElements: {},
  physics: {
    DSComps: {},
    NodeComps: {0: Node0Physics, 1: Node1Physics},
  },
}

export enum RefsAction {
  SET_SIZE,
  SET_SIZE_POS,
  SET_TARGET_POS,
  SET_TARGET_SIZE,
  SET_TWEEN_SYNCED,
  SET_IS_TWEENING_WINDOW,
  SET_VIEWPORT_SIZE,
}

export interface State {
  nodes: {
    [index: number]: Node;
  };
}

export const initState: State = {
  nodes: {
    0: Node0,
    1: Node1,
  }
}

export const Window: React.FC = () => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const [ state, setState ] = React.useState<State>(initState); //eslint-disable-line

  const { current: refs } = React.useRef(initRefs);
  const setRefs = (action: RefsAction, arg: any): any => {
    if (action === RefsAction.SET_SIZE && arg instanceof V2) {
      refs.size = arg;
      renderNodes();
      if (refs.debugElements.size?.current) {
        refs.debugElements.size.current.textContent = "size: " + refs.size.toString();
      }
    } else if (action === RefsAction.SET_SIZE_POS && arg && arg.pos instanceof V2 && arg.size instanceof V2) {
      refs.pos = arg.pos;
      refs.size = arg.size;
      renderNodes();
      if (refs.debugElements.pos?.current && refs.debugElements.size?.current) {
        refs.debugElements.pos.current.textContent = "pos: " + refs.pos.toString();
        refs.debugElements.size.current.textContent = "size: " + refs.size.toString();
      }
    } else if (action === RefsAction.SET_TARGET_POS && arg instanceof V2) {
      refs.targetPos = arg;
      initWindowTween();
      if (refs.debugElements.targetPos?.current) {
        refs.debugElements.targetPos.current.textContent = "targetPos: " + refs.targetPos.toString();
      }
    } else if (action === RefsAction.SET_TARGET_SIZE && arg instanceof V2) {
      refs.targetSize = arg;
      initWindowTween();
      if (refs.debugElements.targetSize?.current) {
        refs.debugElements.targetSize.current.textContent = "targetSize: " + refs.targetSize.toString();
      }
    } else if (action === RefsAction.SET_TWEEN_SYNCED && typeof arg === "boolean") {
      refs.posSizeTweenSynced = arg;
      if (refs.debugElements.synced?.current) {
        refs.debugElements.synced.current.textContent = "synced: " + (refs.posSizeTweenSynced ? "⬤" : "");
      }
    } else if (action === RefsAction.SET_IS_TWEENING_WINDOW && typeof arg === "boolean") {
      refs.isTweeningWindow = arg;
    } else if (action === RefsAction.SET_VIEWPORT_SIZE && arg instanceof V2) {
      if (refs.viewportSize.x === arg.x) {
        const uncappedYSize: number = refs.targetSize.y * arg.y/refs.viewportSize.y;
        const newYSize: number = Math.max(MIN_WINDOW_SIZE.y, Math.min(uncappedYSize, MAX_WINDOW_SIZE.y));
        const ratio: number = refs.targetSize.x / uncappedYSize;
        const newXSize: number = newYSize * ratio;
        setRefs(RefsAction.SET_SIZE, refs.size.parallelProduct(newXSize / refs.targetSize.x, newYSize / refs.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      } else {
        const uncappedXSize: number = refs.targetSize.x * arg.x/refs.viewportSize.x;
        const newXSize: number = Math.max(MIN_WINDOW_SIZE.x, Math.min(uncappedXSize, MAX_WINDOW_SIZE.x));
        const ratio: number = uncappedXSize / refs.targetSize.y;
        const newYSize: number = newXSize / ratio;
        setRefs(RefsAction.SET_SIZE, refs.size.parallelProduct(newXSize / refs.targetSize.x, newYSize / refs.targetSize.y));
        setRefs(RefsAction.SET_TARGET_SIZE, new V2(newXSize, newYSize));
      }
      refs.viewportSize = arg;
    }
  }

  React.useEffect(() => {
    document.addEventListener("wheel", e => {
      const deltaSize: V2 = new V2(e.deltaY/1000*refs.targetSize.x, e.deltaY/1000*refs.targetSize.y);
      const mousePos: V2 = refs.targetPos.add(refs.targetSize.parallelProduct(.5 - e.clientX/window.innerWidth, e.clientY/window.innerHeight - .5));
      const deltaPos: V2 = mousePos.add(refs.targetPos.scale(-1)).parallelProduct(deltaSize.x/refs.targetSize.x, deltaSize.y/refs.targetSize.y);
      let minCoeff: number = 1;
      if (refs.targetSize.x + deltaSize.x > MAX_WINDOW_SIZE.x) {
        minCoeff = Math.min(minCoeff, (MAX_WINDOW_SIZE.x - refs.targetSize.x) / deltaSize.x);
      }
      if (refs.targetSize.x + deltaSize.x < MIN_WINDOW_SIZE.x) {
        minCoeff = Math.min(minCoeff, -(refs.targetSize.x - MIN_WINDOW_SIZE.x) / deltaSize.x);
      }
      if (refs.targetSize.y + deltaSize.y > MAX_WINDOW_SIZE.y) {
        minCoeff = Math.min(minCoeff, (MAX_WINDOW_SIZE.y - refs.targetSize.y) / deltaSize.y);
      }
      if (refs.targetSize.y + deltaSize.y < MIN_WINDOW_SIZE.y) {
        minCoeff = Math.min(minCoeff, -(MIN_WINDOW_SIZE.y - refs.targetSize.y) / deltaSize.y);
      }
      setRefs(RefsAction.SET_TARGET_SIZE, refs.targetSize.add(deltaSize.scale(minCoeff)));
      setRefs(RefsAction.SET_TARGET_POS, refs.targetPos.add(deltaPos.scale(minCoeff)));
    });
    document.addEventListener("mousemove", e => {
      if (appRefs.keysDown.has(1) || appRefs.keysDown.has(" ")) {
        setRefs(RefsAction.SET_TWEEN_SYNCED, false);
        setRefs(RefsAction.SET_TARGET_POS, refs.targetPos.add(
          -e.movementX / window.innerWidth * refs.targetSize.x,
          e.movementY / window.innerHeight * refs.targetSize.y
        ));
      }
    });
    window.addEventListener("resize", () => {
      if (Math.abs(refs.viewportSize.x - window.innerWidth) > 10 || Math.abs(refs.viewportSize.y - window.innerHeight) > 10) {
        setRefs(RefsAction.SET_VIEWPORT_SIZE, new V2(window.innerWidth, window.innerHeight));
      }
    });
    const prioritiesClock = () => {
      const history: Set<NodePhysics> = new Set();
      for (const nodeComp of Object.values(refs.physics.NodeComps)) {
        const predPath: M2 = new M2(nodeComp.pos, nodeComp.pos.add(nodeComp.velo.scale(2)));
        history.add(nodeComp);
        for (const nodeComp2 of Object.values(refs.physics.NodeComps)) {
          if (!history.has(nodeComp2)) {
            nodeComp.setRelation(nodeComp2, predPath);
          }
        }
      }
      setTimeout(() => {
        prioritiesClock();
      }, PRIORITIES_CLOCK_MS);
    }
    prioritiesClock();
    let lastPhysDebugUpdate: number = 0;
    const physicsClock = (lastMiS: number) => {
      //optimize all loops runtime O(n) to O(r) n = #nodes, r = #rendered nodes
      let history: Set<NodePhysics> = new Set();
      for (const nodeComp of Object.values(refs.physics.NodeComps)) {
        nodeComp.accel = new V2(0, 0);
      }
      history = new Set();
      for (const nodeComp of Object.values(refs.physics.NodeComps)) {
        history.add(nodeComp);
        for (const nodeComp2 of nodeComp.highPriorityRelations) {
          if (!history.has(nodeComp2)) {
            nodeComp.addForce(nodeComp2, refs.physics.NodeComps);
          }
        }
      }
      for (const nodeComp of Object.values(refs.physics.NodeComps)) {
        nodeComp.addDrag();
      }
      history = new Set();
      const currMiS: number = window.performance.now()
      const dt: number = (currMiS - lastMiS) / 1000;
      if (currMiS - lastPhysDebugUpdate > 100) {
        if (refs.debugElements.physicsFreq?.current) {
          lastPhysDebugUpdate = currMiS;
          refs.debugElements.physicsFreq.current.textContent = "physics: " + Helpers.round(1/dt) + "hz";
        }
      }
      for (const nodeComp of Object.values(refs.physics.NodeComps)) {
        if (nodeComp.accel.magnitude() > 0) {
          nodeComp.incrementPhysics(dt, refs.pos, refs.size);
        }
      }
      renderNodes();
      setTimeout(() => {
        physicsClock(currMiS);
      }, PHYSICS_CLOCK_MS);
    }
    physicsClock(window.performance.now());
  }, []) //eslint-disable-line

  const renderNodes = (): void => {
    for (const [ nodeIdString, nodeElementRefs ] of Object.entries(refs.nodeElements)) {
      const nodeId = parseInt(nodeIdString);
      const nodePhysics: NodePhysics = refs.physics.NodeComps[nodeId];
      if (!(nodeId in refs.physics.NodeComps)) { console.log("couldnt find node physics"); continue; }
      const nodeDiv: HTMLDivElement = nodeElementRefs.current;
      const nodeSVG: SVGSVGElement | null = nodeDiv.querySelector("svg");
      const nodeP: HTMLParagraphElement | null = nodeDiv.querySelector("#node" + nodeIdString + "value");
      if (!nodeSVG || !nodeP) { continue; }
      const nodePixPos: V2 = Helpers.toPixelPos(refs.pos, refs.size, nodePhysics.pos);
      const nodePixSize: V2 = Helpers.toPixelSize(refs.size, new V2(1, 1));
      nodeDiv.style.left = nodePixPos.x + "px";
      nodeDiv.style.top = nodePixPos.y + "px";
      nodeDiv.style.width = nodePixSize.x + "px";
      nodeDiv.style.height = nodePixSize.y + "px";
      nodeP.style.fontSize = window.innerWidth * .7 / refs.size.x + "px";
      const node: Node = state.nodes[nodeId];
      if (node) {
        if (node.left && node.left.id in refs.physics.NodeComps) {
          const leftNodePhysics: NodePhysics = refs.physics.NodeComps[node.left.id];
          const edgeRef: React.MutableRefObject<HTMLDivElement> = refs.edgeElements[node.id + "-" + node.left.id];
          if (edgeRef && edgeRef.current) {
            new M2(nodePhysics.pos, leftNodePhysics.pos).fitDiv(edgeRef.current, refs.pos, refs.size, 10, 10);
          }
        }
        if (node.right && node.right.id in refs.physics.NodeComps) {
          const rightNodePhysics: NodePhysics = refs.physics.NodeComps[node.right.id];
          const edgeRef: React.MutableRefObject<HTMLDivElement> = refs.edgeElements[node.id + "-" + node.right.id];
          if (edgeRef && edgeRef.current) {
            new M2(nodePhysics.pos, rightNodePhysics.pos).fitDiv(edgeRef.current, refs.pos, refs.size, 10, 10);
          }
        }
      }
      //annotations vvv
      const posAnno: HTMLParagraphElement | null = document.querySelector("#node" + nodeIdString + "label1");
      if (posAnno) {
        posAnno.style.left = nodePixPos.x + nodePixSize.x/2 + 5 + "px";
        posAnno.style.top = nodePixPos.y - nodePixSize.y/2 + "px";
        posAnno.textContent = "pos: " + refs.physics.NodeComps[nodeId].pos.toString(3);
      }
      const accelVec: HTMLDivElement | null = document.querySelector("#node" + nodeIdString + "vector1");
      if (accelVec) {
        new M2(nodePhysics.pos, nodePhysics.pos.add(nodePhysics.accel)).fitDiv(accelVec, refs.pos, refs.size);
      }
    }
  }

  const initWindowTween = (): void => {
    const windowTween = (): void => {
      setRefs(RefsAction.SET_IS_TWEENING_WINDOW, true);
      let [ newSize, sizeMet ] = refs.size.tween(refs.targetSize, SIZE_TWEEN_COEFF, SIZE_TWEEN_OFFSET*refs.targetSize.x);
      let [ newPos, posMet ] = refs.pos.tween(refs.targetPos, POS_TWEEN_COEFF, POS_TWEEN_OFFSET*refs.targetSize.x);
      if (refs.posSizeTweenSynced) {
        let relSizeDiff: number = 1;
        if (refs.size.add(refs.targetSize.scale(-1)).magnitude() !== 0) {
          relSizeDiff = refs.size.add(newSize.scale(-1)).magnitude() / refs.size.add(refs.targetSize.scale(-1)).magnitude();
        }
        let relPosDiff: number = 1;
        if (refs.pos.add(refs.targetPos.scale(-1)).magnitude() !== 0) {
          relPosDiff = refs.pos.add(newPos.scale(-1)).magnitude() / refs.pos.add(refs.targetPos.scale(-1)).magnitude();
        }
        [ newSize, sizeMet ] = refs.size.tween(refs.targetSize, Math.min(relSizeDiff, relPosDiff, 1), 0);
        [ newPos, posMet ] = refs.pos.tween(refs.targetPos, Math.min(relSizeDiff, relPosDiff, 1), 0);
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
    if (!refs.isTweeningWindow) {
      windowTween();
    }
  }

  const nodeComps: JSX.Element[] = [];
  const edgeComps: JSX.Element[] = [];
  for (let node of Object.values(state.nodes)) {
    nodeComps.push(<NodeComp key={node.id} node={node} windowRefs={refs} setWindowRefs={setRefs} />);
    if (node.left) {
      edgeComps.push(<EdgeComp key={node.id + "-" + node.left.id} node1={node} node2={node.left} windowRefs={refs} setWindowRefs={setRefs} />);
    }
    if (node.right) {
      edgeComps.push(<EdgeComp key={node.id + "-" + node.right.id} node1={node} node2={node.right} windowRefs={refs} setWindowRefs={setRefs} />);
    }
  }
  return(
    <div 
      id="window"
    >
      <div id="debuggerLabels">
        <p ref={refs.debugElements.pos} className="noselect" style={{position: "absolute"}} >{"pos: " + refs.pos.toString()}</p>
        <p ref={refs.debugElements.targetPos} className="noselect" style={{position: "absolute", top: "20px"}} >{"targetPos: " + refs.targetPos.toString()}</p>
        <p ref={refs.debugElements.size} className="noselect" style={{position: "absolute", top: "40px"}} >{"size: " + refs.size.toString()}</p>
        <p ref={refs.debugElements.targetSize} className="noselect" style={{position: "absolute", top: "60px"}} >{"targetSize: " + refs.targetSize.toString()}</p>
        <p ref={refs.debugElements.synced} className="noselect" style={{position: "absolute", top: "80px"}} >{"synced: ⬤"}</p>
        <p ref={refs.debugElements.physicsFreq} className="noselect" style={{position: "absolute", top: "100px"}} >physics: </p>
      </div>
      <div id="nodeComps">
        {nodeComps}
      </div>
      <div id="edgeComps">
        {edgeComps}
      </div>
      <SelectionBar/>
    </div>
  )
}