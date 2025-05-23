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

  return (
    <div 
      style={{ 
        position: 'relative', 
        width, 
        height,
        marginTop: comment ? '25px' : '0',
        opacity: isPlaceholder ? 0.3 : 1,
      }} 
      onClick={onClick} 
      onContextMenu={onContextMenu}
    >
      {/* Comment indicator with label */}
      {comment && !isPlaceholder && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: '#4a90e2',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {commentLabel || 'Comment'}
          </div>
        </div>
      )}
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