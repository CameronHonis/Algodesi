import { BST } from "./BST";
import { V2 } from "./V2";
import Helpers from "./Helpers";

const readline = require("readline").createInterface(process.stdin, process.stdout);
readline.on("line", (input: string): void => {
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

const bst0: BST = new BST([1,2,3], true);


/*} else if (action === NodeRefsAction.SET_MOUSE_DOWN_IN && typeof isDown === "boolean") {
  refs.mouseDownIn = isDown;
  if (isDown) {
    setWindowRefs(WindowRefsAction.SET_CLAMPED, node);
    if (evt) {
      setWindowRefs(WindowRefsAction.SET_CLAMPED_PIX_POS, new V2(evt.clientX, evt.clientY));
    }
  } else {
    if (refs.mouseOver) {
      if (refs.interacts.selected) {
        setWindowRefs(WindowRefsAction.SET_SELECT_ANCHOR, null);
      } else {
        setWindowRefs(WindowRefsAction.SET_SELECT_ANCHOR, node);
      }
      updateSelected();
    }
    updateHighlighted();
  } */

  // SET_CLAMPED //
  // SET_MOUSE_DOWN_POS //
  // SET_SELECT_ANCHOR
  // UPDATE HIGHLIGHTED
  // UPDATE SELECTED