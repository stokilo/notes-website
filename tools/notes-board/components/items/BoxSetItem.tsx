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
        marginTop: commentLabel ? '30px' : '0',
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
            padding: isViewMode ? '0 25px' : '0',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              padding: `${Math.min(4, Math.max(2, Math.floor(height * 0.10)))}px ${Math.min(8, Math.max(4, Math.floor(width * 0.10)))}px`,
              fontSize: `${Math.min(12, Math.max(8, Math.floor(height * 0.10)))}px`,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              maxWidth: `${Math.min(200, width * 2)}px`,
              minWidth: '40px',
              textAlign: 'center',
              background: boxColor.replace('85%)', '65%)'),
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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