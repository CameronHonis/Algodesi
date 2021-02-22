import React from "react";
import gsap from "gsap";
import Helpers from "../models/Helpers";
import { Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { ContextAction, Refs as MainContextRefs } from "./MainContext";
import { V2 } from "../models/V2";
import { Checkbox } from "../svgs/Checkbox";
import { renderMainContextItem as render } from "../services/render";

export interface Props {
  windowRefs: WindowRefs;
  setWindowRefs: (action: WindowRefsAction, ...args: any) => void
  mainContextRefs: MainContextRefs;
  itemIdx: number;
}

export interface Refs {
  ref?: React.MutableRefObject<HTMLDivElement>;
  inputs: {
    mouseDown: boolean;
    mouseOver: boolean;
    mouseExitedWhileDown: boolean;
  };
}

export const initRefs: Refs = {
  inputs: {
    mouseDown: false,
    mouseOver: false,
    mouseExitedWhileDown: false,
  },
}

export enum RefsAction {
  SET_MOUSE_DOWN = "SET_MOUSE_DOWN",
  SET_MOUSE_OVER = "SET_MOUSE_OVER",
  SET_MOUSE_EXITED_WHILE_DOWN = "SET_MOUSE_EXITED_WHILE_DOWN",
}

export const MainContextItem: React.FC<Props> = ({ windowRefs, setWindowRefs, mainContextRefs, itemIdx }) => {
  const { current: refs } = React.useRef(Helpers.deepCopy(initRefs) as Refs);

  const setRefs = (action: RefsAction, ...args: any) => {
    if (action === RefsAction.SET_MOUSE_DOWN && typeof args[0] === "boolean") {
      if (refs.inputs.mouseDown === args[0]) { return; }
      refs.inputs.mouseDown = args[0];
      render(windowRefs, item);
    } else if (action === RefsAction.SET_MOUSE_OVER && typeof args[0] === "boolean") {
      if (refs.inputs.mouseOver === args[0]) { return; }
      refs.inputs.mouseOver = args[0];
      if (!args[0] && refs.inputs.mouseDown) {
        setRefs(RefsAction.SET_MOUSE_DOWN, false);
      }
      render(windowRefs, item);
    } else if (action === RefsAction.SET_MOUSE_EXITED_WHILE_DOWN && typeof args[0] === "boolean") {

    }
  }

  const mouseOver = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(RefsAction.SET_MOUSE_OVER, true);
  }

  const mouseOut = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(RefsAction.SET_MOUSE_OVER, false);
  }

  const mouseMove = (e: React.MouseEvent): void => {
    setRefs(RefsAction.SET_MOUSE_OVER, true);
  }

  const mouseDown = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(RefsAction.SET_MOUSE_DOWN, true);
  }

  const mouseUp = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setRefs(RefsAction.SET_MOUSE_DOWN, false);
  }
  const item: ContextAction = mainContextRefs.items[itemIdx];
  item.refs = refs;
  item.setRefs = setRefs;
  if (!refs.ref) {
    refs.ref = React.createRef() as React.MutableRefObject<HTMLDivElement>;
  }
  let itemStr: string = item.name;
  if (mainContextRefs.items[itemIdx].keybind === "escape") {
    itemStr += " [ESC]";
  } else if (mainContextRefs.items[itemIdx].keybind === "enter") {
    itemStr += " [ENTER]";
  }
  const lineHeight: number = Helpers.toPixelSize(windowRefs.screen.size, new V2(1,1)).abs().x;
  let checkbox: JSX.Element | undefined;
  if (item.checkbox) {
    checkbox = <Checkbox svgStyle={{width: 0, height: 0}}/>
  }
  let line: JSX.Element | undefined;
  if (itemIdx < mainContextRefs.items.length - 1) {
    line = <div className="mainContextLine" />
  }
  return(
    <>
    <div
      className="mainContextItem noselect"
      onMouseOver={e => mouseOver(e)}
      onMouseOut={e => mouseOut(e)}
      onMouseMove={e => mouseMove(e)}
      onMouseDown={e => mouseDown(e)}
      onMouseUp={e => mouseUp(e)}
      onClick={e => item.callback(e, windowRefs, setWindowRefs)}
      ref={refs.ref}
      style={{height: lineHeight, lineHeight: lineHeight, fontSize: lineHeight/2}}
    >
      <p>{itemStr}</p>
      {checkbox}
    </div>
    {line}
    </>
  );
}