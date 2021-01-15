import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import "./index.css";

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

document.addEventListener("keyup", e => {
  if (e.key.toLowerCase() === "q") {
    debugger;
  }
})