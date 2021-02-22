import React from "react"
import gsap from "gsap";
import { Node } from "../models/Node";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { AppContext, AppContextType } from "../App";
import { ContextAction } from "./MainContext";
import { DSType } from "../models/DS";
import Helpers from "../models/Helpers";
import { getBSTContextActions } from "./BSTComp";

interface Props {
  node: Node
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => any;
  isGhost?: Boolean;
}

export interface Refs {
  interacts: {
    highlighted: boolean;
    selected: boolean;
  }
  inputs: {
    mouseOver: boolean;
    ctrlDown: boolean;
    shiftDown: boolean;
  }
}

export const initRefs: Refs = {
  interacts: {
    highlighted: false,
    selected: false,
  },
  inputs: {
    mouseOver: false,
    ctrlDown: false,
    shiftDown: false,
  },
}

export enum NodeRefsAction {
  SET_MOUSE_OVER = "SET_MOUSE_OVER",
  SET_CTRL_DOWN = "SET_CTRL_DOWN",
  SET_SHIFT_DOWN = "SET_SHIFT_DOWN",
  SET_HIGHLIGHTED = "SET_HIGHLIGHTED",
  SET_SELECTED = "SET_SELECTED",
  PRINT = "PRINT",
  UPDATE_HIGHLIGHTED = "UPDATE_HIGHLIGHTED",
}

export const getNodeContextActions = (windowRefs: WindowRefs, node?: Node): ContextAction[] => {
  if (!node) {
    if (windowRefs.interacts.selectAnchor) {
      node = windowRefs.interacts.selectAnchor;
    } else {
      return [];
    }
  }
  const rtn: ContextAction[] = [];
  if (Helpers.shallowArrayCompare(windowRefs.ui.tree, [0])) {
    rtn.push({
      name: "set value", 
      callback: (e: React.MouseEvent | KeyboardEvent, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => {
        setRefs(WindowRefsAction.SET_UI_TREE, [0, 0]);
      }
    });
  }
  if (node.ds && node.ds.type === DSType.BST) {
    getBSTContextActions(windowRefs, node).forEach(v => rtn.push(v));
  }
  return rtn;
}

export const NodeComp: React.FC<Props> = ({node, isGhost, windowRefs, setWindowRefs}) => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const { current: refs } = React.useRef(Helpers.deepCopy(initRefs) as Refs);

  React.useEffect(() => {
    if (!isGhost) {
      if (node.id in windowRefs.nodes) {
        windowRefs.nodes[node.id].compRefs = refs;
        windowRefs.nodes[node.id].compSetRefs = setRefs;
      }

      document.addEventListener("keydown", e => {
        if (e.key === "Shift") {
          setRefs(NodeRefsAction.SET_SHIFT_DOWN, true);
        } else if (e.key === "Control") {
          setRefs(NodeRefsAction.SET_CTRL_DOWN, true);
        }
      });
      document.addEventListener("keyup", e => {
        if (e.key === "Shift") {
          setRefs(NodeRefsAction.SET_SHIFT_DOWN, false);
        } else if (e.key === "Control") {
          setRefs(NodeRefsAction.SET_CTRL_DOWN, false);
        }
      });
    }
  },[]); //eslint-disable-line
  
  const setRefs = (action: NodeRefsAction, ...args: any): void => {
    if (isGhost) { return; }
    const updateHighlighted = () => {
      if (!refs.interacts.selected && (refs.inputs.mouseOver || windowRefs.interacts.clamped === node)) {
        setAllRefs(NodeRefsAction.SET_HIGHLIGHTED, false);
        if (refs.inputs.ctrlDown) {
          setRefs(NodeRefsAction.SET_HIGHLIGHTED, true);
        } else if (refs.inputs.shiftDown) {
          setChildRefs(NodeRefsAction.SET_HIGHLIGHTED, true);
        } else {
          setDSRefs(NodeRefsAction.SET_HIGHLIGHTED, true);
        }
      } else {
        setAllRefs(NodeRefsAction.SET_HIGHLIGHTED, false);
      }
    }
    if (action === NodeRefsAction.SET_MOUSE_OVER && typeof args[0] === "boolean") {
      if (args[0] === refs.inputs.mouseOver) { return; }
      refs.inputs.mouseOver = args[0];
      if (!windowRefs.interacts.clamped) {
        updateHighlighted();
      }
    } else if (action === NodeRefsAction.SET_CTRL_DOWN && typeof args[0] === "boolean") {
      if (args[0] === refs.inputs.ctrlDown) { return; }
      refs.inputs.ctrlDown = args[0];
      if (refs.inputs.mouseOver) {
        updateHighlighted();
      }
    } else if (action === NodeRefsAction.SET_SHIFT_DOWN && typeof args[0] === "boolean") {
      if (args[0] === refs.inputs.shiftDown) { return; }
      refs.inputs.shiftDown = args[0];
      if (refs.inputs.mouseOver) {
        updateHighlighted();
      }
    } else if (action === NodeRefsAction.SET_SELECTED && typeof args[0] === "boolean") {
      refs.interacts.selected = args[0];
      render();
    } else if (action === NodeRefsAction.SET_HIGHLIGHTED && typeof args[0] === "boolean") {
      refs.interacts.highlighted = args[0];
      render();
    } else if (action === NodeRefsAction.PRINT) {
      console.log(node.toString(), refs.inputs.mouseOver);
    } else if (action === NodeRefsAction.UPDATE_HIGHLIGHTED) {
      updateHighlighted();
    }
  }

  const setAllRefs = (action: NodeRefsAction, ...args: any): void => {
    for (const { compSetRefs } of Object.values(windowRefs.nodes)) {
      if (compSetRefs) {
        compSetRefs(action, ...args);
      }
    }
  }

  const setDSRefs = (action: NodeRefsAction, ...args: any): void => {
    for (const { node: dsNode, compSetRefs } of Object.values(windowRefs.nodes)) {
      if ((dsNode === node || (node.ds && node.ds === dsNode.ds)) && compSetRefs) {
        compSetRefs(action, ...args);
      }
    }
  }

  const setChildRefs = (action: NodeRefsAction, ...args: any): void => {
    const stack: Node[] = [node];
    const stackSet: Set<Node> = new Set();
    while (stack.length) {
      const stackNode: Node = stack[stack.length-1];
      stackSet.add(stackNode);
      if (stackNode.ds?.type === DSType.BST) {
        if (stackNode.left && !stackSet.has(stackNode.left)) {
          stack.push(stackNode.left);
          continue;
        }
        if (stackNode.right && !stackSet.has(stackNode.right)) {
          stack.push(stackNode.right);
          continue;
        }
      }
      if (stackNode === node) {
        setRefs(action, ...args);
      } else {
        if (stackNode.id in windowRefs.nodes && windowRefs.nodes[stackNode.id].compSetRefs) {
          windowRefs.nodes[stackNode.id].compSetRefs!(action, ...args);
        }
      }
      stack.pop();
    }
  }

  const mouseOver = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(NodeRefsAction.SET_MOUSE_OVER, true);
  }

  const mouseMove = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setWindowRefs(WindowRefsAction.SET_MOUSE_POS, e);
    setRefs(NodeRefsAction.SET_MOUSE_OVER, true);
  }

  const mouseOut = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(NodeRefsAction.SET_MOUSE_OVER, false);
  }

  const mouseDown = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setWindowRefs(WindowRefsAction.SET_MOUSE_DOWN, e, node);
  }
  
  const mouseUp = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setWindowRefs(WindowRefsAction.SET_MOUSE_DOWN, e, node);
  }
  
  const render = (): void => {
    const svg: SVGSVGElement | null = windowRefs.nodes[node.id].comp.current.querySelector("svg");
    if (!svg) { return; }
    const circ: SVGCircleElement | null = svg.querySelector("circle");
    if (!circ) { return; }
    const valueP: HTMLParagraphElement | null = windowRefs.nodes[node.id].comp.current.querySelector("p");
    if (!valueP) { return; }
    gsap.killTweensOf(circ);
    gsap.killTweensOf(valueP);
    if (isGhost) {
      circ.style.fill = "rgb(200,200,200)";
      circ.style.stroke = "rgb(255,255,255)";
      valueP.style.color = "rgb(255,255,255)";
    } else if (windowRefs.interacts.selectAnchor === node) {
      gsap.to(circ, {fill: "rgb(30,30,30)", stroke: "rgb(255,255,100)", duration: .05});
      gsap.to(valueP, {color: "rgb(255,255,100)", duration: 0.05});
    } else if (refs.interacts.selected) {
      gsap.to(circ, {fill: "rgb(40,40,40)", stroke: "rgb(255,200,50)", duration: 0.05});
      gsap.to(valueP, {color: "rgb(255,200,50)", duration: 0.05})
    } else if (refs.interacts.highlighted && windowRefs.interacts.selectAnchor !== node) {
      gsap.to(circ, {fill: "rgb(60,60,60)", stroke: "rgb(150,200,100)", duration: .15});
      gsap.to(valueP, {color: "rgb(150,200,100)", duration: .15});
    } else {
      gsap.to(circ, {fill: "rgb(80,80,80", stroke: "rgb(0,200,200)", duration: .15});
      gsap.to(valueP, {color: "rgb(0,200,200", duration: .15});
    }
  }

  // Pre-reactRender logic vvv
  let debugDiv: JSX.Element = <></>;
  if (!isGhost) {
    const debugVectors: JSX.Element[] = [];
    for (let i = 0; i < 20; i++) {
      debugVectors.push(<div key={i} id={"node" + node.id + "vector" + i} style={{position: "absolute", pointerEvents: "none", zIndex: 10}} />);
    }
    debugDiv = (
      <div className={"debugElements"} >
        <p id={"node" + node.id + "label1"} className="noselect" style={{position: "absolute", minWidth: "100vw",
          left: "100%", top: "-50%", color: "red", zIndex: 10, pointerEvents: "none"}}
        />
        {debugVectors}
      </div>
    )
  }
  const zIndex: number = isGhost ? 15 : 5;
  const pointerEvents: "none" | "auto" = isGhost ? "none" : "auto";
  const ref: React.MutableRefObject<HTMLDivElement> = isGhost ? windowRefs.ghostNodes[node.id].comp : windowRefs.nodes[node.id].comp;
  const onMouseOver: (e: React.MouseEvent) => void = isGhost ? e => undefined : e => mouseOver(e);
  const onMouseMove: (e: React.MouseEvent) => void = isGhost ? e => undefined : e => mouseMove(e);
  const onMouseOut: (e: React.MouseEvent) => void = isGhost ? e => undefined : e => mouseOut(e);
  const onMouseDown: (e: React.MouseEvent) => void = isGhost ? e => undefined : e => mouseDown(e);
  const onMouseUp: (e: React.MouseEvent) => void = isGhost ? e => undefined : e => mouseUp(e);
  const color: string = isGhost ? "rgba(255,255,255,.3)" : "rgb(0,200,200)";
  const fillColor: string = isGhost ? "rgba(185,185,185,.3)" : "rgb(80,80,80)";

  return(
    <div className="node" style={{zIndex: zIndex, pointerEvents}} ref={ref}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{pointerEvents}}>
        <circle cx="50" cy="50" r="47" fill={fillColor} stroke={color} strokeWidth="6" cursor="pointer" style={{pointerEvents}}
          onMouseOver={onMouseOver}
          onMouseMove={onMouseMove}
          onMouseOut={onMouseOut}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
      </svg>
      <p className="noselect nodeValue" style={{color: color}}>{node.value}</p>
      {debugDiv}
    </div>
  );
}