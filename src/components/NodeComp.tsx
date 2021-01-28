import React from "react"
import { Node } from "../models/Node";
import { Refs as windowRefs, RefsAction as WindowRefsAction } from "../Window";

interface Props {
  node: Node
  windowRefs: windowRefs;
  setWindowRefs: (action: WindowRefsAction, arg: any) => any;
}

export const NodeComp: React.FC<Props> = (props) => {
  if (!(props.node.id in props.windowRefs.nodeElements)) {
    props.windowRefs.nodeElements[props.node.id] = React.createRef() as React.MutableRefObject<HTMLDivElement>;
  }

  return(
    <>
    <div className={"node"} style={{position: "absolute", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)", zIndex: 5}} ref={props.windowRefs.nodeElements[props.node.id]}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="rgb(80,80,80)" stroke="rgb(0,200,200)" strokeWidth="6" />
      </svg>
      <p id={"node" + props.node.id + "value"} className="noselect"
        style={{position: "absolute", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)",
        zIndex: 1, left: "50%", top: "47%", color: "rgb(0, 200, 200)", fontFamily: "monospace", textAlign: "center"}}
      >
        {props.node.value}
      </p>
      
    </div>
      <p id={"node" + props.node.id + "label1"} className="noselect" style={{position: "absolute", minWidth: "100vw", 
        left: "100%", top: "-50%", color: "red", zIndex: 1}}
      />
      <div id={"node" + props.node.id + "vector1"} style={{position: "absolute", transform: "translate(-50%,-50%)", WebkitTransform: "translate(-50%, -50%)", zIndex: 10, backgroundColor: "red"}} />
    </>
  );
}