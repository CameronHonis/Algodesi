import React from "react";

export interface Props {
  svgStyle?: Object,
  borderStyle?: Object,
  fillerStyle?: Object,
}

export const Checkbox: React.FC<Props> = ({svgStyle = {}, borderStyle = {}, fillerStyle = {}}) => {

  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      version="1.1"
      style={svgStyle}
    > 
      <g>
        <path
          style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:168.378,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1, ...borderStyle}}
          d="M 10 0 C 4.46 0 0 4.46 0 10 L 0 90 C 0 95.54 4.46 100 10 100 L 90 100 C 95.54 100 100 95.54 100 90 L 100 10 C 100 4.46 95.54 0 90 0 L 10 0 z M 18 10 L 82 10 C 86.432 10 90 13.568 90 18 L 90 82 C 90 86.432 86.432 90 82 90 L 18 90 C 13.568 90 10 86.432 10 82 L 10 18 C 10 13.568 13.568 10 18 10 z "
          className="checkboxBorder" />
        <rect
          style={{fill:"#ffffff",fillOpacity:1,stroke:"none",strokeWidth:56.6929,strokeMiterlimit:4,strokeDasharray:"none",strokeOpacity:1, ...fillerStyle}}
          className="checkboxFill"
          width="50"
          height="50"
          x="25"
          y="25"
          ry="5" />
      </g>
    </svg>
  );
}