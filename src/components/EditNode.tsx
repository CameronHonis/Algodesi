import React from "react";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { renderEditNode as render } from "../services/render";
import { RefsAction as MainContextRefsAction, ContextAction } from "./MainContext";

export interface Props {
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => void;
}

export interface Refs {
  ref: React.MutableRefObject<HTMLDivElement>;
  visible: boolean;
  changeMade: boolean;
  text: string;
}

export const initRefs: Refs = {
  ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  visible: false,
  changeMade: false,
  text: "",
}

export enum RefsAction {
  SET_VISIBLE = "SET_VISIBLE",
  SET_CHANGE_MADE = "SET_CHANGE_MADE",
  SET_TEXT = "SET_TEXT",
}

export const getEditNodeContextItems = (refs: WindowRefs): ContextAction[] => {
  const rtn: ContextAction[] = [];
  rtn.push({
    name: "cancel", 
    keybind: "escape",
    callback: (e: React.MouseEvent | KeyboardEvent, wRefs: WindowRefs, setWRefs: (action: WindowRefsAction, ...args: any) => void) => {
      setWRefs(WindowRefsAction.SET_UI_TREE, [0]);
    }
  });
  rtn.push({
    name: "save", 
    keybind: "enter",
    callback: (e: React.MouseEvent | KeyboardEvent, wRefs: WindowRefs, setWRefs: (action: WindowRefsAction, ...args: any) => void) => {
      if (wRefs.interacts.selectAnchor && wRefs.ui.editNodeRefs && wRefs.ui.editNodeRefs.text.length) {
        setWRefs(WindowRefsAction.SET_NODES_VALUE, wRefs.interacts.selectAnchor, parseInt(wRefs.ui.editNodeRefs.text));
      }
      setWRefs(WindowRefsAction.SET_UI_TREE, [0]);
    }
  });
  return rtn;
}

export const EditNode: React.FC<Props> = ({ windowRefs, setWindowRefs }) => {
  const { current: refs } = React.useRef({...initRefs});

  const setRefs = (action: RefsAction, ...args: any): void => {
    if (action === RefsAction.SET_VISIBLE && typeof args[0] === "boolean") {
      if (refs.visible && !args[0]) {
        refs.visible = false;
        setRefs(RefsAction.SET_TEXT, "");
        setRefs(RefsAction.SET_CHANGE_MADE, false);
        render(windowRefs);
      } else if (!refs.visible && args[0]) {
        if (!windowRefs.interacts.selectAnchor) { return; }
        refs.visible = true;
        setRefs(RefsAction.SET_TEXT, windowRefs.interacts.selectAnchor.value.toString());
        setRefs(RefsAction.SET_CHANGE_MADE, false);
        render(windowRefs);
      }
    } else if (action === RefsAction.SET_CHANGE_MADE && typeof args[0] === "boolean") {
      if (refs.changeMade === args[0]) { return; }
      refs.changeMade = args[0];
      if (refs.changeMade && windowRefs.ui.mainContextSetRefs) {
        windowRefs.ui.mainContextSetRefs(MainContextRefsAction.SET_VISIBLE, true);
      }
    } else if (action === RefsAction.SET_TEXT && typeof args[0] === "string") {
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
    windowRefs.ui.editNodeRefs = refs;
    windowRefs.ui.editNodeSetRefs = setRefs;
  },[]); //eslint-disable-line

  return(
    <div className="node" style={{zIndex: 7, visibility: "hidden"}} ref={refs.ref}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" >
        <circle cx="50" cy="50" r="47" fill="rgb(30,30,30)" stroke="rgb(185,0,50)" strokeWidth="6" cursor="pointer"/>
      </svg>
      <input className="editNodeValue" onChange={e => inputChange(e)} />
    </div>
  );
}