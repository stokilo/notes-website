import React, { useState } from 'react';

interface IsometricStreetProps {
  width?: number;
  length?: number;
  color?: string;
  hasSidewalk?: boolean;
  hasMarkings?: boolean;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const IsometricStreet: React.FC<IsometricStreetProps> = ({
  width = 50,
  length = 100,
  color = '#4a4a4a',
  hasSidewalk = true,
  hasMarkings = true,
  label,
  onLabelChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const sidewalkColor = '#e0e0e0';
  const roadMarkingColor = '#ffffff';
  const sidewalkWidth = width * 0.15;

  const handleLabelClick = () => {
    setIsEditing(true);
    setEditValue(label || '');
  };

  const handleLabelSubmit = () => {
    setIsEditing(false);
    if (onLabelChange && editValue !== label) {
      onLabelChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label || '');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Label Container */}
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
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={handleLabelClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                width: '100%',
                outline: 'none',
                textAlign: 'center',
              }}
              autoFocus
            />
          ) : (
            label
          )}
        </div>
      )}

      {/* Isometric Street SVG */}
      <svg
        width={length}
        height={width}
        viewBox={`0 0 ${length} ${width}`}
        style={{
          display: 'block',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Shadow */}
        <path
          d={`M0 0 L${length} 0 L${length} ${width} L0 ${width} Z`}
          fill="rgba(0,0,0,0.2)"
          filter="blur(4px)"
        />

        {/* Main road */}
        <path
          d={`M0 0 L${length} 0 L${length} ${width} L0 ${width} Z`}
          fill={color}
        />

        {/* Road markings */}
        {hasMarkings && (
          <>
            {/* Center line */}
            <path
              d={`M0 ${width/2} L${length} ${width/2}`}
              stroke={roadMarkingColor}
              strokeWidth="4"
              strokeDasharray="20 20"
              opacity="0.8"
            />
            {/* Side lines */}
            <path
              d={`M0 ${width/4} L${length} ${width/4}`}
              stroke={roadMarkingColor}
              strokeWidth="2"
              opacity="0.6"
            />
            <path
              d={`M0 ${width*3/4} L${length} ${width*3/4}`}
              stroke={roadMarkingColor}
              strokeWidth="2"
              opacity="0.6"
            />
          </>
        )}

        {/* Sidewalks */}
        {hasSidewalk && (
          <>
            {/* Top sidewalk */}
            <path
              d={`M0 0 L${length} 0 L${length} ${sidewalkWidth} L0 ${sidewalkWidth} Z`}
              fill={sidewalkColor}
            />
            {/* Bottom sidewalk */}
            <path
              d={`M0 ${width-sidewalkWidth} L${length} ${width-sidewalkWidth} L${length} ${width} L0 ${width} Z`}
              fill={sidewalkColor}
            />
            {/* Left sidewalk */}
            <path
              d={`M0 0 L${sidewalkWidth} 0 L${sidewalkWidth} ${width} L0 ${width} Z`}
              fill={sidewalkColor}
            />
            {/* Right sidewalk */}
            <path
              d={`M${length-sidewalkWidth} 0 L${length} 0 L${length} ${width} L${length-sidewalkWidth} ${width} Z`}
              fill={sidewalkColor}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default IsometricStreet; 