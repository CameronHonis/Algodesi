import React, { useEffect } from "react";
import { BST } from "./models/BST";

import { DS } from "./models/DS";
import { V2 } from "./models/V2";
import { Window } from "./Window";


export interface Refs {
  keysDown: Set<string>;
}

export const initRefs: Refs = {
  keysDown: new Set(),
}

export interface State {
  window: {
    components: DS[];
  }
}

export const initState: State = {
  window: {
    components: [
      new BST([1,2,3], new V2(0, 0)),
      new BST([4,5,6], new V2(5,0))
    ]
  },
}

export interface AppContextType {
  refs: Refs;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

export const AppContext = React.createContext<AppContextType>({refs: initRefs, state: initState, setState: () => {}});

export const App: React.FC = () => {
  const refs = React.useRef<Refs>(initRefs);
  const [ state, setState ] = React.useState<State>(initState);

  const keysUpdated = () => {
    if (refs.current.keysDown.has("q") || refs.current.keysDown.has("Q")) {
      if (refs.current.keysDown.has("Shift") || refs.current.keysDown.has("Ctrl")) {
        console.log("appState: ", state)
        console.log("appRefs: ", refs.current)
      }
      refs.current.keysDown.delete("q");
      refs.current.keysDown.delete("Q");
      refs.current.keysDown.delete("Shift");
      refs.current.keysDown.delete("Ctrl");
      debugger;
    }
  }
  useEffect(() => {
    document.addEventListener("keydown", e => {
      refs.current.keysDown.add(e.key);
      keysUpdated();
    })
    document.addEventListener("keyup", e => {
      refs.current.keysDown.delete(e.key);
      keysUpdated();
    })
  }, []); //eslint-disable-line
  return (
    <div className="App">
      <AppContext.Provider value={{refs: refs.current, state, setState}}>
        <Window />
      </AppContext.Provider>
    </div>
  );
}