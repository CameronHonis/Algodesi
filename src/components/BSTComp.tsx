import React from "react";
import { AppContext, AppContextType } from "../App";
import { BST } from "../models/BST";
import { Node } from "../models/Node";
import { NodeComp } from "./NodeComp";
import { EdgeComp } from "./EdgeComp";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { ContextAction } from "./MainContext";
import Helpers from "../models/Helpers";

export interface Props {
  bst: BST;
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => any;
}

export const getBSTContextActions = (refs: WindowRefs, anchorNode: Node) => {
  if (!anchorNode.ds) { return []; }
  const bst: BST = anchorNode.ds as BST;
  if (!bst.root) { return []; }
  const rtn: ContextAction[] = [];
  if (Helpers.shallowArrayCompare(refs.ui.tree, [0])) {
    if (bst.root.id in refs.nodes && refs.nodes[bst.root.id].compRefs?.interacts.selected) {
      rtn.push({
        name: "add node",
        color: "rgb(255,255,150)",
        callback: (e: React.MouseEvent | KeyboardEvent, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => {
          setRefs(WindowRefsAction.SET_UI_TREE, [0,1]);
        }
      });
    }
    rtn.push({
      name: "self balancing",
      color: "rgb(255,255,150)",
      callback: (e: React.MouseEvent | KeyboardEvent, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => {
        setRefs(WindowRefsAction.SET_BST_SELF_BALANCING, bst, !bst.selfBalancing);
      },
      checkbox: (): boolean => !!bst.selfBalancing,
    });
    if (!(bst.root.id in refs.nodes) || !refs.nodes[bst.root.id].compRefs?.interacts.selected) {
      rtn.push({
        name: "pop off",
        color: "rgb(255,255,150)",
        callback: (e: React.MouseEvent | KeyboardEvent, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => {
          setRefs(WindowRefsAction.POP_BST, anchorNode);
          setRefs(WindowRefsAction.SET_UI_TREE, [0]);
        }
      });
    }
  }
  return rtn;
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
  );
}