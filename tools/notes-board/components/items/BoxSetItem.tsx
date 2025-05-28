import React, { useEffect, useState } from 'react';
import AnimatedColoredBox from '../box/AnimatedColoredBox';

interface BoxSetProps {
  width?: number;
  height?: number;
  comment?: string;
  commentLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
  isPlaceholder?: boolean;
  isViewMode?: boolean;
  onAddComment?: (e: React.MouseEvent) => void;
}

const BoxSetItem: React.FC<BoxSetProps> = ({
  width = 20,
  height = 20,
  comment,
  commentLabel,
  onClick,
  onContextMenu,
  isNew,
  finalPosition,
  isPlaceholder = false,
  isViewMode = false,
  onAddComment,
}) => {
  const [boxColor, setBoxColor] = useState('#FFD700');

  useEffect(() => {
    if (!isPlaceholder) {
      // Generate random colors for the box
      const hue = Math.floor(Math.random() * 360);
      const mainColor = `hsl(${hue}, 70%, 85%)`; // Lighter, more pastel color
      setBoxColor(mainColor);
    }
  }, [isPlaceholder]);

  const handleClick = (e: React.MouseEvent) => {
    if (isViewMode) {
      // In view mode, directly trigger the add comment action
      e.preventDefault();
      onAddComment?.(e);
    } else {
      onClick?.(e);
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width, 
        height,
        marginTop: comment ? '25px' : '0',
        opacity: isPlaceholder && commentLabel ? 0.3 : 1,
        cursor: isViewMode ? 'pointer' : 'default',
      }} 
      onClick={handleClick} 
      onContextMenu={onContextMenu}
    >
      {/* Comment indicator with label */}
      {!isPlaceholder && commentLabel && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              padding: `${Math.max(2, Math.floor(height * 0.10))}px ${Math.max(4, Math.floor(width * 0.10))}px`,
              borderRadius: '10px',
              fontSize: `${Math.max(8, Math.floor(height * 0.10))}px`,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              maxWidth: `${width * 3}px`,
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.12)',
            }}
          >
            {commentLabel}
          </div>
        </div>
      )}

      {/* Always render the box (dot) */}
      <AnimatedColoredBox
        width={width} 
        height={height} 
        color={isPlaceholder ? '#e0e0e0' : boxColor}
        isNew={isNew}
        finalPosition={finalPosition}
      />
    </div>
  );
};

export default BoxSetItem;