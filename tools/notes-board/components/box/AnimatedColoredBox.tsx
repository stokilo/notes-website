import React from 'react';

interface AnimatedColoredBoxProps {
  width?: number;
  height?: number;
  color?: string;
  children?: React.ReactNode;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
  style?: React.CSSProperties;
}

const AnimatedColoredBox: React.FC<AnimatedColoredBoxProps> = ({
  width = 20,
  height = 20,
  color = '#f0f0f0',
  children,
  isNew = false,
  finalPosition,
  style = {},
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: finalPosition?.x || 0,
        top: finalPosition?.y || 0,
        width,
        height,
        ...style,
      }}
    >
      <div
        style={{
          width,
          height,
          backgroundColor: color,
          border: `1px solid ${color}20`,
          borderRadius: '3px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AnimatedColoredBox;
