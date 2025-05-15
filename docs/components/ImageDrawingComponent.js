import React, { useRef, useEffect, useCallback, useState } from 'react';
import { SVG } from '@svgdotjs/svg.js';
// import '@svgdotjs/svg.js/dist/svg.min.css';

const ImageDrawingComponent = ({ imageUrl, width = 400, height = 300 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null); // Ref to the svgContainer div
  const [drawing, setDrawing] = useState(false); // Track if drawing is in progress
  const [path, setPath] = useState(null);        // Current drawing path
  const [points, setPoints] = useState([]);     // Array to store points for the path
  const [draw, setDraw] = useState(null);         // SVG draw instance

  const handleMouseDown = (event) => {
    if (!draw) return;  // Ensure SVG canvas is initialized

    setDrawing(true);

    // Get the mouse position relative to the image
    const rect = containerRef.current.getBoundingClientRect();  // Get container position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPoints([{ x, y }]);  // Start a new path
    const newPath = draw.polyline([[x, y]]).fill('none').stroke({ width: 2, color: 'red' });
    setPath(newPath);


    var text = draw.text(function(add) {
      add.tspan( "Drawing inside the image ? ------>" )
    })

    var textPath = text.path('M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80')

    textPath.animate(4000).ease('<>')
      .plot('M10 80 C 40 150, 65 150, 95 80 S 150 10, 180 80')
      .loop(true, true)


    const centerX = width / 2;
    const centerY = height / 2;

    // Triangle dimensions (adjust as needed)
    const triangleSize = Math.min(width, height) / 4; // Make it proportional to the image
    const triangleX = centerX - triangleSize / 2;
    const triangleY = centerY - triangleSize / 2;

    // Circle dimensions (adjust as needed)
    const circleRadius = triangleSize * 1.5;  // Circle size related to triangle
    const circleX = centerX;
    const circleY = centerY;

    // Create the circle
    const circle = draw.circle(circleRadius)
      .center(circleX, circleY)
      .fill('rgba(255, 0, 0, 0.5)'); // Semi-transparent black circle

    // Draw the play button triangle (pointing to the right)
    const triangle = draw.polygon([
      [triangleX, triangleY], // Top-left
      [triangleX + triangleSize, centerY], // Center-right
      [triangleX, triangleY + triangleSize]  // Bottom-left
    ])
      .fill('white');

    // Prevent default behavior that may cause the image to be dragged
    event.preventDefault();

    // Disable pointer-events on image to avoid problems with drawing outside image bounds
    containerRef.current.style.pointerEvents = 'auto';
  };

  const handleMouseMove = (event) => {
    if (!drawing || !draw || !path) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setPoints(prevPoints => [...prevPoints, { x, y }]); // Add new point
    path.plot(points.map(p => [p.x, p.y]).concat([[x, y]]));  // Update the path
  };

  const handleMouseUp = () => {
    setDrawing(false);
    containerRef.current.style.pointerEvents = 'none'; // Re-enable pointer events on the image
  };

  //Effect to initialize SVG draw
  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      const newDraw = SVG()
        .addTo(svgRef.current)
        .size('100%', '100%')  // Make SVG canvas responsive to container size
        .viewbox(0, 0, width, height); // Set initial viewbox

      setDraw(newDraw);
    }
    return () => {
      if (draw) {
        draw.clear();
      }
    };
  }, [width, height]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp} // Important: Stop drawing if mouse leaves the container
    >
      <img id="myImage" src={imageUrl} alt="Base Image" style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div
        id="svgContainer"
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',  // Make SVG container responsive
          height: '100%', // Make SVG container responsive
          pointerEvents: 'none',
        }}
      ></div>
    </div>
  );
};

export default ImageDrawingComponent;