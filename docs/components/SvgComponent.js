import React, { useRef, useEffect } from 'react';
import { SVG } from '@svgdotjs/svg.js';
// import '@svgdotjs/svg.js/dist/svg.min.css'; // Optional, for default styling

const SvgComponent = ({ width = 600, height = 300, drawFunction }) => {
  const svgRef = useRef(null); // Ref to the SVG container

  useEffect(() => {
    // Initialize SVG.js only once, after the component mounts
    if (svgRef.current) {
      // Clear any existing SVG content if needed (e.g., on re-renders)
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      const draw = SVG()
        .addTo(svgRef.current)
        .size(width, height);

      // Call the drawFunction to draw the SVG content
      if (drawFunction) {
        drawFunction(draw);
      }

      // Cleanup function (optional):  If you need to remove event listeners or do other cleanup
      return () => {
        draw.clear(); // Clear the SVG on unmount
      };
    }
  }, [width, height, drawFunction]);  // Dependency array - re-run effect if these change

  return (
    <div ref={svgRef} style={{ width: width, height: height }}>
      {/* SVG.js will draw inside this div */}
    </div>
  );
};

export default SvgComponent;