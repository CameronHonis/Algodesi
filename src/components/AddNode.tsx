import React from "react";
import { Node } from "../models/Node";
import { DropInto } from "../svgs/DropInto";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { ContextAction, RefsAction as MainContextRefsAction } from "./MainContext";
import { renderAddNode as render } from "../services/render";
import { NodePhysics } from "../models/NodePhysics";
import { V2 } from "../models/V2";
import { DSType } from "../models/DS";
import { BST } from "../models/BST";

export interface Props {
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => void;
}

export interface Refs {
  ref: React.MutableRefObject<HTMLDivElement>;
  visible: boolean;
  changeMade: boolean;
  text: string;
  anims: {
    arrowTime: number;
  }
}

export const getAddNodeContextItems = (refs: WindowRefs): ContextAction[] => {
  const rtn: ContextAction[] = [];
  rtn.push({
    name: "cancel",
    keybind: "escape",
    callback: (e: React.MouseEvent | KeyboardEvent, wRefs: WindowRefs, setWRefs: (action: WindowRefsAction, ...args: any) => void) => {
      setWRefs(WindowRefsAction.SET_UI_TREE, [0]);
    }
  });
  rtn.push({
    name: "add",
    keybind: "enter",
    callback: (e: React.MouseEvent | KeyboardEvent, wRefs: WindowRefs, setWRefs: (action: WindowRefsAction, ...args: any) => void) => {
      if (wRefs.interacts.selectAnchor && wRefs.interacts.selectAnchor.ds && wRefs.ui.addNodeRefs && wRefs.ui.addNodeRefs.text.length) {
        const newNodeValue: number = parseInt(wRefs.ui.addNodeRefs.text);
        if (wRefs.interacts.selectAnchor.ds.type === DSType.BST) {
          const bst: BST = wRefs.interacts.selectAnchor.ds as BST;
          if (bst.values.has(newNodeValue)) {
            setWRefs(WindowRefsAction.ADD_MESSAGE, "node with value " + newNodeValue + " already exists in BST", "red");
            setWRefs(WindowRefsAction.SET_UI_TREE, [0]);
            return;
          }
        }
        const newNode: Node = new Node(null, newNodeValue);
        setWRefs(WindowRefsAction.ADD_NODE_TO_DS, newNode, wRefs.interacts.selectAnchor.ds);
      }
      setWRefs(WindowRefsAction.SET_UI_TREE, [0]);
    }
  });
  return rtn;
}

export const initRefs: Refs = {
  ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  visible: false,
  changeMade: false,
  text: "",
  anims: {
    arrowTime: 0,
  },
}

export enum RefsAction {
  SET_VISIBLE = "SET_VISIBLE",
  SET_TEXT = "SET_TEXT",
  SET_CHANGE_MADE = "SET_CHANGE_MADE",
}

export const AddNode: React.FC<Props> = ({ windowRefs, setWindowRefs }) => {
  const [ state, setState ] = React.useState(0);
  let { current: refs } = React.useRef(initRefs);

  const reactRender = () => {
    setState(state + 1);
  }

  const setRefs = (action: RefsAction, ...args: any) => {
    if (action === RefsAction.SET_VISIBLE && typeof args[0] === "boolean") {
      if (refs.visible && !args[0]) {
        refs.visible = false;
        setRefs(RefsAction.SET_TEXT, "");
        setRefs(RefsAction.SET_CHANGE_MADE, false);
        render(windowRefs, 0);
      } else if (!refs.visible && args[0]) {
        refs.visible = true;
        setRefs(RefsAction.SET_TEXT, "");
        setRefs(RefsAction.SET_CHANGE_MADE, false);
        render(windowRefs, 0);
      }
    } else if (action === RefsAction.SET_CHANGE_MADE && typeof args[0] === "boolean") {
      if (refs.changeMade === args[0]) { return; }
      refs.changeMade = args[0];
      if (refs.changeMade && windowRefs.ui.mainContextSetRefs) {
        windowRefs.ui.mainContextSetRefs(MainContextRefsAction.SET_VISIBLE, true);
      }
      reactRender()
    } else if (action === RefsAction.SET_TEXT) {
      if (refs.text === args[0]) { return; }
      if (args[0].length && isNaN(Number(args[0][args[0].length-1])) && (args[0].length !== 1 || args[0] !== "-")) {
        args[0] = args[0].substring(0, args[0].length-1);
      }
      if (args[0].length > 3) {
        if (args[0] === "-") {
          // context message "node value cannot be -100 or less"
          args[0] = args[0].substring(0, args[0].length-1);
        } else {
          // context message "node value cannot be 1000 or greater"
          args[0] = args[0].substring(0, args[0].length-1);
        }
      }
      refs.text = args[0];
      const nodeInput: HTMLInputElement | null = refs.ref.current.querySelector("input");
      if (nodeInput) {
        nodeInput.value = refs.text;
      }
      if (!refs.changeMade) {
        setRefs(RefsAction.SET_CHANGE_MADE, true);
      }
    }
  }

  const inputChange = (e: React.ChangeEvent) => {
    setRefs(RefsAction.SET_TEXT, (e.target as HTMLInputElement).value);
  }

  React.useEffect(() => {
    windowRefs.ui.addNodeRefs = refs;
    windowRefs.ui.addNodeSetRefs = setRefs;
  },[]); //eslint-disable-line

  let annotation: JSX.Element | undefined;
  if (!refs.changeMade) {
    annotation = <p id="addNodeAnnotation" className="noselect">enter new node value</p>;
  }
  return(
    <div ref={refs.ref} style={{visibility: "hidden"}}>
      <div className="node" style={{zIndex: 7}} >
        <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="47" fill="rgb(33,100,50)" stroke="rgb(66,200,100)" strokeWidth="6" />
        </svg>
        <input className="addNodeValue" onChange={e => inputChange(e)} />
      </div>
      <DropInto arrowStyle={{fill: "rgba(33,100,50,1)", stroke: "rgba(66,200,100,1)", strokeWidth: "5"}} />
      {annotation}
    </div>
  );
}