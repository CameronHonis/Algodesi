import React from "react";
import gsap from "gsap";
import { Node } from "../models/Node";
import { Refs as windowRefs, RefsAction as WindowRefsAction } from "../Window";
import { NodeRefsAction } from "./NodeComp";

interface Props {
  node1: Node;
  node2: Node;
  isGhost?: Boolean;
  windowRefs: windowRefs;
  setWindowRefs: (action: WindowRefsAction, arg: any) => any;
}

export interface Refs {
  highlightedTop: boolean;
  highlightedBottom: boolean;
  selectedTop: boolean;
  selectedBottom: boolean
}

export const initRefs: Refs = {
  highlightedTop: false,
  highlightedBottom: false,
  selectedTop: false,
  selectedBottom: false,
}

export enum EdgeRefsAction {
  SET_HIGHLIGHTED_TOP = "SET_HIGHLIGHTED_TOP",
  SET_HIGHLIGHTED_BOTTOM = "SET_HIGHLIGHTED_BOTTOM",
  SET_SELECTED_TOP = "SET_SELECTED_TOP",
  SET_SELECTED_BOTTOM = "SET_SELECTED_BOTTOM",
}

export const EdgeComp: React.FC<Props> = ({node1, node2, isGhost, windowRefs, setWindowRefs}) => {
  const edgeId: string = node1.id + "-" + node2.id;

  const { current: refs } = React.useRef({...initRefs});

  React.useEffect(() => {
    if (!isGhost) {
      if (edgeId in windowRefs.edges) {
        windowRefs.edges[edgeId].compRefs = refs;
        windowRefs.edges[edgeId].compSetRefs = setRefs;
      }
    }
  },[]); //eslint-disable-line

  const setRefs = (action: NodeRefsAction | EdgeRefsAction, ...arg: any): void => {
    const refsCopy = {...refs};
    if (action === NodeRefsAction.SET_HIGHLIGHTED && typeof arg[0] === "boolean") {
      refs.highlightedTop = arg[0];
      refs.highlightedBottom = arg[0];
    } else if (action === NodeRefsAction.SET_SELECTED && typeof arg[0] === "boolean") {
      refs.selectedTop = arg[0];
      refs.selectedBottom = arg[0];
    } else if (action === EdgeRefsAction.SET_HIGHLIGHTED_TOP && typeof arg[0] === "boolean") {
      refs.highlightedTop = arg[0];
    } else if (action === EdgeRefsAction.SET_HIGHLIGHTED_BOTTOM && typeof arg[0] === "boolean") {
      refs.highlightedBottom = arg[0];
    } else if (action === EdgeRefsAction.SET_SELECTED_TOP && typeof arg[0] === "boolean") {
      refs.selectedTop = arg[0];
    } else if (action === EdgeRefsAction.SET_SELECTED_BOTTOM && typeof arg[0] === "boolean") {
      refs.selectedBottom = arg[0];
    }
    if (edgeId === "15-24" && false) {
      console.group("EdgeRefsChange:");
      if (refsCopy.highlightedBottom !== refs.highlightedBottom) {
        console.log("highlightedBottom: " + refs.highlightedBottom);
      }
      if (refsCopy.highlightedTop !== refs.highlightedTop) {
        console.log("highlightedTop: " + refs.highlightedTop);
      }
      if (refsCopy.selectedBottom !== refs.selectedBottom) {
        console.log("selectedBottom: " + refs.selectedBottom);
      }
      if (refsCopy.selectedTop !== refs.selectedTop) {
        console.log("selectedTop: " + refs.selectedTop);
      }
      console.groupEnd();
    }
    
    render();
  }

  const render = (): void => {
    const edgeDiv: HTMLDivElement = windowRefs.edges[edgeId].comp.current;
    let gradientColor1: string = "rgb(0,200,200)";
    let gradientColor2: string = "rgb(0,200,200)";
    if (isGhost) {
      edgeDiv.style.backgroundColor = "rgb(200,200,200)";
    } else if (refs.selectedTop) {
      if (windowRefs.interacts.selectAnchor === node1) {
        gradientColor1 = "rgb(255,255,100)";
      } else {
        gradientColor1 = "rgb(255,200,50)";
      }
    } else if (refs.highlightedTop) {
      gradientColor1 = "rgb(150,200,100)";
    }
    if (refs.selectedBottom) {
      if (windowRefs.interacts.selectAnchor === node2) {
        gradientColor2 = "rgb(255,255,100)";
      } else {
        gradientColor2 = "rgb(255,200,50)";
      }
    } else if (refs.highlightedBottom) {
      gradientColor2 = "rgb(150,200,100)";
    }
    let dur: number = .15;
    if (refs.selectedTop && refs.selectedBottom) {
      dur = .05;
    }
    gsap.killTweensOf(edgeDiv);
    gsap.to(edgeDiv, {background: "linear-gradient(90deg," + gradientColor1 + "," + gradientColor2 + ")", duration: dur});
  }

  const ref: React.MutableRefObject<HTMLDivElement> = isGhost ? windowRefs.ghostEdges[edgeId].comp : windowRefs.edges[edgeId].comp;
  const zIndex: number = isGhost ? 13 : 3;
  const color: string = isGhost ? "rgba(255,255,255,.3)" : "rgb(0,200,200)";

  return(
    <div ref={ref}
      style={{position: "absolute", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)", 
        background: "linear-gradient(90deg, " + color + "," + color + ")", zIndex: zIndex}}></div>
  )
}