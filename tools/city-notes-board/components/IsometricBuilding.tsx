import React, { useState } from 'react';

interface IsometricBuildingProps {
  label?: string;
  onLabelChange?: (newLabel: string) => void;
  size?: number;
}

const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  label,
  onLabelChange,
  size = 50,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');

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
    if (e.key === 'Enter') handleLabelSubmit();
    else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label || '');
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
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
      {/* Isometric image */}
      <img
        src="/house.svg"
        alt="House"
        style={{
          width: size,
          height: size,
          display: 'block',
        }}
      />
    </div>
  );
};

export default IsometricBuilding; 