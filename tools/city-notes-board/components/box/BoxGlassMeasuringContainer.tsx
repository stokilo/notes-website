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
  width = 120,
  height = 240,
}) => {
  // SVG dimensions
  const svgWidth = width;
  const svgHeight = height;
  const beakerWidth = svgWidth * 0.8;
  const beakerX = svgWidth * 0.1;
  const beakerY = 10;
  const beakerHeight = svgHeight - 20;
  const beakerRadius = 18;

  // Marking positions
  const markingStartY = beakerY + 30;
  const markingEndY = beakerY + beakerHeight - 20;
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
          d={`M${beakerX + 10},${beakerY + 8}
            Q${beakerX + 2},${beakerY + 2} ${beakerX + 18},${beakerY}
            L${beakerX + beakerWidth - 10},${beakerY}
            Q${beakerX + beakerWidth + 8},${beakerY + 2} ${beakerX + beakerWidth - 2},${beakerY + 8}
            L${beakerX + beakerWidth},${beakerY + beakerHeight - beakerRadius}
            Q${beakerX + beakerWidth},${beakerY + beakerHeight} ${beakerX + beakerWidth / 2},${beakerY + beakerHeight}
            Q${beakerX},${beakerY + beakerHeight} ${beakerX},${beakerY + beakerHeight - beakerRadius}
            Z`}
          fill="rgba(255,255,255,0.25)"
          stroke="#b0c4de"
          strokeWidth={3}
          filter="url(#glassShadow)"
        />
        {/* Spout */}
        <path
          d={`M${beakerX + 10},${beakerY + 8} Q${beakerX},${beakerY + 18} ${beakerX + 18},${beakerY}`}
          fill="none"
          stroke="#b0c4de"
          strokeWidth={3}
        />
        {/* Shine */}
        <ellipse
          cx={beakerX + beakerWidth * 0.25}
          cy={beakerY + beakerHeight * 0.4}
          rx={8}
          ry={beakerHeight * 0.18}
          fill="rgba(255,255,255,0.18)"
        />
        {/* Markings */}
        {markings.map((mark, i) => {
          const y = markingEndY - i * markingStep;
          return (
            <g key={mark}>
              <line
                x1={beakerX - 8}
                x2={beakerX + 22}
                y1={y}
                y2={y}
                stroke="#222"
                strokeWidth={2}
              />
              <text
                x={beakerX - 12}
                y={y + 4}
                fontSize={mark === 400 ? 15 : 12}
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
          x={beakerX + 30}
          y={markingEndY - markingStep * 1.5}
          fontSize={10}
          fill="#222"
          fontFamily="monospace"
        >
          APPROX
        </text>
        <text
          x={beakerX + 30}
          y={markingEndY - markingStep * 1.1}
          fontSize={10}
          fill="#222"
          fontFamily="monospace"
        >
          VOLUMES
        </text>
        {/* Glass shadow filter */}
        <defs>
          <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#b0c4de" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>
      {/* Content overlay */}
      <div
        style={{
          position: 'absolute',
          left: beakerX + 25,
          top: beakerY + 30,
          width: beakerWidth - 50,
          height: beakerHeight - 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          overflowY: 'auto',
          zIndex: 1,
          pointerEvents: 'auto',
        }}
      >
        {React.Children.map(children, (child, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BoxGlassMeasuringContainer;
