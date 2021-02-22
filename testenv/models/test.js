"use strict";
exports.__esModule = true;
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
rl.on("line", function (input) {
    console.log("--> " + input);
});
// V2----------------------------------------------
// console.log(new V2(1,1).originAngle()); // .8
// console.log(new V2(-1,-1).originAngle()); // 4
// console.log(new V2(0,1).originAngle()); // 1.57
// console.log(new V2(0,-1).originAngle()); // 4.71
// console.log(new V2(-1,0).originAngle()); // 3.14
// console.log(new V2(1,0).originAngle()); // 0
// console.log(new V2(1,1).minOriginAngle()); // .8
// console.log(new V2(-1,-1).minOriginAngle()); // 2.4
// console.log(new V2(0,1).minOriginAngle()); // 1.57
// console.log(new V2(1, 0).minOriginAngle()); // 0
// HELPERS----------------------------------------
// console.log(Helpers.snapAngle(Math.PI/4 + 2*Math.PI)) // .785
// console.log(Helpers.snapAngle(-Math.PI)) // 3.14
// console.log(Helpers.snapAngle(-Math.PI, -2*Math.PI)); // -3.14
// console.log(Helpers.snapAngle(Math.PI/4, 6*Math.PI)) // 19.63
// console.log(Helpers.snapAngle(3*Math.PI/2, -Math.PI)) // -1.57
// console.log(Helpers.snapAngle(Math.PI/4, -Math.PI)) // .785
// M3 ----------------------------------------
// const m3: M3 = new M3(new V2(0,0), new V2(1,1));
// console.log(m3.toString());
// console.log(m3.translate(new V2(0, 1)).toString());
// console.log(m3.translate(new V2(1, 0)).toString());
// console.log(m3.translate(new V2(-1, 0)).toString());
// console.log(m3.translate(new V2(0, -1)).toString());
// console.log(m3.inverse().toString());
// const m3b: M3 = new M3(new V2(5,5), new V2(-10,3));
// console.log(m3b.toString());
// console.log(m3b.inverse().toString());
// TRI ----------------------------------------------
// const p0: V2 = new V2(-10.196917649906116, -0.10707013860339988);
// const p1: V2 = new V2(-8.545165175734917, 1.629568592930228);
// const p2: V2 = new V2(1.2359161916146686, 1.7487291537114518);
// const p3: V2 = new V2(-2.0525680238739556, 1.569006341383164);
// console.log(new Tri(p0, p1, p2).pointInTri2(p3));
// console.log(new Tri(p0,p1,p2).pointInTri(new V2(100,100)));
// DSPhysics ---------------------------------------
// const bst0: BST = new BST(true);
// const node0: Node = new Node(bst0, 0);
// bst0.insert(node0);
// const node0Phys: NodePhysics = new NodePhysics(node0, new V2(0,.5));
// const node1: Node = new Node(bst0, 1);
// bst0.insert(node1);
// const node1Phys: NodePhysics = new NodePhysics(node1, new V2(1,0));
// const node2: Node = new Node(bst0, 2);
// bst0.insert(node2);
// const node2Phys: NodePhysics = new NodePhysics(node2, new V2(.5,0));
// const node3: Node = new Node(bst0, 3);
// bst0.insert(node3);
// const node3Phys: NodePhysics = new NodePhysics(node3, new V2(0, 1));
// const node4: Node = new Node(bst0, 4);
// bst0.insert(node4);
// const node4Phys: NodePhysics = new NodePhysics(node4, new V2(-2, 0));
// const node5: Node = new Node(bst0, 5);
// bst0.insert(node5);
// const node5Phys: NodePhysics = new NodePhysics(node5, new V2(0, -1));
// const node6: Node = new Node(bst0, 6);
// bst0.insert(node6);
// const node6Phys: NodePhysics = new NodePhysics(node6, new V2(-.5,-.5));
// const bst0Phys: DSPhysics = new DSPhysics(bst0);
// node0Phys.pos = new V2(0,.5);
// node1Phys.pos = new V2(1,0);
// node2Phys.pos = new V2(.5,0);
// node3Phys.pos = new V2(0,1);
// node4Phys.pos = new V2(-2,0);
// node5Phys.pos = new V2(0,-1);
// node6Phys.pos = new V2(-.5,-.5);
// bst0Phys.updateHull2();
// console.log("\n");
// for (let node of bst0Phys.hull) {
//   console.log(node.toString());
// }
// console.log(bst0Phys.center?.toString());
// console.log(bst0Phys.hullRadius);
// BST -----------------------------------------------
// const bst0: BST = new BST(true); 
// const node0: Node = new Node(bst0, 0);
// const node1: Node = new Node(bst0, 1);
// const node2: Node = new Node(bst0, 2);
// const node3: Node = new Node(bst0, 3);
// const node4: Node = new Node(bst0, 4);
// const node5: Node = new Node(bst0, 5);
// const node6: Node = new Node(bst0, 6);
// bst0.insert([node2, node1, node0, node3, node4, node5, node6]);
// console.log(bst0.treeString());
// bst0.remove(node0);
// console.log(bst0.treeString());
// console.log(bst0.nodes);
