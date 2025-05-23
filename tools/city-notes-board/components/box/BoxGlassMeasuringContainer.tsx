import React from 'react';
import { motion } from 'framer-motion';

interface BoxGlassMeasuringContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

const markings = [100, 150, 200, 250, 300, 400];

const BoxGlassMeasuringContainer: React.FC<BoxGlassMeasuringContainerProps> = ({
  children,
  width = 60,
  height = 200,
}) => {
  // SVG dimensions
  const svgWidth = width;
  const svgHeight = height;
  const beakerWidth = svgWidth * 0.8;
  const beakerX = svgWidth * 0.1;
  const beakerY = 5;
  const beakerHeight = svgHeight - 10;
  const beakerRadius = 9;

  // Marking positions
  const markingStartY = beakerY + 15;
  const markingEndY = beakerY + beakerHeight - 10;
  const markingStep = (markingEndY - markingStartY) / (markings.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: svgWidth,
        height: svgHeight,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* SVG Beaker */}
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}
      >
        {/* Glass body */}
        <path
          d={`M${beakerX + 5},${beakerY + 4}
            Q${beakerX + 1},${beakerY + 1} ${beakerX + 9},${beakerY}
            L${beakerX + beakerWidth - 5},${beakerY}
            Q${beakerX + beakerWidth + 4},${beakerY + 1} ${beakerX + beakerWidth - 1},${beakerY + 4}
            L${beakerX + beakerWidth},${beakerY + beakerHeight - beakerRadius}
            Q${beakerX + beakerWidth},${beakerY + beakerHeight} ${beakerX + beakerWidth / 2},${beakerY + beakerHeight}
            Q${beakerX},${beakerY + beakerHeight} ${beakerX},${beakerY + beakerHeight - beakerRadius}
            Z`}
          fill="rgba(255,255,255,0.25)"
          stroke="#b0c4de"
          strokeWidth={2}
          filter="url(#glassShadow)"
        />
        {/* Spout */}
        <path
          d={`M${beakerX + 5},${beakerY + 4} Q${beakerX},${beakerY + 9} ${beakerX + 9},${beakerY}`}
          fill="none"
          stroke="#b0c4de"
          strokeWidth={2}
        />
        {/* Shine */}
        <ellipse
          cx={beakerX + beakerWidth * 0.25}
          cy={beakerY + beakerHeight * 0.4}
          rx={4}
          ry={beakerHeight * 0.18}
          fill="rgba(255,255,255,0.18)"
        />
        {/* Markings */}
        {markings.map((mark, i) => {
          const y = markingEndY - i * markingStep;
          return (
            <g key={mark}>
              <line
                x1={beakerX - 4}
                x2={beakerX + 11}
                y1={y}
                y2={y}
                stroke="#222"
                strokeWidth={1}
              />
              <text
                x={beakerX - 6}
                y={y + 2}
                fontSize={mark === 400 ? 8 : 6}
                fontWeight={mark === 400 ? 'bold' : 'normal'}
                fill="#222"
                textAnchor="end"
                fontFamily="monospace"
              >
                {mark}
                {mark === 400 ? ' ml' : ''}
              </text>
            </g>
          );
        })}
        {/* Volume label */}
        <text
          x={beakerX + 15}
          y={markingEndY - markingStep * 1.5}
          fontSize={5}
          fill="#222"
          fontFamily="monospace"
        >
          APPROX
        </text>
        <text
          x={beakerX + 15}
          y={markingEndY - markingStep * 1.1}
          fontSize={5}
          fill="#222"
          fontFamily="monospace"
        >
          VOLUMES
        </text>
        {/* Glass shadow filter */}
        <defs>
          <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#b0c4de" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>
      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          left: beakerX + 12,
          top: beakerY + 15,
          width: beakerWidth - 25,
          height: beakerHeight - 25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px',
          overflowY: 'auto',
          zIndex: 1,
          pointerEvents: 'auto',
          padding: '5px',
        }}
      >
        {/* Placeholder grid */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 25px)',
            gridAutoRows: '25px',
            gap: '5px',
            padding: '5px',
            pointerEvents: 'none',
            alignContent: 'end',
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              style={{
                border: '1px dashed rgba(0,0,0,0.1)',
                borderRadius: '3px',
                backgroundColor: 'rgba(0,0,0,0.02)',
              }}
            />
          ))}
        </div>
        {React.Children.map(children, (child, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -200 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: idx * 0.1,
              type: "spring",
              damping: 15,
              stiffness: 100,
              duration: 1.5
            }}
            style={{ 
              width: 'auto', 
              display: 'flex', 
              justifyContent: 'flex-start',
              position: 'relative',
              marginBottom: '5px',
              zIndex: 2,
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BoxGlassMeasuringContainer;
