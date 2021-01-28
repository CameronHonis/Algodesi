import React, { useEffect } from "react";
import { Window } from "./Window";

export interface Refs {
  keysDown: Set<string | number>;
};

export const initRefs: Refs = {
  keysDown: new Set(),
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

  useEffect(() => {
    document.addEventListener("keydown", e => { 
      setKeyRefs(e.key);
    });
    document.addEventListener("mousedown", e => {
      setKeyRefs(e.button);
    });
    document.addEventListener("keyup", e => {
      setKeyRefs(e.key, false);
    });
    document.addEventListener("mouseup", e => {
      setKeyRefs(e.button, false);
    });
  }, []); //eslint-disable-line
  return (
    <div className="App">
      <AppContext.Provider value={{refs: refs, state, setState}}>
        <Window />
      </AppContext.Provider>
    </div>
  );
}