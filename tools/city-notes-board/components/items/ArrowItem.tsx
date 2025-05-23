import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ArrowItemProps {
  width?: number;
  height?: number;
  segments?: number;
  segmentGap?: number;
  rotation?: number;
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
  const [segmentSizes, setSegmentSizes] = useState<number[]>([]);

  useEffect(() => {
    // Generate vibrant colors with good contrast
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = Array.from({ length: segments }, (_, i) => {
      const hue = (baseHue + (i * 60)) % 360; // 60-degree hue separation for good contrast
      return `hsl(${hue}, 85%, 60%)`;
    });
    setColors(newColors);

    // Generate varying segment sizes
    const baseSize = height * 0.6;
    const sizes = Array.from({ length: segments }, (_, i) => {
      const variation = baseSize * (0.8 + Math.random() * 0.4); // 80% to 120% of base size
      return variation;
    });
    setSegmentSizes(sizes);
  }, [segments, height]);

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
        padding: '0 4px',
      }}
    >
      {/* Circular segments */}
      {colors.map((color, index) => (
        <React.Fragment key={index}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isAnimating ? [0, 1, 1, 0] : 1,
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
              width: segmentSizes[index],
              height: segmentSizes[index],
              position: 'relative',
            }}
          >
            <svg
              width="100%"
              height="100%"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <defs>
                <radialGradient id={`gradient-${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: color, stopOpacity: 1 }} />
                </radialGradient>
                <filter id={`glow-${index}`}>
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill={`url(#gradient-${index})`}
                filter={`url(#glow-${index})`}
              />
              {isAnimating && (
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1, 1, 0],
                    opacity: [0, 0.8, 0.8, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    ease: "easeInOut",
                    times: [0, 0.3, 0.7, 1],
                    delay: index * 0.2,
                  }}
                />
              )}
            </svg>
          </motion.div>
          {index < segments - 1 && (
            <div style={{ width: segmentGap }} />
          )}
        </React.Fragment>
      ))}

      {/* Arrow head */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isAnimating ? [0, 1, 1, 0] : 1,
          opacity: isAnimating ? [0, 1, 1, 0] : 1,
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
          marginLeft: segmentGap,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <defs>
            <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: colors[colors.length - 1], stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: colors[colors.length - 1], stopOpacity: 1 }} />
            </linearGradient>
            <filter id="arrow-glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d={`M ${arrowHeadSize * 0.2},0 L ${arrowHeadSize},${arrowHeadSize/2} L ${arrowHeadSize * 0.2},${arrowHeadSize} Z`}
            fill="url(#arrow-gradient)"
            filter="url(#arrow-glow)"
          />
          {isAnimating && (
            <motion.path
              d={`M ${arrowHeadSize * 0.2},0 L ${arrowHeadSize},${arrowHeadSize/2} L ${arrowHeadSize * 0.2},${arrowHeadSize} Z`}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.8, 0.8, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 0.5,
                ease: "easeInOut",
                times: [0, 0.3, 0.7, 1],
                delay: segments * 0.2,
              }}
            />
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default ArrowItem; 