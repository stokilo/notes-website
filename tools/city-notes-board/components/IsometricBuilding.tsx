import React, { useState, useRef, useEffect } from 'react';

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
  const [hueRotate, setHueRotate] = useState(0);
  const [saturate, setSaturate] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const actualSize = width || size;

  useEffect(() => {
    // Randomize colors on component mount
    setHueRotate(Math.random() * 360); // Random hue rotation (0-360)
    setSaturate(80 + Math.random() * 40); // Random saturation (80-120%)
    setBrightness(90 + Math.random() * 20); // Random brightness (90-110%)
  }, []);

  useEffect(() => {
    if (label === '') {
      setIsEditing(true);
      setEditValue('');
      // Use setTimeout to ensure the input is mounted before selecting
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 0);
    }
  }, [label]);

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
      {(label !== undefined || isEditing) && (
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
            setEditValue(label || '');
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.select();
              }
            }, 0);
          }}
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
      {/* Isometric image with randomized colors */}
      <img
        src="/images/house.png"
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
          filter: `hue-rotate(${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}%)`,
        }}
      />
    </div>
  );
};

export default IsometricBuilding; 