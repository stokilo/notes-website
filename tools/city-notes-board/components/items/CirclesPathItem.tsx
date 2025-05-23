import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CirclesPathItemProps {
  width: number;
  height: number;
  isAnimating?: boolean;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onCirclePositionChange?: (positions: Array<{ x: number; y: number }>) => void;
  initialCirclePositions?: Array<{ x: number; y: number }>;
  attachedTo?: string;
}

const CirclesPathItem: React.FC<CirclesPathItemProps> = ({
  width,
  height,
  isAnimating = false,
  position = { x: 0, y: 0 },
  onPositionChange,
  onCirclePositionChange,
  initialCirclePositions,
  attachedTo,
}) => {
  const [positions, setPositions] = useState(
    initialCirclePositions || [
      { x: width * 0.2, y: height * 0.5 },
      { x: width * 0.5, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.5 },
    ]
  );

  const [currentCircleIndex, setCurrentCircleIndex] = useState(0);
  const [draggedCircleIndex, setDraggedCircleIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate the bounds of all points
  const bounds = positions.reduce(
    (acc, pos) => ({
      minX: Math.min(acc.minX, pos.x),
      minY: Math.min(acc.minY, pos.y),
      maxX: Math.max(acc.maxX, pos.x),
      maxY: Math.max(acc.maxY, pos.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  // Add padding to the bounds
  const padding = 20;
  const svgBounds = {
    x: bounds.minX - padding,
    y: bounds.minY - padding,
    width: bounds.maxX - bounds.minX + padding * 2,
    height: bounds.maxY - bounds.minY + padding * 2,
  };

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCurrentCircleIndex((prev) => (prev + 1) % 3);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleCircleMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDraggedCircleIndex(index);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedCircleIndex !== null && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;

        const newPositions = [...positions];
        newPositions[draggedCircleIndex] = { x, y };
        setPositions(newPositions);
        onCirclePositionChange?.(newPositions);
      }
    };

    const handleMouseUp = () => {
      setDraggedCircleIndex(null);
    };

    if (draggedCircleIndex !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedCircleIndex, positions, onCirclePositionChange]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '100%',
        height: '100%',
      }}
    >
      {/* Dotted lines between points */}
      <svg
        style={{
          position: 'absolute',
          left: svgBounds.x,
          top: svgBounds.y,
          width: svgBounds.width,
          height: svgBounds.height,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible',
        }}
      >
        {/* Line from point 1 to point 2 */}
        <line
          x1={positions[0].x - svgBounds.x}
          y1={positions[0].y - svgBounds.y}
          x2={positions[1].x - svgBounds.x}
          y2={positions[1].y - svgBounds.y}
          stroke="rgba(74, 144, 226, 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Line from point 2 to point 3 */}
        <line
          x1={positions[1].x - svgBounds.x}
          y1={positions[1].y - svgBounds.y}
          x2={positions[2].x - svgBounds.x}
          y2={positions[2].y - svgBounds.y}
          stroke="rgba(74, 144, 226, 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Line from point 3 to point 1 */}
        <line
          x1={positions[2].x - svgBounds.x}
          y1={positions[2].y - svgBounds.y}
          x2={positions[0].x - svgBounds.x}
          y2={positions[0].y - svgBounds.y}
          stroke="rgba(74, 144, 226, 0.3)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Static circles */}
      {positions.map((pos, index) => (
        <div
          key={index}
          onMouseDown={(e) => handleCircleMouseDown(e, index)}
          style={{
            position: 'absolute',
            left: pos.x - 4,
            top: pos.y - 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'rgba(74, 144, 226, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
            cursor: 'move',
            zIndex: 2,
          }}
        />
      ))}

      {/* Animated circle */}
      {isAnimating && (
        <motion.div
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'rgba(74, 144, 226, 0.6)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 8px rgba(74, 144, 226, 0.4)',
            zIndex: 1,
          }}
          animate={{
            x: positions[currentCircleIndex].x - 6,
            y: positions[currentCircleIndex].y - 6,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

export default CirclesPathItem; 