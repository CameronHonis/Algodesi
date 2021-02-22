import React from "react";
import { Node } from "../models/Node";
import { Refs as windowRefs, RefsAction as WindowRefsAction } from "../Window";

interface Props {
  node1: Node;
  node2: Node;
  isGhost?: Boolean;
  windowRefs: windowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => any;
}


export const EdgeComp: React.FC<Props> = ({node1, node2, isGhost, windowRefs, setWindowRefs}) => {
  const edgeId: string = node1.id + "-" + node2.id;

  const ref: React.MutableRefObject<HTMLDivElement> = isGhost ? windowRefs.ghostEdges[edgeId].comp : windowRefs.edges[edgeId].comp;

  return(
    <div className="edge" ref={ref} />
  )
}