import React from "react";
import { V2 } from "./models/V2";
import { Window } from "./Window";

export interface Refs {
  keysDown: Set<string | number>;
  mousePos: V2,
  mouseDownPos: V2 | null;
};

export const initRefs: Refs = {
  keysDown: new Set(),
  mousePos: new V2(0, 0),
  mouseDownPos: null,
};

export interface State {
};

export const initState: State = {
};

export interface AppContextType {
  refs: Refs;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

export const AppContext = React.createContext<AppContextType>({refs: initRefs, state: initState, setState: () => {}});

export const App: React.FC = () => {
  const { current: refs } = React.useRef<Refs>(initRefs);
  const [ state, setState ] = React.useState<State>(initState);

  const keysUpdated = () => {
    if (refs.keysDown.has("q") || refs.keysDown.has("Q")) {
      if (refs.keysDown.has("Shift") || refs.keysDown.has("Control")) {
        console.log("appState: ", state)
        console.log("appRefs: ", refs)
      }
      refs.keysDown.delete("q");
      refs.keysDown.delete("Q");
      refs.keysDown.delete("Shift");
      refs.keysDown.delete("Control");
      debugger;
    }
  }

  const setKeyRefs = (key: string | number, down: boolean = true) => {
    if (down) {
      refs.keysDown.add(key);
    } else {
      refs.keysDown.delete(key);
    }
    keysUpdated();
  }

  React.useEffect(() => {
    document.addEventListener("keydown", e => { 
      setKeyRefs(e.key);
    });
    document.addEventListener("mousedown", e => {
      setKeyRefs(e.button);
      refs.mouseDownPos = new V2(e.clientX, e.clientY);
    });
    document.addEventListener("keyup", e => {
      setKeyRefs(e.key, false);
    });
    document.addEventListener("mouseup", e => {
      setKeyRefs(e.button, false);
      refs.mouseDownPos = null;
    });
    document.addEventListener("mousemove", e => {
      refs.mousePos = new V2(e.clientX, e.clientY);
    })
  }, []); //eslint-disable-line
  return (
    <div className="App">
      <AppContext.Provider value={{refs: refs, state, setState}}>
        <Window />
      </AppContext.Provider>
    </div>
  );
}