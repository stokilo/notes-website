import React from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  rotation?: number;
  animated?: boolean;
  isAnimating?: boolean;
  curve?: number; // Add curve property (-1 to 1, where 0 is straight)
  label?: string; // Add label property
}

const ArrowItem: React.FC<ArrowItemProps> = ({
  width = 120,
  height = 40,
  rotation = 0,
  animated = true,
  isAnimating = false,
  curve = 0, // Default to straight arrow
  label, // Add label to props
}) => {
  // Arrow shaft coordinates
  const shaftStart = { x: height * 0.3, y: height / 2 };
  // Add a gap before the arrowhead
  const gap = 6;
  // Make pointer 20% smaller
  const arrowHeadLength = height * 0.36 * 0.8;
  const arrowHeadWidth = height * 0.36 * 0.8;
  const shaftEnd = { x: width - height * 0.3 - gap - arrowHeadLength, y: height / 2 };
  const arrowTip = { x: width - height * 0.3, y: height / 2 };
  const dashArray = 10;

  // Calculate control point for the curve
  const controlPoint = {
    x: (shaftStart.x + shaftEnd.x) / 2,
    y: shaftStart.y + (curve * height * 0.5) // Adjust curve height based on the curve parameter
  };

  // Animate dash offset (optionally)
  const [dashOffset, setDashOffset] = React.useState(0);
  React.useEffect(() => {
    if (!animated || !isAnimating) {
      setDashOffset(0);
      return;
    }
    let frame: number;
    let last = Date.now();
    const animate = () => {
      const now = Date.now();
      const dt = now - last;
      last = now;
      setDashOffset((prev) => (prev + dt * 0.009) % (dashArray * 2)); // slower
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [animated, isAnimating]);

  // Calculate label position based on rotation
  const getLabelTransform = () => {
    // Adjust label position based on rotation angle
    const angle = rotation % 360;
    let yOffset = -10; // Default offset above the arrow
    
    // Adjust vertical position based on rotation
    if (angle > 45 && angle <= 135) {
      yOffset = 20; // Below the arrow for downward pointing
    } else if (angle > 135 && angle <= 225) {
      yOffset = 20; // Below the arrow for leftward pointing
    } else if (angle > 225 && angle <= 315) {
      yOffset = -10; // Above the arrow for upward pointing
    }
    
    return `translate(${width / 2}, ${height / 2 + yOffset}) rotate(${-rotation})`;
  };

  return (
    <motion.div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center',
        transform: `rotate(${rotation}deg)`
      }}
    >
      <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
        {/* Arrow shaft - using quadratic Bezier curve */}
        <motion.path
          d={`M ${shaftStart.x} ${shaftStart.y} Q ${controlPoint.x} ${controlPoint.y} ${shaftEnd.x} ${shaftEnd.y}`}
          fill="none"
          stroke="#000"
          strokeWidth={4}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
        {/* Arrow head (white fill, black border) */}
        <polygon
          points={`
            ${arrowTip.x},${arrowTip.y} 
            ${arrowTip.x - arrowHeadLength},${arrowTip.y - arrowHeadWidth / 2} 
            ${arrowTip.x - arrowHeadLength},${arrowTip.y + arrowHeadWidth / 2}
          `}
          fill="#fff"
          stroke="#000"
          strokeWidth={3}
        />
        {/* Label */}
        {label && (
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fill="#000"
            fontSize="14"
            style={{
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            transform={getLabelTransform()}
          >
            {label}
          </text>
        )}
      </svg>
    </motion.div>
  );
};

export default ArrowItem; 