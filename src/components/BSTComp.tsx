import React from "react";
import { AppContext, AppContextType } from "../App";
import { BST } from "../models/BST";
import { Node } from "../models/Node";
import { NodeComp } from "./NodeComp";
import { EdgeComp } from "./EdgeComp";
import { Refs as windowRefs, RefsAction as WindowRefsAction } from "../Window";

export interface Props {
  bst: BST;
  windowRefs: windowRefs;
  setWindowRefs: (action: WindowRefsAction, arg: any) => any;
}

export const BSTComp: React.FC<Props> = (props) => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const nodeComps: JSX.Element[] = [];
  const edgeComps: JSX.Element[] = [];
  if (props.bst.root) {
    const nodes: Node[] | null = props.bst.breadthFirstSearch(() => true, false);
    for (let node of (nodes || [])) {
      if (node.toRender) {
        nodeComps.push(<NodeComp key={node.id.toString()} node={node} windowRefs={props.windowRefs} setWindowRefs={props.setWindowRefs} />);
        if (node.left) {
          edgeComps.push(<EdgeComp key={node.id + "-" + node.left.id}
            node1={node} node2={node.left} windowRefs={props.windowRefs} setWindowRefs={props.setWindowRefs} />);
        }
        if (node.right) {
          edgeComps.push(<EdgeComp key={node.id + "-" + node.right.id}
            node1={node} node2={node.right} windowRefs={props.windowRefs} setWindowRefs={props.setWindowRefs} />);
        }
      }
    }
  }

  return(
    <div className={"BST"} id={"BST" + props.bst.id}>
      {nodeComps}
      {edgeComps}
    </div>
  )
}