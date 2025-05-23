import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  segments?: number;
  segmentGap?: number;
}

const ArrowItem: React.FC<ArrowItemProps> = ({
  width = 120,
  height = 40,
  segments = 3,
  segmentGap = 4,
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
    <div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Arrow segments */}
      {colors.map((color, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: 1, 
              opacity: 1,
              transition: {
                duration: 0.3,
                delay: index * 0.2,
                ease: "easeOut"
              }
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
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
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
          scale: 1, 
          rotate: 0,
          transition: {
            duration: 0.3,
            delay: segments * 0.2,
            type: "spring",
            stiffness: 200
          }
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
          }}
        >
          {/* Arrow head highlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                delay: segments * 0.2,
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
    </div>
  );
};

export default ArrowItem; 