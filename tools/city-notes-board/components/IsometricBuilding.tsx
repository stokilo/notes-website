import React, { useState } from 'react';

interface IsometricBuildingProps {
  color?: string;
  size?: number;
  height?: number;
  windows?: number;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  color = '#4a90e2',
  size = 50,
  height = 40,
  windows = 4,
  label,
  onLabelChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const windowSize = size / 6;
  const windowSpacing = size / 4;
  const windowRows = Math.floor(Math.sqrt(windows));
  const windowCols = Math.ceil(windows / windowRows);

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
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        transform: 'rotateX(60deg) rotateZ(-45deg)',
        transformStyle: 'preserve-3d',
      }}
    >
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

      {/* Base shadow */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: 'rgba(0,0,0,0.2)',
          transform: 'translateZ(-1px)',
          filter: 'blur(4px)',
        }}
      />
      
      {/* Main building */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          transform: 'translateZ(0)',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      />

      {/* Side walls */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: height,
          backgroundColor: color,
          transform: `translateZ(${size / 2}px) rotateX(90deg)`,
          filter: 'brightness(0.9)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: size,
          height: height,
          backgroundColor: color,
          transform: `translateZ(${size / 2}px) rotateY(90deg)`,
          filter: 'brightness(0.8)',
        }}
      />

      {/* Roof */}
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size / 2}px solid ${color}`,
          transform: `translateZ(${height}px) rotateX(45deg)`,
          filter: 'brightness(0.7)',
        }}
      />

      {/* Windows */}
      {Array.from({ length: windowRows }).map((_, row) =>
        Array.from({ length: windowCols }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              width: windowSize,
              height: windowSize,
              backgroundColor: '#fff',
              transform: `translateZ(1px) translate(${
                (col + 0.5) * windowSpacing - windowSize / 2
              }px, ${(row + 0.5) * windowSpacing - windowSize / 2}px)`,
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
            }}
          />
        ))
      )}

      {/* Door */}
      <div
        style={{
          position: 'absolute',
          width: size / 4,
          height: size / 3,
          backgroundColor: '#8B4513',
          transform: `translateZ(1px) translate(${size / 2 - size / 8}px, ${size - size / 3}px)`,
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
};

export default IsometricBuilding; 