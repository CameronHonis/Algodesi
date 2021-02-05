import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import "./index.css";

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
/*

TODO:
-look into performance benefits for avoiding using class methods for tween calcs
-fix initial render on window not firing "renderPos()" and "renderSize()"
-/convert all overriding functions to incorporate a rest parameter
-/add toString func to Node class
-test BST
-/add pos-size tween syncing
-render BST

IDEAS:
-for animating DSs on the window, collect a "last-state" value of the whole DS class on appState and store in local refs. Compare "last-state" to current state on
  state change and animate the changes accordingly

TAKEAWAYS:


*/