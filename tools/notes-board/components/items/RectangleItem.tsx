import React, { useState, useRef, useEffect } from 'react';

interface RectangleItemProps {
  label?: string;
  onLabelChange?: (newLabel: string) => void;
  size?: number;
  width?: number;
  height?: number;
}

const RectangleItem: React.FC<RectangleItemProps> = ({
  label,
  onLabelChange,
  size = 50,
  width,
  height,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const actualWidth = width || size;
  const actualHeight = height || size;
  const labelBase = Math.min(actualWidth, actualHeight);

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
    <div style={{ position: 'relative', width: actualWidth, height: actualHeight }}>
      {/* Label */}
      {(label !== undefined || isEditing) && (
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            padding: `${Math.max(2, Math.min(6, Math.floor(labelBase * 0.1)))}px ${Math.max(4, Math.min(8, Math.floor(labelBase * 0.1)))}px`,
            fontSize: `${Math.max(10, Math.min(14, Math.floor(labelBase * 0.15)))}px`,
            whiteSpace: 'nowrap',
            maxWidth: `${Math.min(200, actualWidth * 2)}px`,
            textAlign: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
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
                color: 'black',
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
      {}
      <img
        src="/box.svg"
        alt="House"
        draggable="false"
        onDragStart={handleDragStart}
        style={{
          width: actualWidth,
          height: actualHeight,
          display: 'block',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'none',
          filter: 'hue-rotate(0deg) saturate(100%) brightness(100%)',
        }}
      />
    </div>
  );
};

export default RectangleItem;