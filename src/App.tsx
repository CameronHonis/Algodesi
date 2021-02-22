import React from "react";
import { V2 } from "./models/V2";
import { Window, Refs as WindowRefs, RefsAction as WindowRefsAction } from "./Window";

export interface Refs {
  keysDown: Set<string | number>;
  keybinds: {
    [index: string]: Function;
  };
  keybindDown: boolean;
  mousePos: V2,
  mouseDownPos: V2 | null;
  envOverrides: {};
  terminalRef: React.MutableRefObject<HTMLInputElement>;
  terminalHistory: string[];
  terminalHistoryIdx: number;
  windowRefs?: WindowRefs;
  setWindowRefs?: (action: WindowRefsAction, ...args: any) => void;
};

export const initRefs: Refs = {
  keysDown: new Set(),
  keybinds: {},
  keybindDown: false,
  mousePos: new V2(0, 0),
  mouseDownPos: null,
  envOverrides: {},
  terminalRef: React.createRef() as React.MutableRefObject<HTMLInputElement>,
  terminalHistory: [],
  terminalHistoryIdx: 0,
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

  const setKeyRefs = (key: string | number, down: boolean = true, e?: KeyboardEvent) => {
    if (down) {
      refs.keysDown.add(key);
      if (key.toString().toLowerCase() in refs.keybinds) {
        refs.keybindDown = true;
      }
    } else {
      refs.keysDown.delete(key);
      if (refs.keybindDown && key.toString().toLowerCase() in refs.keybinds) {
        refs.keybinds[key.toString().toLowerCase()]();
      }
      refs.keybindDown = false;
      if (key === "Enter" && document.activeElement === refs.terminalRef.current) {
        terminalInput(refs.terminalRef.current.value);
        refs.terminalHistory.push(refs.terminalRef.current.value);
        refs.terminalRef.current.value = "";
        refs.terminalHistoryIdx = refs.terminalHistory.length;
      } else if (key === "/" && refs.terminalRef.current && document.activeElement !== refs.terminalRef.current) {
        refs.terminalRef.current.focus();
        refs.terminalHistoryIdx = refs.terminalHistory.length;
      } else if (key === "ArrowUp" && document.activeElement === refs.terminalRef.current) {
        refs.terminalHistoryIdx = Math.max(0, refs.terminalHistoryIdx - 1);
        if (refs.terminalHistoryIdx === refs.terminalHistory.length) {
          refs.terminalRef.current.value = "";
        } else {
          refs.terminalRef.current.value = refs.terminalHistory[refs.terminalHistoryIdx];
        }
      } else if (key === "ArrowDown" && document.activeElement === refs.terminalRef.current) {
        refs.terminalHistoryIdx = Math.min(refs.terminalHistory.length, refs.terminalHistoryIdx + 1);
        if (refs.terminalHistoryIdx === refs.terminalHistory.length) {
          refs.terminalRef.current.value = "";
        } else {
          refs.terminalRef.current.value = refs.terminalHistory[refs.terminalHistoryIdx];
        }
      }
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
      setKeyRefs(e.key, false, e);
    });
    document.addEventListener("mouseup", e => {
      setKeyRefs(e.button, false);
      refs.mouseDownPos = null;
    });
    document.addEventListener("mousemove", e => {
      refs.mousePos = new V2(e.clientX, e.clientY);
    })
  }, []); //eslint-disable-line

  const terminalInput = (s: string) => {
    console.log("-->" + s);
    const strings: string[] = s.split(" ");
    if (strings[0].toLowerCase() === "envvar" || strings[0].toLowerCase() === "envvars") {
      if (!strings[2] || strings[2].toLowerCase() === "null" || strings[2].toLowerCase() === "undefined") {
        if (!(strings[1].toUpperCase() in refs.envOverrides)) { return; }
        delete refs.envOverrides[strings[1].toUpperCase()];
      } else if (strings[2].toLowerCase() === "true") {
        refs.envOverrides[strings[1].toUpperCase()] = true;
      } else if (strings[2].toLowerCase() === "false") {
        refs.envOverrides[strings[1].toUpperCase()] = false;
      } else if (!isNaN(Number(strings[2]))) {
        refs.envOverrides[strings[1].toUpperCase()] = Number(strings[2]);
      } else {
        refs.envOverrides[strings[1].toUpperCase()] = strings[2];
      }
    } else if (strings[0].toLowerCase() === "physics") {
      const arg1 = strings[1].toLowerCase();
      if (arg1 === "off" || arg1 === "pause" || arg1 === "false") {
        refs.envOverrides["PHYSICS_PAUSED"] = true;
      } else if (arg1 === "on" || arg1 === "play" || arg1 === "true") {
        refs.envOverrides["PHYSICS_PAUSED"] = false;
      } else if (arg1 === "step") {
        if (refs.setWindowRefs) {
          refs.setWindowRefs(WindowRefsAction.STEP_PHYSICS);
        }
      }
    }
  }

  return (
    <>
    <AppContext.Provider value={{refs: refs, state, setState}}>
      <Window />
    </AppContext.Provider>
    <input id="terminal" type="text" name="terminal" ref={refs.terminalRef}/>
    </>
  );
}