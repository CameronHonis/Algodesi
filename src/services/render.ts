import gsap from "gsap";
import Helpers from "../models/Helpers";
import { V2 } from "../models/V2";
import { Message, Refs as WindowRefs, RefsAction as WindowRefsAction } from "../Window";
import { M2 } from "../models/M2";
import { Node } from "../models/Node";
import { NodePhysics } from "../models/NodePhysics";
import { DSPhysics } from "../models/DSPhysics";
import { Refs as NodeCompRefs } from "../components/NodeComp";
import * as ENV from "../envVars";
import { ContextAction } from "../components/MainContext";
import { DS, DSType } from "../models/DS";
import { BST } from "../models/BST";

export const windowRender = (refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void, 
dt: number = 0): void => {
  for (const dsRef of Object.values(refs.dataStructures)) {
    renderDSTris(refs, dsRef);
  }
  for (const { node, comp, physics } of Object.values(refs.nodes)) {
    const nodeDiv: HTMLDivElement = comp.current;
    if (!nodeDiv) { continue; }
    const nodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, physics.pos);
    const nodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1, 1)).abs();
    renderNodes(nodeDiv, nodePixPos, nodePixSize);
    if (node.left && node.left.id in refs.nodes) {
      renderEdgeComp(refs, node, node.left, false);
    }
    if (node.right && node.right.id in refs.nodes) {
      renderEdgeComp(refs, node, node.right, false);
    }
    // annotations vvv
    renderPosLabels(node, nodePixPos, nodePixSize);
    renderForcesVectors(refs, node);
  }
  for (const { cloneNode, comp } of Object.values(refs.ghostNodes)) {
    if (!cloneNode.physics) { continue; }
    const ghostNodeDiv: HTMLDivElement = comp.current;
    if (!ghostNodeDiv) { continue; }
    const nodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, cloneNode.physics.pos).add(refs.inputs.mousePos.add(refs.inputs.mouseDownPos.scale(-1)));
    const nodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1, 1)).abs();
    renderNodes(ghostNodeDiv, nodePixPos, nodePixSize);
    if (cloneNode.left && cloneNode.left.id in refs.ghostNodes) {
      renderEdgeComp(refs, cloneNode, cloneNode.left, true);
    }
    if (cloneNode.right && cloneNode.right.id in refs.ghostNodes) {
      renderEdgeComp(refs, cloneNode, cloneNode.right, true);
    }
  }
  uiRender(refs, setRefs, dt);
}

export const uiRender = (refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void, dt: number = 0): void => {
  renderMainContext(refs);
  renderEditNode(refs);
  renderAddNode(refs, dt);
  renderMessages(refs, setRefs, dt);
}

export const renderDSTris = (refs: WindowRefs, dsRef: {ds: DS, physics: DSPhysics, hullTriRefs: React.MutableRefObject<SVGSVGElement>[]}): void => {
  if (!dsRef.ds) { return; }
  if (!dsRef.physics) { return; }
  if (dsRef.physics.hull.length !== dsRef.hullTriRefs.length) { return; }
  if (!(0 in dsRef.physics.hull)) { return; }
  if (!dsRef.physics.hull[0].physics) { return; }
  const pixPos0: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, dsRef.physics.hull[0].physics.pos)
    .parallelProduct(100/window.innerWidth, 100/window.innerHeight);
  for (let i = 0; i < dsRef.physics.hull.length; ++i) {
    const j: number = (i-1+dsRef.physics.hull.length) % dsRef.physics.hull.length;
    if (!dsRef.hullTriRefs[j].current) { continue; }
    if (!(j in dsRef.physics.hull)) { continue; }
    if (!dsRef.physics.hull[j].physics) { continue; }
    const k: number = (i-2+dsRef.physics.hull.length) % dsRef.physics.hull.length;
    if (!dsRef.hullTriRefs[k].current) { continue; }
    if (!(k in dsRef.physics.hull)) { continue; }
    if (!dsRef.physics.hull[k].physics) { continue; }
    const path: SVGPathElement | null = dsRef.hullTriRefs[i].current.querySelector("path");
    if (!path) { continue; }
    const pixPos1: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, dsRef.physics.hull[j].physics!.pos)
      .parallelProduct(100/window.innerWidth, 100/window.innerHeight);
    const pixPos2: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, dsRef.physics.hull[k].physics!.pos)
      .parallelProduct(100/window.innerWidth, 100/window.innerHeight);
    path.setAttribute("d", "M " + pixPos0.x + "," + pixPos0.y + " " + pixPos1.x + "," + pixPos1.y + " "
      + pixPos2.x + "," + pixPos2.y + " Z");
  }
}

export const renderNodes = (nodeDiv: HTMLDivElement, nodePixPos: V2, nodePixSize: V2): void => {
  const nodeSVG: SVGSVGElement | null = nodeDiv.querySelector("svg");
  const nodeP: HTMLParagraphElement | null = nodeDiv.querySelector(".nodeValue");
  if (!nodeSVG || !nodeP) { return; }
  nodeDiv.style.left = nodePixPos.x + "px";
  nodeDiv.style.top = nodePixPos.y + "px";
  nodeDiv.style.width = nodePixSize.x + "px";
  nodeDiv.style.height = nodePixSize.y + "px";
  if (nodeP.textContent?.length === 1) {
    nodeP.style.fontSize = nodePixSize.y * .85 + "px";
  } else if (nodeP.textContent?.length === 2) {
    nodeP.style.fontSize = nodePixSize.y * .65 + "px";
  } else {
    nodeP.style.fontSize = nodePixSize.y * .5 + "px";
  }
  nodeP.style.lineHeight = nodePixSize.y + "px";
  nodeP.style.height = nodePixSize.y + "px";
}

export const renderEdgeComp = (refs: WindowRefs, node1: Node, node2: Node, isGhost: boolean): void => {
  const edgeId: string = node1.id + "-" + node2.id;
  if (isGhost) {
    if (!(edgeId in refs.ghostEdges)) { return; }
    if (!(refs.ghostEdges[edgeId].comp.current)) { return; }
    const edgeDiv: HTMLDivElement = refs.ghostEdges[edgeId].comp.current;
    edgeDiv.style.background = "rgba(255,255,255,.3)";
    edgeDiv.style.zIndex = "13";
    const thickness: number = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs().x / 6.5;
    const screenPos1: V2 = node1.physics!.pos.add(Helpers.toScreenSize(refs.screen.size, 
      refs.inputs.mousePos.add(refs.inputs.mouseDownPos.scale(-1))));
    const screenPos2: V2 = node2.physics!.pos.add(Helpers.toScreenSize(refs.screen.size,
      refs.inputs.mousePos.add(refs.inputs.mouseDownPos.scale(-1))));
    if (screenPos1.equals(screenPos2)) { return; }
    const pos1: V2 = screenPos1.add(screenPos2.add(screenPos1.scale(-1)).unit().scale(.48));
    const pos2: V2 = screenPos2.add(screenPos1.add(screenPos2.scale(-1)).unit().scale(.48));
    new M2(pos1, pos2).fitDiv(edgeDiv, refs.screen.pos, refs.screen.size, thickness, thickness);
  } else if (!isGhost) {
    if (!(edgeId in refs.edges)) { return; }
    if (!refs.edges[edgeId].comp.current) { return; }
    if (!(node1.id in refs.nodes) || !(node2.id in refs.nodes)) { return; }
    if (!refs.nodes[node1.id].compRefs) { return; }
    if (!refs.nodes[node2.id].compRefs) { return; }
    const edgeDiv: HTMLDivElement = refs.edges[edgeId].comp.current;
    const node1CompRefs: NodeCompRefs = refs.nodes[node1.id].compRefs!;
    const node2CompRefs: NodeCompRefs = refs.nodes[node2.id].compRefs!;
    let color1: string = "rgb(0,200,200)";
    let color2: string = "rgb(0,200,200)";
    let dur: number = .15;
    if (refs.interacts.selectAnchor === node1) {
      color1 = "rgb(255,255,100)";
      dur = 0;
    } else if (node1CompRefs.interacts.selected) {
      color1 = "rgb(255,200,50)";
      dur = 0;
    } else if (node1CompRefs.interacts.highlighted) {
      color1 = "rgb(150,200,100)";
    }
    if (refs.interacts.selectAnchor === node2) {
      color2 = "rgb(255,255,100)";
      dur = 0;
    } else if (node2CompRefs.interacts.selected) {
      color2 = "rgb(255,200,50)";
      dur = 0;
    } else if (node2CompRefs.interacts.highlighted) {
      color2 = "rgb(150,200,100)";
    }
    const thickness: number = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs().x / 6.5;
    const pos1: V2 = node1.physics!.pos.add(node2.physics!.pos.add(node1.physics!.pos.scale(-1)).unit().scale(.48));
    const pos2: V2 = node2.physics!.pos.add(node1.physics!.pos.add(node2.physics!.pos.scale(-1)).unit().scale(.48));
    new M2(pos1, pos2).fitDiv(edgeDiv, refs.screen.pos, refs.screen.size, thickness, thickness);
    edgeDiv.style.zIndex = "3";
    gsap.killTweensOf(edgeDiv);
    gsap.to(edgeDiv, {background: "linear-gradient(90deg," + color1 + "," + color2 + ")", duration: dur});
  }
}

export const renderPosLabels = (node: Node, nodePixPos: V2, nodePixSize: V2): void => {
  if (!ENV.NODE_POS_LABELS) {
    return;
  }
  if (ENV.NODE_POS_LABELS_WHITELIST.size && !ENV.NODE_POS_LABELS_WHITELIST.has(node.id)) {
    return;
  }
  if (!node.physics) { return; }
  const posAnno: HTMLParagraphElement | null = document.querySelector("#node" + node.id + "label1");
  if (posAnno) {
    posAnno.style.left = nodePixPos.x + nodePixSize.x/2 + 5 + "px";
    posAnno.style.top = nodePixPos.y - nodePixSize.y/2 + "px";
    posAnno.textContent = "pos: " + node.physics.pos.toString(3);
  }
};

export const renderForcesVectors = (refs: WindowRefs, node: Node): void => {
  if (!ENV.NODE_FORCES_VECTORS) {
    return;
  }
  if (ENV.NODE_FORCES_VECTORS_WHITELIST.size && !ENV.NODE_FORCES_VECTORS_WHITELIST.has(node.id)) {
    return;
  }
  if (!node.physics) { return; }
  let lastIdx: number = 0;
  for (let i = 0; i < node.physics.forces.length; ++i) {
    if (ENV.FORCES_VECTORS_WHITELIST.size && !ENV.FORCES_VECTORS_WHITELIST.has(node.physics.forces[i][1])) {
      continue;
    }
    lastIdx = i;
    const forceVector: HTMLDivElement | null = document.querySelector("#node" + node.id + "vector" + i);
    if (forceVector) {
      forceVector.style.backgroundColor = ENV.NODE_FORCES_VECTORS_COLORS[ENV.ForceType[node.physics.forces[i][1]] as ENV.ForceTypeKeys];
      new M2(node.physics.pos, node.physics.pos.add(node.physics.forces[i][0].scale(.1))).fitDiv(forceVector, refs.screen.pos, refs.screen.size);
    } else { console.warn("ran out of free force vector divs"); }
  }
  for (let i = lastIdx + 1; i < 20; ++i) {
    const forceVector: HTMLDivElement | null = document.querySelector("#node" + node.id + "vector" + i);
    if (forceVector) {
      forceVector.style.backgroundColor = "rgba(0,0,0,0)";
    }
  }
}

export const renderMainContext = (refs: WindowRefs): void => {
  if (!refs.ui.mainContextRefs) { return; }
  if (!refs.ui.mainContextRefs.ref.current) { return; }
  if (refs.ui.mainContextRefs.visible) {
    refs.ui.mainContextRefs.ref.current.style.visibility = "visible";
  } else {
    refs.ui.mainContextRefs.ref.current.style.visibility = "hidden";
  }
  let anchorPixPos: V2 | undefined = undefined;
  if (refs.ui.mainContextRefs.position instanceof V2) {
    anchorPixPos = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, 
      refs.ui.mainContextRefs.position.add(refs.ui.mainContextRefs.offset));
  } else if (refs.ui.mainContextRefs.position instanceof NodePhysics) {
    anchorPixPos = Helpers.toPixelPos(refs.screen.pos, refs.screen.size,
      refs.ui.mainContextRefs.position.pos.add(refs.ui.mainContextRefs.offset));
  } else if (refs.ui.mainContextRefs.position instanceof DSPhysics && refs.ui.mainContextRefs.position.center) {
    anchorPixPos = Helpers.toPixelPos(refs.screen.pos, refs.screen.size,
      refs.ui.mainContextRefs.position.center.add(refs.ui.mainContextRefs.offset));
  }
  if (anchorPixPos) {
    refs.ui.mainContextRefs.ref.current.style.top = anchorPixPos.y + "px";
    refs.ui.mainContextRefs.ref.current.style.left = anchorPixPos.x + "px";
  }
  const anchorPixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs();
  refs.ui.mainContextRefs.ref.current.style.borderRadius = anchorPixSize.y/8 + "px";
  const lines: NodeListOf<HTMLDivElement> = refs.ui.mainContextRefs.ref.current.querySelectorAll(".mainContextLine");
  for (let line of lines) {
    line.style.height = anchorPixSize.y/25 + "px";
  }
  for (const item of Object.values(refs.ui.mainContextRefs.items)) {
    renderMainContextItem(refs, item);
  }
};

export const renderMainContextItem = (refs: WindowRefs, item: ContextAction): void => {
  const { refs: itemRefs, checkbox }: ContextAction = item;
  if (!itemRefs) { return; }
  if (!itemRefs.ref?.current) { return; }
  const anchorPixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs();
  const colors: [number, number, number, number?] = Helpers.rgbaStringToArray(item.color || "rgb(255,255,255)");
  colors[3] = colors[3] || 1;
  itemRefs.ref.current.style.fontSize = anchorPixSize.y/2 + "px";
  itemRefs.ref.current.style.height = anchorPixSize.y + "px";
  itemRefs.ref.current.style.lineHeight = anchorPixSize.y + "px";
  itemRefs.ref.current.style.paddingLeft = anchorPixSize.y/3 + "px";
  gsap.killTweensOf(itemRefs.ref.current);
  if (itemRefs.inputs.mouseDown) {
    itemRefs.ref.current.style.backgroundColor = "rgba(40,40,40,1)";
    itemRefs.ref.current.style.color = "rgba(" + colors[0] + "," + colors[1] + "," + colors[2] + "," + colors[3] + ")";
  } else if (itemRefs.inputs.mouseOver) {
    itemRefs.ref.current.style.backgroundColor = "rgba(50,50,50,1)";
    itemRefs.ref.current.style.color = "rgba(" + colors[0] + "," + colors[1] + "," + colors[2] + "," + colors[3] + ")";
  } else {
    gsap.to(itemRefs.ref.current, {backgroundColor: "rgba(70,70,70,0)", 
    color: "rgba(" + .75*colors[0] + "," + .75*colors[1] + "," + .75*colors[2] + "," + .75*colors[3] + ")", duration: .15});
  }
  const itemChildren: HTMLCollection = itemRefs.ref.current.children;
  for (let itemChild of itemChildren) {
    (itemChild as HTMLElement).style.marginRight = anchorPixSize.y/3 + "px";
  }
  const renderCheckbox = () => {
    if (checkbox) {
      const checkboxSVG: SVGSVGElement | null = itemRefs.ref!.current.querySelector("svg");
      if (!checkboxSVG) { return; }
      checkboxSVG.style.height = .4*anchorPixSize.y + "px";
      checkboxSVG.style.width = .4*anchorPixSize.y + "px";
      const border: SVGPathElement | null = checkboxSVG.querySelector(".checkboxBorder");
      if (!border) { return; }
      const filler: SVGRectElement | null = checkboxSVG.querySelector(".checkboxFill");
      if (!filler) { return; }
      filler.style.fillOpacity = checkbox() ? "1" : "0";
      gsap.killTweensOf(border);
      gsap.killTweensOf(filler);
      if (itemRefs.inputs.mouseOver) {
        border.style.fill = "rgba(" + colors[0] + "," + colors[1] + "," + colors[2] + "," + colors[3] + ")";
        filler.style.fill = "rgba(" + colors[0] + "," + colors[1] + "," + colors[2] + "," + colors[3] + ")";
      } else {
        gsap.to(border, {fill: "rgba(" + .75*colors[0] + "," + .75*colors[1] + "," + .75*colors[2] + "," + .75*colors[3]! + ")", duration: .15});
        gsap.to(filler, {fill: "rgb(" + .75*colors[0] + "," + .75*colors[1] + "," + .75*colors[2] + "," + .75*colors[3]! + ")", duration: .15});
      }
    }
  }; renderCheckbox();
  
}

export const renderEditNode = (refs: WindowRefs): void => {
  if (!refs.ui.editNodeRefs) { return; }
  if (refs.ui.editNodeRefs.visible) {
    if (!refs.interacts.selectAnchor) { return; }
    if (!refs.interacts.selectAnchor.physics) { return; }
    if (!refs.ui.editNodeRefs.ref.current) { return; }
    refs.ui.editNodeRefs.ref.current.style.visibility = "visible";
    const nodeSVG: SVGSVGElement | null = refs.ui.editNodeRefs.ref.current.querySelector("svg");
    const nodeInput: HTMLInputElement | null = refs.ui.editNodeRefs.ref.current.querySelector("input");
    if (!nodeSVG || !nodeInput) { return; }
    const nodePixPos: V2 = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, refs.interacts.selectAnchor.physics.pos);
    const nodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs();
    refs.ui.editNodeRefs.ref.current.style.left = nodePixPos.x + "px";
    refs.ui.editNodeRefs.ref.current.style.top = nodePixPos.y + "px";
    refs.ui.editNodeRefs.ref.current.style.width = nodePixSize.x + "px";
    refs.ui.editNodeRefs.ref.current.style.height = nodePixSize.y + "px";
    if (refs.ui.editNodeRefs.text.length === 1) {
      nodeInput.style.fontSize = nodePixSize.y * .85 + "px";
    } else if (refs.ui.editNodeRefs.text.length === 2) {
      nodeInput.style.fontSize = nodePixSize.y * .65 + "px";
    } else {
      nodeInput.style.fontSize = nodePixSize.y * .5 + "px";
    }
    nodeInput.value = refs.ui.editNodeRefs.text;
    nodeInput.style.lineHeight = nodePixSize.y + "px";
    nodeInput.style.height = nodePixSize.y + "px";
    if (!refs.ui.editNodeRefs.changeMade) {
      nodeInput.select();
    }
  } else {
    refs.ui.editNodeRefs.ref.current.style.visibility = "hidden";
  }
}

export const renderAddNode = (refs: WindowRefs, dt: number): void => {
  if (!refs.ui.addNodeRefs) { return; }
  if (!refs.ui.addNodeRefs.ref.current) { return; }
  if (refs.ui.addNodeRefs.visible) {
    if (!refs.interacts.selectAnchor) { return; }
    if (!refs.interacts.selectAnchor.ds) { return; }
    let addNodePixPos: V2, dropIntoPixPos: V2;
    if (refs.interacts.selectAnchor.ds.type === DSType.BST) {
      const bst: BST = refs.interacts.selectAnchor.ds as BST;
      if (!bst.root) { return; }
      if (!bst.root.physics) { return; }
      addNodePixPos = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, bst.root.physics.pos.add(new V2(0, 4)));
      dropIntoPixPos = Helpers.toPixelPos(refs.screen.pos, refs.screen.size, bst.root.physics.pos.add(new V2(0, 2)));
    } else {
      return;
    }
    refs.ui.addNodeRefs.ref.current.style.visibility = "visible";
    const addNodeDiv: HTMLDivElement | null = refs.ui.addNodeRefs.ref.current.querySelector("div");
    if (!addNodeDiv) { return; }
    const addNodeSVG: SVGSVGElement | null = addNodeDiv.querySelector("svg");
    if (!addNodeSVG) { return; }
    const addNodePixSize: V2 = Helpers.toPixelSize(refs.screen.size, new V2(1,1)).abs();
    addNodeDiv.style.left = addNodePixPos.x + "px";
    addNodeDiv.style.top = addNodePixPos.y + "px";
    addNodeDiv.style.width = addNodePixSize.x + "px";
    addNodeDiv.style.height = addNodePixSize.y + "px";
    const addNodeInput: HTMLInputElement | null = addNodeDiv.querySelector("input");
    if (!addNodeInput) { return; }
    if (refs.ui.addNodeRefs.text.length === 1) {
      addNodeInput.style.fontSize = addNodePixSize.y * .85 + "px";
    } else if (refs.ui.addNodeRefs.text.length === 2) {
      addNodeInput.style.fontSize = addNodePixSize.y * .65 + "px";
    } else {
      addNodeInput.style.fontSize = addNodePixSize.y * .5 + "px";
    }
    addNodeInput.value = refs.ui.addNodeRefs.text;
    addNodeInput.style.lineHeight = addNodePixSize.y + "px";
    addNodeInput.style.height = addNodePixSize.y + "px";
    const dropInto: SVGSVGElement | null = refs.ui.addNodeRefs.ref.current.querySelector(".dropInto");
    if (!dropInto) { return; }
    dropInto.style.top = dropIntoPixPos.y + "px";
    dropInto.style.left = dropIntoPixPos.x + "px";
    dropInto.style.width = addNodePixSize.x * .9 + "px";
    dropInto.style.height = addNodePixSize.y * 1.5 + "px";
    const arrow0: SVGPathElement | null = dropInto.querySelector(".arrow0");
    const arrow1: SVGPathElement | null = dropInto.querySelector(".arrow1");
    const arrow2: SVGPathElement | null = dropInto.querySelector(".arrow2");
    if (arrow0 && arrow1 && arrow2) {
      refs.ui.addNodeRefs.anims.arrowTime += dt;
      arrow0.style.fillOpacity = (.75 * Math.max(0, Math.sin(5*refs.ui.addNodeRefs.anims.arrowTime))).toString();
      arrow1.style.fillOpacity = (.75 * Math.max(0, Math.sin(5*refs.ui.addNodeRefs.anims.arrowTime - Math.PI/3))).toString();
      arrow2.style.fillOpacity = (.75 * Math.max(0, Math.sin(5*refs.ui.addNodeRefs.anims.arrowTime - Math.PI*2/3))).toString();
      arrow0.style.strokeOpacity = arrow0.style.fillOpacity;
      arrow1.style.strokeOpacity = arrow1.style.fillOpacity;
      arrow2.style.strokeOpacity = arrow2.style.fillOpacity;
    }
    const annotation: HTMLParagraphElement | null = refs.ui.addNodeRefs.ref.current.querySelector("p");
    if (annotation) {
      annotation.style.top = addNodePixPos.y - 2.5*addNodePixSize.y + "px";
      annotation.style.left = addNodePixPos.x + "px";
      annotation.style.fontSize = addNodePixSize.y * .5 + "px";
    }
    if (!refs.ui.addNodeRefs.changeMade) {
      addNodeInput.focus();
    }
  } else {
    refs.ui.addNodeRefs.ref.current.style.visibility = "hidden";
  }
}

export const renderMessages = (refs: WindowRefs, setRefs: (action: WindowRefsAction, ...args: any) => void, dt: number) => {
  const removeIdxs: number[] = [];
  for (let i = 0; i < refs.ui.messages.length; ++i) {
    const message: Message = refs.ui.messages[i];
    message.time += dt;
    const messageRef: HTMLParagraphElement | null = message.ref.current;
    if (!messageRef) { return; }
    const runoffFactor: number = 15;
    const topPix: number = .1*window.innerHeight*(1.5 - Math.pow(message.time, runoffFactor)/Math.pow(ENV.MESSAGE_DURATION, runoffFactor));
    const opacity: number = 1 - Math.pow(message.time, runoffFactor)/Math.pow(ENV.MESSAGE_DURATION, runoffFactor);
    messageRef.style.top = topPix + "px";
    messageRef.style.opacity = opacity.toString();
    if (message.time > ENV.MESSAGE_DURATION) {
      removeIdxs.push(i);
    }
  }
  for (let i = removeIdxs.length - 1; i >= 0; --i) {
    setRefs(WindowRefsAction.REMOVE_MESSAGE, removeIdxs[i]);
  }
}