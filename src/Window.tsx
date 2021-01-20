import React from "react";

import { AppContext, AppContextType } from "./App"
import { V2 } from "./models/V2";

import SelectionBar from './components/SelectionBar'

export interface Refs {
  pos: V2;
  size: V2;
  targetPos: V2;
  targetSize: V2;
  isTweeningWindow: boolean;
}

export const initRefs: Refs = {
  pos: new V2(0, 0),
  size: new V2(20, 20),
  targetPos: new V2(0, 0),
  targetSize: new V2(20, 20),
  isTweeningWindow: false,
}

enum RefsAction {
  setSizePos = "SET_SIZE_POS",
  setTargetPos = "SET_TARGET_POS",
  setTargetSize = "SET_TARGET_SIZE"
}

export const Window: React.FC = () => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const debugPos = React.useRef<HTMLParagraphElement>(null);
  const debugSize = React.useRef<HTMLParagraphElement>(null);
  const debugTargetPos = React.useRef<HTMLParagraphElement>(null);
  const debugTargetSize = React.useRef<HTMLParagraphElement>(null);
  const square = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef(initRefs);
  const setRefs = (action: RefsAction, arg: any): any => {
    if (action === RefsAction.setSizePos && arg && arg.pos && arg.size) {
      refs.current.pos = arg.pos;
      refs.current.size = arg.size;
      renderPositions();
      renderSizes();
      if (debugPos.current && debugSize.current) {
        debugPos.current.textContent = "pos: " + refs.current.pos.toString();
        debugSize.current.textContent = "size: " + refs.current.size.toString();
      }
    } else if (action === RefsAction.setTargetPos && arg && arg.pos) {
      refs.current.targetPos = arg.pos;
      initWindowTween();
      if (debugTargetPos.current) {
        debugTargetPos.current.textContent = "targetPos: " + refs.current.targetPos.toString();
      }
    } else if (action === RefsAction.setTargetSize && arg && arg.size) {
      refs.current.targetSize = arg.size;
      initWindowTween();
      if (debugTargetSize.current) {
        debugTargetSize.current.textContent = "targetSize: " + refs.current.targetSize.toString();
      }
    }
  }

  React.useEffect(() => {
    document.addEventListener("wheel", e => {
      setRefs(RefsAction.setTargetSize, {size: refs.current.targetSize.add(e.deltaY/1000*refs.current.targetSize.x, e.deltaY/1000*refs.current.targetSize.y)});
    })
  }, []) //eslint-disable-line

  const renderPositions = (): void => {
    const pos: V2 = refs.current.pos;
    const size: V2 = refs.current.size;
    if (square.current) {
      const squarePos: V2 = new V2(
        (pos.x + size.x/2) / size.x * 100,
        (pos.y + size.y/2) / size.y * 100
      )
      square.current.style.left = squarePos.x + "vw";
      square.current.style.top = squarePos.y + "vh";
    }
  }

  const renderSizes = (): void => {
    const size: V2 = refs.current.size;
    if (square.current) {
      const squareSize: V2 = new V2(1000 / size.x, 1000 / size.y);
      square.current.style.width = squareSize.x + "px";
      square.current.style.height = squareSize.y + "px";
    }
  }

  const initWindowTween = (): void => {
    const windowTween = (lastPos: V2, lastSize: V2): void => {
      refs.current.isTweeningWindow = true
      const [ newSize, sizeMet ] = lastSize.tween(refs.current.targetSize, .15, .001*refs.current.targetSize.x);
      const [ newPos, posMet ] = lastPos.tween(refs.current.targetPos, .5, .001*newSize.x);
      setTimeout(() => {
        setRefs(RefsAction.setSizePos, {size: newSize, pos: newPos});
        if (sizeMet && posMet) { refs.current.isTweeningWindow = false; return; }
        windowTween(newPos, newSize);
      }, 10);
    }
    windowTween(refs.current.pos, refs.current.size);
  }

  const mouseMove = (e: React.MouseEvent): void => {
    if (e.buttons === 1) {
      setRefs(RefsAction.setTargetPos, {pos: refs.current.targetPos.add(
        e.movementX / window.innerWidth * refs.current.targetSize.x,
        e.movementY / window.innerHeight * refs.current.targetSize.y
      )});
    }
  }

  return(
    <div 
      id="window"
      onMouseMove={e => mouseMove(e)}
    >
      <p ref={debugPos} className="noselect" style={{position: "absolute"}} >{"pos: " + refs.current.pos.toString()}</p>
      <p ref={debugSize} className="noselect" style={{position: "absolute", top: "20px"}} >{"size: " + refs.current.size.toString()}</p>
      <p ref={debugTargetPos} className="noselect" style={{position: "absolute", top: "40px"}} >{"targetPos: " + refs.current.targetPos.toString()}</p>
      <p ref={debugTargetSize} className="noselect" style={{position: "absolute", top: "60px"}} >{"targetSize: " + refs.current.targetSize.toString()}</p>
      <div id="square" ref={square} style={{position: "absolute", backgroundColor: "white", width: "50px", height: "50px", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)"}} >
      </div>
      <SelectionBar/>
    </div>
  )
}