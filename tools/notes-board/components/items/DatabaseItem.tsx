import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DatabaseIcon } from '../icons/FileIcons';

interface DatabaseItemProps {
  width?: number;
  height?: number;
  animated?: boolean;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const DatabaseItem: React.FC<DatabaseItemProps> = ({
  width = 48,
  height = 48,
  animated = true,
  label,
  onLabelChange,
}) => {
  // Animation controls
  const controls = useAnimation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const labelBase = Math.min(width, height);

  useEffect(() => {
    if (label === '') {
      setIsEditing(true);
      setEditValue('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.select();
      }, 0);
    }
  }, [label]);

  React.useEffect(() => {
    if (!animated) return;
    controls.start({
      y: [0, -6, 0, 6, 0],
      scale: [1, 1.08, 1, 0.95, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [animated, controls]);

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
    <motion.div
      animate={animated ? controls : {}}
      style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      {/* Label on top, styled like BoxSetItem */}
      {(label !== undefined || isEditing) && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              padding: `${Math.max(2, Math.floor(labelBase * 0.10))}px ${Math.max(4, Math.floor(width * 0.10))}px`,
              fontSize: `${Math.max(8, Math.floor(labelBase * 0.10))}px`,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              maxWidth: `${width * 3}px`,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #3498db 0%, #2176bd 100%)',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
              setEditValue(label || '');
              setTimeout(() => {
                if (inputRef.current) inputRef.current.select();
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
                  color: '#333',
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
        </div>
      )}
      <DatabaseIcon size={Math.min(width, height)} />
    </motion.div>
  );
};

export default DatabaseItem; 