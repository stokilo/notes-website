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
      {!isPlaceholder && (
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
              backgroundColor: '#4a90e2',
              color: 'white',
              padding: `${Math.max(1, Math.floor(height * 0.1))}px ${Math.max(2, Math.floor(width * 0.1))}px`,
              borderRadius: '2px',
              fontSize: `${Math.max(8, Math.floor(height * 0.1))}px`,
              whiteSpace: 'nowrap',
              maxWidth: `${width * 3}px`,
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {commentLabel}
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