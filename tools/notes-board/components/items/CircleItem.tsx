import React, { useState, useRef, useEffect } from 'react';

interface CircleItemProps {
  width?: number;
  height?: number;
  color?: string;
  hasSidewalk?: boolean;
  hasMarkings?: boolean;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const CircleItem: React.FC<CircleItemProps> = ({
  width = 100,
  height = 100,
  color = '#4a4a4a',
  hasSidewalk = true,
  hasMarkings = true,
  label,
  onLabelChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const labelBase = Math.min(width, height);

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
    <div style={{ position: 'relative', width, height }}>
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
            maxWidth: `${Math.min(200, width * 2)}px`,
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
      {/* Street image with randomized colors */}
      <img
        src="/circle.svg"
        alt="Street"
        draggable="false"
        onDragStart={handleDragStart}
        style={{
          width: '100%',
          height: '100%',
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

export default CircleItem;