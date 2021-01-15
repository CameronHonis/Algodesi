import React from "react"
import { AppContext, AppContextType } from "./App"
import { V2 } from "./Models";


export const Window: React.FC = () => {
  const { state: appState, setState: setAppState, refs: appRefs } = React.useContext<AppContextType>(AppContext);


  // function renderPositions = () => {
    
  // }

  // useEffect(() => {
  //   renderPositions();
  // },[windowState]

  // const buttonClick = () => {
  //   renderPositions()
  // }

  const mouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      console.log(e);
      setAppState({...appState, windowState: {...appState.windowState, winPos: appState.windowState.winPos.add(
        e.movementX / window.innerWidth * screenSize.x,
        e.movementY / window.innerHeight * screenSize.y
      )}})
    }
  }

  const mouseDown = (e: React.MouseEvent) => {
    console.log("b")
    console.log(appState.windowState.winPos.add(-1,0));
    setAppState({...appState, windowState: {winPos: appState.windowState.winPos.add(-1,0)}})
  }
  const screenSize: V2 = new V2(20,20);
  const squareX: number = (appState.windowState.winPos.x + screenSize.x/2) / screenSize.x * 100;
  const squareYPos: number = (appState.windowState.winPos.y + screenSize.y/2) / screenSize.y * 100;
  return(
    <div id="window"
      onMouseMove={e => mouseMove(e)}
      onMouseDown={e => mouseDown(e)}
    >
      <div id="square" style={{position: "absolute", top: squareYPos + "vh", left: squareX + "vw", backgroundColor: "white", width: "50px", height: "50px"}} >

      </div>
    </div>
  )
}