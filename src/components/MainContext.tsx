import React from "react";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { MainContextItem, Refs as MainContextItemRefs, RefsAction as MainContextItemRefsAction } from "./MainContextItem";
import Helpers from "../models/Helpers";
import { V2 } from "../models/V2";
import { renderMainContext as render } from "../services/render";
import { NodePhysics } from "../models/NodePhysics";
import { DSPhysics } from "../models/DSPhysics";
import { getEditNodeContextItems } from "./EditNode";
import { getNodeContextActions } from "./NodeComp";
import { getAddNodeContextItems } from "./AddNode";
import { AppContext, AppContextType } from "../App";
import * as ENV from "../envVars";

export type ContextAction = {
  name: string,
  color?: string,
  callback: (e: React.MouseEvent | KeyboardEvent, refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void) => void,
  keybind?: string,
  checkbox?: () => boolean,
  refs?: MainContextItemRefs,
  setRefs?: (action: MainContextItemRefsAction, ...args: any) => void,
};

export interface Props {
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => void
}

export interface Refs {
  ref: React.MutableRefObject<HTMLDivElement>;
  items: ContextAction[];
  visible: boolean;
  height: number;
  position: V2 | NodePhysics | DSPhysics;
  offset: V2;
}

export const initRefs: Refs = {
  ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  items: [],
  visible: false,
  height: 0,
  position: new V2(0, 0),
  offset: new V2(0, 0),
}

export enum RefsAction {
  SET_ITEMS = "SET_ITEMS",
  SET_VISIBLE = "SET_VISIBLE",
  SET_POSITION = "SET_POSITION",
}

export enum ItemsCategory {
  NODE_SELECT = "NODE_SELECT",
  EDIT_NODE = "EDIT_NODE",
  ADD_NODE = "ADD_NODE",
}

export const MainContext: React.FC<Props> = ({ windowRefs, setWindowRefs }) => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line
  
  const {current: refs } = React.useRef(initRefs);

  const [ state, setState ] = React.useState(0);

  const reactRender = () => {
    setState(state + 1);
  }

  const setRefs = (action: RefsAction, ...args: any) => {
    if (action === RefsAction.SET_ITEMS) {
      for (let { keybind } of refs.items) {
        if (keybind) {
          delete appRefs.keybinds[keybind];
        }
      }
      refs.items = [];
      if (args[0] === ItemsCategory.NODE_SELECT) {
        if (windowRefs.interacts.selectAnchor) {
          refs.items = getNodeContextActions(windowRefs, windowRefs.interacts.selectAnchor);
        }
      } else if (args[0] === ItemsCategory.EDIT_NODE) {
        refs.items = getEditNodeContextItems(windowRefs);
      } else if (args[0] === ItemsCategory.ADD_NODE) {
        refs.items = getAddNodeContextItems(windowRefs);
      }
      for (let { keybind, callback } of refs.items) {
        if (keybind) {
          appRefs.keybinds[keybind] = (e: KeyboardEvent) => {
            callback(e, windowRefs, setWindowRefs);
          }
        }
      }
      reactRender();
    } else if (action === RefsAction.SET_VISIBLE && typeof args[0] === "boolean") {
      if (args[0] === refs.visible) { return; }
      refs.visible = args[0];
      render(windowRefs);
    } else if (action === RefsAction.SET_POSITION && (args[0] instanceof V2 || args[0] instanceof NodePhysics || args[0] instanceof DSPhysics) 
    && (!args[1] || args[1] instanceof V2)) {
      refs.position = args[0];
      if (args[1]) {
        refs.offset = args[1];
      } else {
        refs.offset = new V2(0, 0);
      }
      render(windowRefs);
    } else {
      throw new Error("Error on MainContext.setRefs, unhandled parameter types " + action + " " + Helpers.listTypes(args));
    }
  }

  React.useEffect(() => {
    windowRefs.ui.mainContextRefs = refs;
    windowRefs.ui.mainContextSetRefs = setRefs;
  })


  const itemComps: JSX.Element[] = [];
  for (let i = 0; i < refs.items.length; ++i) {
    itemComps.push(<MainContextItem windowRefs={windowRefs} setWindowRefs={setWindowRefs} mainContextRefs={refs} itemIdx={i} key={i}/>);
  }
  if (ENV.PRINT_COMPS_RERENDER) {
    console.log("MainContext rerender");
  }
  return(
    <div id="mainContext" className="ui" ref={refs.ref} >
      {itemComps}
    </div>
  );
}