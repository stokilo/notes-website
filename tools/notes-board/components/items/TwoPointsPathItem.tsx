import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TwoPointsPathItemProps {
  width: number;
  height: number;
  isAnimating?: boolean;
  position: { x: number; y: number };
  circlePositions?: Array<{ x: number; y: number }>;
  onPositionsChange?: (positions: Array<{ x: number; y: number }>) => void;
}

const TwoPointsPathItem: React.FC<TwoPointsPathItemProps> = ({
  width,
  height,
  isAnimating = false,
  circlePositions,
  onPositionsChange,
}) => {
  const [positions, setPositions] = useState(
    circlePositions || [
      { x: width * 0.2, y: height * 0.5 },
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
      setCurrentCircleIndex((prev) => (prev + 1) % 2);
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
        onPositionsChange?.(newPositions);
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
  }, [draggedCircleIndex, positions, onPositionsChange]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* Dotted line between points */}
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
        <line
          x1={positions[0].x - svgBounds.x}
          y1={positions[0].y - svgBounds.y}
          x2={positions[1].x - svgBounds.x}
          y2={positions[1].y - svgBounds.y}
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

export default TwoPointsPathItem; 