import React from "react";
import { V2 } from "./Models";

import { Window } from "./Window";


export interface Refs {
  test: string;
}

export const initRefs: Refs = {
  test: "asdf"
}

export interface WindowState {
  winPos: V2;
}

export interface State {
  windowState: WindowState;
}

export const initState: State = {
  windowState: {
    winPos: new V2(9.8,0),
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
  return (
    <div className="App">
      <AppContext.Provider value={{refs: refs.current, state, setState}}>
        <Window />
      </AppContext.Provider>
    </div>
  );
}