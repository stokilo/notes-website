import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  segments?: number;
  segmentGap?: number;
  rotation?: number; // Rotation in degrees
  isAnimating?: boolean;
}

const ArrowItem: React.FC<ArrowItemProps> = ({
  width = 120,
  height = 40,
  segments = 3,
  segmentGap = 4,
  rotation = 0,
  isAnimating = false,
}) => {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    // Generate random pastel colors for segments
    const newColors = Array.from({ length: segments }, () => {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 70%, 65%)`;
    });
    setColors(newColors);
  }, [segments]);

  // Calculate segment width accounting for gaps
  const totalGapWidth = segmentGap * (segments - 1);
  const segmentWidth = (width - totalGapWidth) / segments;
  const arrowHeadSize = height * 0.8;

  return (
    <motion.div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        transformOrigin: 'center',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Arrow segments */}
      {colors.map((color, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: isAnimating ? [0, 1, 1, 0] : 1,
              opacity: isAnimating ? [0, 1, 1, 0] : 1,
            }}
            transition={{
              duration: 3,
              repeat: isAnimating ? Infinity : 0,
              repeatDelay: 0.5,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
              delay: index * 0.2,
            }}
            style={{
              width: segmentWidth,
              height: height * 0.4,
              backgroundColor: color,
              position: 'relative',
              transformOrigin: 'left',
              borderRadius: '2px',
            }}
          >
            {/* Segment highlight */}
            <motion.div
              animate={{ 
                opacity: isAnimating ? [0, 0.5, 0] : 0,
                x: isAnimating ? [0, segmentWidth, 0] : 0,
              }}
              transition={{
                opacity: {
                  duration: 2,
                  repeat: isAnimating ? Infinity : 0,
                  ease: "easeInOut",
                },
                x: {
                  duration: 2,
                  repeat: isAnimating ? Infinity : 0,
                  ease: "easeInOut",
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                borderRadius: '2px',
              }}
            />
          </motion.div>
          {/* Add gap after each segment except the last one */}
          {index < segments - 1 && (
            <div style={{ width: segmentGap }} />
          )}
        </React.Fragment>
      ))}

      {/* Arrow head */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ 
          scale: isAnimating ? [0, 1, 1, 0] : 1,
          rotate: isAnimating ? [-45, 0, 0, -45] : 0,
        }}
        transition={{
          duration: 3,
          repeat: isAnimating ? Infinity : 0,
          repeatDelay: 0.5,
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1],
          delay: segments * 0.2,
        }}
        style={{
          width: arrowHeadSize,
          height: arrowHeadSize,
          position: 'relative',
          marginLeft: -arrowHeadSize / 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Arrow head shape */}
        <div
          style={{
            width: arrowHeadSize,
            height: arrowHeadSize,
            borderTop: `${height * 0.2}px solid ${colors[colors.length - 1]}`,
            borderRight: `${height * 0.2}px solid ${colors[colors.length - 1]}`,
            transform: 'rotate(45deg)',
            borderRadius: '2px',
            position: 'relative',
          }}
        >
          {/* Arrow head highlight */}
          <motion.div
            animate={{ 
              opacity: isAnimating ? [0, 0.5, 0] : 0,
              scale: isAnimating ? [1, 1.2, 1] : 1,
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: isAnimating ? Infinity : 0,
                ease: "easeInOut",
              },
              scale: {
                duration: 2,
                repeat: isAnimating ? Infinity : 0,
                ease: "easeInOut",
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
              borderRadius: '2px',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ArrowItem; 