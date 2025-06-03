import React from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  rotation?: number;
  animated?: boolean;
}

const ArrowItem: React.FC<ArrowItemProps> = ({
  width = 120,
  height = 40,
  rotation = 0,
  animated = true,
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
      setDashOffset((prev) => (prev + dt * 0.03) % (dashArray * 2)); // slower
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
        {/* Arrow shaft */}
        <motion.line
          x1={shaftStart.x}
          y1={shaftStart.y}
          x2={shaftEnd.x}
          y2={shaftEnd.y}
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