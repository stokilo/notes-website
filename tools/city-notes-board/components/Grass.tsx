import React from 'react';

interface GrassProps {
  width?: number;
  height?: number;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const Grass: React.FC<GrassProps> = ({
  width = 100,
  height = 100,
  label,
  onLabelChange,
}) => {
  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            minWidth: 'max-content',
          }}
        >
          {label}
        </div>
      )}
      {/* Grass area */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#90EE90',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #98FB98 0%, #90EE90 100%)',
          borderRadius: '4px',
          border: '1px solid #7CCD7C',
        }}
      />
    </div>
  );
};

export default Grass; 