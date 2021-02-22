import React from "react";

export interface Props {
  svgStyle?: Object;
  arrowStyle?: Object;
}

export const DropInto: React.FC<Props> = ({ svgStyle = {}, arrowStyle = {}}) => {
  return(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="dropInto"
      style={svgStyle}
    >    
      <g>
        <path
          preserveAspectRatio="false"
          style={{fill:"#216432",stroke:"#42c864",strokeWidth:"1px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1,fillOpacity:1, ...arrowStyle}}
          d="M 50,98.28571 7.5,69 V 58.642857 L 50,87.392858 92.678571,58.910715 92.857143,71.5 Z"
          className="arrow2"
        />
        <path
          preserveAspectRatio="false"
          style={{fill:"#216432",stroke:"#42c864",strokeWidth:"1px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1,fillOpacity:1, ...arrowStyle}}
          d="M 50.074545,41.817625 7.5745466,12.53191 V 2.1747674 L 50.074545,30.924768 92.753115,2.4426254 92.931685,15.03191 Z"
          className="arrow0"
        />
        <path
          style={{fill:"#216432",stroke:"#42c864",strokeWidth:"1px",strokeLinecap:"butt",strokeLinejoin:"miter",strokeOpacity:1,fillOpacity:1, ...arrowStyle}}
          d="M 50.074545,69.817625 7.574547,40.53191 V 30.174767 l 42.499998,28.750001 42.67857,-28.482143 0.17857,12.589285 z"
          className="arrow1"
        />
      </g>
    </svg>
  )
}