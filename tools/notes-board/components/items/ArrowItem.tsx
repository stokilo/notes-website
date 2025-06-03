import React from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  rotation?: number;
  animated?: boolean;
  curve?: number; // Add curve property (-1 to 1, where 0 is straight)
}

const ArrowItem: React.FC<ArrowItemProps> = ({
  width = 120,
  height = 40,
  rotation = 0,
  animated = true,
  curve = 0, // Default to straight arrow
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
    if (!animated) {
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
  }, [animated]);

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
      </svg>
    </motion.div>
  );
};

export default ArrowItem; 