import React from "react";

import { AppContext, AppContextType } from "./App"
import { V2 } from "./models/V2";

export interface Refs {
  targetPos: V2;
  isPosTweening: boolean;
  targetSize: V2;
  isTweeningWindow: boolean;
  isSizeTweening: boolean;
}

export const initRefs: Refs = {
  targetPos: new V2(0, 0),
  isPosTweening: false,
  targetSize: new V2(20, 20),
  isTweeningWindow: false,
  isSizeTweening: false
}

export const Window: React.FC = () => {
  let { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext); //eslint-disable-line

  const square = React.useRef<HTMLDivElement>(null);
  const refs = React.useRef(initRefs);

  const renderPositions = () => {
    if (square.current) {
      const squarePos: V2 = new V2(
        (appState.window.pos.x + appState.window.size.x/2) / appState.window.size.x * 100,
        (appState.window.pos.y + appState.window.size.y/2) / appState.window.size.y * 100
      )
      square.current.style.left = squarePos.x + "vw";
      square.current.style.top = squarePos.y + "vh";
    }
  }

  const renderSizes = () => {
    if (square.current) {
      const squareSize: V2 = new V2(1000 / appState.window.size.x, 1000 / appState.window.size.y);
      square.current.style.width = squareSize.x + "px";
      square.current.style.height = squareSize.y + "px";
    }
  }

  React.useEffect(() => {
    renderPositions();
  }, [appState.window.pos]); //eslint-disable-line

  React.useEffect(() => {
    renderSizes();
  }, [appState.window.size]); // eslint-disable-line

  React.useEffect(() => {
    document.addEventListener("wheel", e => {
      refs.current.targetSize = refs.current.targetSize.add(e.deltaY/1000*refs.current.targetSize.x, e.deltaY/1000*refs.current.targetSize.y);
      initWindowTween();
    })
  }, []) //eslint-disable-line

  const initWindowTween = () => {
    const windowTween = (lastPos: V2, lastSize: V2): void => {
      refs.current.isTweeningWindow = true
      const [ newSize, sizeMet ] = lastSize.tween(refs.current.targetSize, .15, .001*refs.current.targetSize.x);
      const [ newPos, posMet ] = lastPos.tween(refs.current.targetPos, .15, .001 * newSize.x);
      setTimeout(() => {
        setAppState({...appState, window: {...appState.window, pos: newPos, size: newSize}});
        if (sizeMet && posMet) { refs.current.isTweeningWindow = false; return; }
        windowTween(newPos, newSize);
      }, 10);
    }
    windowTween(appState.window.pos, appState.window.size);
  }

  const mouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      refs.current.targetPos = refs.current.targetPos.add(
        e.movementX / window.innerWidth * refs.current.targetSize.x,
        e.movementY / window.innerHeight * refs.current.targetSize.y,
      );
      initWindowTween();
    }
  }

  return(
    <div 
      id="window"
      onMouseMove={e => mouseMove(e)}
    >
      <p className="noselect" style={{position: "absolute"}} >{"pos: " + appState.window.pos.toString()}</p>
      <p className="noselect" style={{position: "absolute", top: "20px"}} >{"size: " + appState.window.size.toString()}</p>
      <div id="square" ref={square} style={{position: "absolute", backgroundColor: "white", width: "50px", height: "50px", transform: "translate(-50%, -50%)", WebkitTransform: "translate(-50%, -50%)"}} >

      </div>
    </div>
  )
}