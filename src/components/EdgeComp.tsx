import React from "react"
import { Node } from "../models/Node";
import { Refs as windowRefs, RefsAction as WindowRefsAction } from "../Window";

interface Props {
  node1: Node;
  node2: Node;
  windowRefs: windowRefs;
  setWindowRefs: (action: WindowRefsAction, arg: any) => any;
}
export const EdgeComp: React.FC<Props> = (props) => {
  
  if (!(props.node1.id + "-" + props.node2.id in props.windowRefs.edgeElements)) {
    props.windowRefs.edgeElements[props.node1.id + "-" + props.node2.id] = React.createRef() as React.MutableRefObject<HTMLDivElement>;
  }

  return(
    <div id={"edge" + props.node1.id + "-" + props.node2.id} ref={props.windowRefs.edgeElements[props.node1.id + "-" + props.node2.id]}
      style={{position: "absolute", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)", backgroundColor: "rgb(0, 200, 200)"}}></div>
  )
}