import React from "react";
import gsap from "gsap";
import Helpers from "../models/Helpers";
import { Refs as WindowRefs } from "../Window";
import { Refs as ContextWindowRefs } from "./ContextWindow";
import { V2 } from "../models/V2";

export interface Props {
  windowRefs: WindowRefs;
  contextWindowRefs: ContextWindowRefs;
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

export const ContextWindowAction: React.FC<Props> = ({ windowRefs, contextWindowRefs, itemIdx }) => {
  const { current: refs } = React.useRef(Helpers.deepCopy(initRefs) as Refs);

  React.useEffect(() => {
    contextWindowRefs.items[itemIdx].refs = refs;
    contextWindowRefs.items[itemIdx].setRefs = setRefs;
  },[]); //eslint-disable-line

  const setRefs = (action: RefsAction, arg: any) => {
    if (action === RefsAction.SET_MOUSE_DOWN && typeof arg === "boolean") {
      if (refs.inputs.mouseDown === arg) { return; }
      refs.inputs.mouseDown = arg;
      render();
    } else if (action === RefsAction.SET_MOUSE_OVER && typeof arg === "boolean") {
      if (refs.inputs.mouseOver === arg) { return; }
      refs.inputs.mouseOver = arg;
      if (!arg && refs.inputs.mouseDown) {
        setRefs(RefsAction.SET_MOUSE_DOWN, false);
      }
      render();
    } else if (action === RefsAction.SET_MOUSE_EXITED_WHILE_DOWN && typeof arg === "boolean") {

    }
  }

  const render = () => {
    if (refs.ref?.current) {
      gsap.killTweensOf(refs.ref.current);
      if (refs.inputs.mouseDown) {
        gsap.to(refs.ref.current, {backgroundColor: "rgba(0,0,0,1)", color: "rgb(255,255,255)", duration: .05});
      } else if (refs.inputs.mouseOver) {
        gsap.to(refs.ref.current, {backgroundColor: "rgba(10,10,10,1)", color: "rgb(255,255,255)", duration: .05});
      } else {
        gsap.to(refs.ref.current, {backgroundColor: "rgba(25,25,25,0)", color: "rgb(200,200,200)", duration: .15});
      }
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

  if (!refs.ref) {
    refs.ref = React.createRef() as React.MutableRefObject<HTMLDivElement>;
  }
  const lineHeight: number = Helpers.toPixelSize(windowRefs.screen.size, new V2(1,1)).x;
  return(
    <div
      className="contextAction noselect"
      onMouseOver={e => mouseOver(e)}
      onMouseOut={e => mouseOut(e)}
      onMouseMove={e => mouseMove(e)}
      onMouseDown={e => mouseDown(e)}
      onMouseUp={e => mouseUp(e)}
      onClick={e => contextWindowRefs.items[itemIdx].callback(e)}
      ref={refs.ref}
      style={{height: lineHeight, lineHeight: lineHeight, fontSize: lineHeight/2}}
    >{contextWindowRefs.items[itemIdx].name}</div>
  )
}