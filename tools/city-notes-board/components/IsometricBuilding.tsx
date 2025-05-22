import React, { useState, useRef } from 'react';

interface IsometricBuildingProps {
  label?: string;
  onLabelChange?: (newLabel: string) => void;
  size?: number;
  width?: number;
  height?: number;
}

const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  label,
  onLabelChange,
  size = 50,
  width,
  height,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const actualSize = width || size;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
    setEditValue(label || '');
    // Use setTimeout to ensure the input is mounted before selecting
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 0);
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

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div style={{ position: 'relative', width: actualSize, height: actualSize }}>
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
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            minWidth: 'max-content',
          }}
          onClick={handleLabelClick}
          onMouseDown={(e) => e.preventDefault()}
        >
          {isEditing ? (
            <input
              ref={inputRef}
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
                minWidth: '100%',
                outline: 'none',
                textAlign: 'center',
                userSelect: 'text',
                padding: 0,
                margin: 0,
                boxSizing: 'border-box',
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
        draggable="false"
        onDragStart={handleDragStart}
        style={{
          width: actualSize,
          height: actualSize,
          display: 'block',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default IsometricBuilding; 