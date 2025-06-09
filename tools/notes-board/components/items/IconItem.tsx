import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface IconItemProps {
  width?: number;
  height?: number;
  animated?: boolean;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
  iconName?: string;
}

const IconItem: React.FC<IconItemProps> = ({
  width = 48,
  height = 48,
  animated = false,
  label,
  onLabelChange,
  iconName = 'mdi:database',
}) => {
  // Animation controls
  const controls = useAnimation();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const labelBase = Math.min(width, height);
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    // Fetch icon from Iconify API
    const fetchIcon = async () => {
      try {
        const response = await fetch(`https://api.iconify.design/${iconName}.svg`);
        if (response.ok) {
          const svgText = await response.text();
          setIconUrl(`data:image/svg+xml,${encodeURIComponent(svgText)}`);
        }
      } catch (error) {
        console.error('Error fetching icon:', error);
      }
    };

    fetchIcon();
  }, [iconName]);

  useEffect(() => {
    if (label === '') {
      setIsEditing(true);
      setEditValue('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.select();
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

  return (
    <motion.div
      animate={animated ? controls : {}}
      style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
    >
      {/* Label on top */}
      {(label !== undefined || isEditing) && (
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            padding: `${Math.max(2, Math.min(6, Math.floor(labelBase * 0.1)))}px ${Math.max(4, Math.min(8, Math.floor(labelBase * 0.1)))}px`,
            fontSize: `${Math.max(8, Math.min(12, Math.floor(labelBase * 0.10)))}px`,
            whiteSpace: 'nowrap',
            maxWidth: `${Math.min(200, width * 2)}px`,
            textAlign: 'center',
            zIndex: 1000,
            cursor: 'pointer',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            transition: 'all 0.3s ease',
            margin: '0 auto',
            display: 'inline-block',
            pointerEvents: 'auto',
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
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
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
      )}
      {iconUrl && (
        <img
          src={iconUrl}
          alt={iconName}
          style={{
            width: Math.min(width, height),
            height: Math.min(width, height),
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        />
      )}
    </motion.div>
  );
};

export default IconItem; 