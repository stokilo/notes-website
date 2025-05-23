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
        width,
        height,
      }}
    >
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