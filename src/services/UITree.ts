import Helpers from "../models/Helpers";
import { Refs as WindowRefs, RefsAction as WindowRefsAction, UILockMode } from "../Window";
import { ItemsCategory, RefsAction as MainContextRefsAction } from "../components/MainContext";
import { RefsAction as EditNodeRefsAction } from "../components/EditNode";
import { RefsAction as AddNodeRefsAction } from "../components/AddNode";
import { Refs as AppRefs } from "../App";
import { V2 } from "../models/V2";
import { uiRender } from "./render";
import { DSType } from "../models/DS";
import { BST } from "../models/BST";

enum Change {
  ADD = "ADD",
  SUB = "SUB"
}

export const updateTree = (
  appRefs: AppRefs,
  refs: WindowRefs, 
  setRefs: (action: WindowRefsAction, ...args: any) => void, 
  newTree: number[]
): void => {
  const processRequest = (): (([Change.ADD, number] | [Change.SUB])[] | false) => {
    if (refs.ui.treeLock === UILockMode.LOCKED) { return false; }
    if (refs.ui.treeLock === UILockMode.NO_BACK && refs.ui.tree.length > newTree.length) { return false; }
    if (refs.ui.treeLock === UILockMode.NO_FORWARD && refs.ui.tree.length < newTree.length) { return false; }
    const changes: ([Change.ADD, number] | [Change.SUB])[] = [];
    const imTree: number[] = [...refs.ui.tree];
    while (imTree.length !== newTree.length || imTree[imTree.length-1] !== newTree[newTree.length-1]) {
      if (imTree.length <= newTree.length) {
        if (imTree[imTree.length-1] !== newTree[imTree.length-1]) {
          changes.push([Change.SUB]);
          imTree.pop();
        } else {
          changes.push([Change.ADD, newTree[imTree.length]]);
          imTree.push(newTree[imTree.length]);
        }
      } else {
        changes.push([Change.SUB]);
        imTree.pop();
      }
      if (refs.ui.treeLock === UILockMode.STEP && changes.length > 1) { return false; }
    }
    return changes;
  }
  const changes = processRequest();
  if (!changes) { return; }
  for (let change of changes) { // tree-change ui actions (relative, direction dependent setters)
    const lastTree: number[] = [...refs.ui.tree];
    if (change[0] === Change.ADD) {
      console.log("add " + change[1] + " to [" + refs.ui.tree + "]");
      refs.ui.tree.push(change[1]);
    } else if (change[0] === Change.SUB) {
      console.log("sub from [" + refs.ui.tree + "]");
      refs.ui.tree.pop();
    }
    if (Helpers.shallowArrayCompare(lastTree, [])) { // from []

    } else if (Helpers.shallowArrayCompare(lastTree, [0])) { // from [0]
      if (change[0] === Change.ADD && change[1] === 0) { // to [0,0]
        if (refs.ui.mainContextSetRefs) {
          refs.ui.mainContextSetRefs(MainContextRefsAction.SET_VISIBLE, false);
        }
      } else if (change[0] === Change.ADD && change[1] === 1) { // to [0,1]
        if (refs.ui.mainContextSetRefs) {
          refs.ui.mainContextSetRefs(MainContextRefsAction.SET_VISIBLE, false);
        }
      } else if (change[0] === Change.SUB) { // to []
        if (refs.ui.mainContextSetRefs) { 
          refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_VISIBLE, false); 
        }
      }
    } else if (Helpers.shallowArrayCompare(lastTree, [0,0])) { // from [0,0]
      if (change[0] === Change.SUB) {
        if (refs.ui.editNodeSetRefs) {
          refs.ui.editNodeSetRefs(EditNodeRefsAction.SET_VISIBLE, false);
        }
        setRefs(WindowRefsAction.SET_LOCKED, false);
      }
    } else if (Helpers.shallowArrayCompare(lastTree, [0,1])) { // from [0,1]
      if (change[0] === Change.SUB) {
        if (refs.ui.addNodeSetRefs) {
          refs.ui.addNodeSetRefs(AddNodeRefsAction.SET_VISIBLE, false);
        }
        setRefs(WindowRefsAction.SET_LOCKED, false);
      }
    }
  }

  // non-tree-change ui actions (absolute, non-directional setters)
  if (Helpers.shallowArrayCompare(refs.ui.tree, [])) { // at []
    
  } else if (Helpers.shallowArrayCompare(refs.ui.tree, [0])) { // at [0]
    if (refs.ui.mainContextSetRefs) {
      refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_VISIBLE, true);
      refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_ITEMS, ItemsCategory.NODE_SELECT);
      if (refs.interacts.selectAnchor && refs.interacts.selectAnchor.physics) {
        refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_POSITION, 
          refs.interacts.selectAnchor.physics, new V2(.75, .75));
      }
    }
  } else if (Helpers.shallowArrayCompare(refs.ui.tree, [0,0])) { // at [0,0]
    if (refs.ui.editNodeSetRefs) { 
      refs.ui.editNodeSetRefs!(EditNodeRefsAction.SET_VISIBLE, true); 
    }
    if (refs.ui.mainContextSetRefs) {
      refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_ITEMS, ItemsCategory.EDIT_NODE);
    }
    if (refs.interacts.selectAnchor && refs.interacts.selectAnchor.physics) {
      setRefs(WindowRefsAction.SET_LOCKED, true);
      setRefs(WindowRefsAction.SET_LOCKED_POS, refs.interacts.selectAnchor.physics);
      setRefs(WindowRefsAction.SET_LOCKED_SIZE, new V2(Math.min(refs.screen.size.x,10), 
        Math.min(refs.screen.size.x,10)*window.innerHeight/window.innerWidth));
    }
  } else if (Helpers.shallowArrayCompare(refs.ui.tree, [0,1])) { // at [0,1]
    if (refs.interacts.selectAnchor && refs.interacts.selectAnchor.ds) {
      if (refs.interacts.selectAnchor.ds.type === DSType.BST) {
        const bst: BST = refs.interacts.selectAnchor.ds as BST;
        if (bst.root && bst.root.physics) {
          if (refs.ui.addNodeSetRefs) {
            refs.ui.addNodeSetRefs!(AddNodeRefsAction.SET_VISIBLE, true);
          }
          if (refs.ui.mainContextSetRefs) {
            refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_ITEMS, ItemsCategory.ADD_NODE);
            refs.ui.mainContextSetRefs!(MainContextRefsAction.SET_POSITION, bst.root.physics, new V2(1, 4.75));
          }
          setRefs(WindowRefsAction.SET_LOCKED, true);
          setRefs(WindowRefsAction.SET_LOCKED_POS, bst.root.physics, new V2(0, 4));
          setRefs(WindowRefsAction.SET_LOCKED_SIZE, new V2(Math.min(refs.screen.size.x,15), 
            Math.min(refs.screen.size.x,15)*window.innerHeight/window.innerWidth));
        }
      }
    }
  }
  uiRender(refs, setRefs, 0);
}