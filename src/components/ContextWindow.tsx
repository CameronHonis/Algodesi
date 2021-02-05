import React from "react";
import gsap from "gsap";
import { BST } from "../models/BST";
import { DSType } from "../models/DS";
import { Node } from "../models/Node";
import { Refs as WindowRefs } from "../Window";
import { ContextWindowAction, Refs as ContextWindowActionRefs, RefsAction as ContextWindowActionRefsAction } from "./ContextWindowAction";
import Helpers from "../models/Helpers";
import { V2 } from "../models/V2";

export interface Props {
  windowRefs: WindowRefs;
}

export interface Refs {
  ref: React.MutableRefObject<HTMLDivElement>;
  items: {
    name: string;
    callback: (e: React.MouseEvent) => void;
    refs?: ContextWindowActionRefs;
    setRefs?: (action: ContextWindowActionRefsAction, arg: any) => void;
  }[];
  visible: boolean;
  height: number;
}

export const initRefs: Refs = {
  ref: React.createRef() as React.MutableRefObject<HTMLDivElement>,
  items: [],
  visible: false,
  height: 0,
}

export enum RefsAction {
  UPDATE_ITEMS = "UPDATE_ITEMS",
  SET_VISIBLE = "SET_VISIBLE",
}

export const ContextWindow: React.FC<Props> = ({ windowRefs }) => {
  const {current: refs } = React.useRef(initRefs);

  const [ state, setState ] = React.useState(0);

  const reactRender = () => {
    setState(state + 1);
  }

  const setRefs = (action: RefsAction, arg: any) => {
    if (action === RefsAction.UPDATE_ITEMS && (arg instanceof Node || !arg)) {
      refs.items = [];
      if (arg) {
        const nodeActions: [string, (e: React.MouseEvent) => void][] = arg.getContextActions();
        for (const [ name, callback ] of nodeActions) {
          refs.items.push({name, callback});
        }
        let dsActions: [string, (e: React.MouseEvent) => void][] = [];
        if (arg.ds && arg.ds.type === DSType.BST) {
          dsActions = (arg.ds as BST).getContextActions();
        }
        for (const [ name, callback ] of dsActions) {
          refs.items.push({name, callback});
        }
      }
      reactRender();
    }
  }

  React.useEffect(() => {
    windowRefs.contextWindowRefs = refs;
    windowRefs.contextWindowSetRefs = setRefs;
  })


  const itemComps: JSX.Element[] = [];
  for (let i = 0; i < refs.items.length; ++i) {
    itemComps.push(<ContextWindowAction windowRefs={windowRefs} contextWindowRefs={refs} itemIdx={i} key={i}/>);
  }
  let top: number = 0;
  let left: number = 0;
  const nodePixSize: V2 = Helpers.toPixelSize(windowRefs.screen.size, new V2(1,1));
  if (windowRefs.interacts.selectAnchor && windowRefs.interacts.selectAnchor.physics) {
    const anchorPixPos: V2 = Helpers.toPixelPos(windowRefs.screen.pos, windowRefs.screen.size, windowRefs.interacts.selectAnchor.physics.pos);
    
    top = anchorPixPos.y - .5*nodePixSize.y;
    left = anchorPixPos.x + .75*nodePixSize.x;
  }
  const height: string = nodePixSize.y*itemComps.length + "px";
  console.log("ContextWindow rerender");
  return(
    <div id="contextWindow" ref={refs.ref} style={{top, left, height}}>
      {itemComps}
    </div>
  )
}