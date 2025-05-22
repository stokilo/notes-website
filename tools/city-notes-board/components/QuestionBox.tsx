import React, { useEffect, useState } from 'react';
import AnimatedColoredBox from './box/AnimatedColoredBox';

interface QuestionBoxProps {
  width?: number;
  height?: number;
  comment?: string;
  commentLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  width = 40,
  height = 40,
  comment,
  commentLabel,
  onClick,
  onContextMenu,
  isNew,
  finalPosition,
}) => {
  const [boxColor, setBoxColor] = useState('#FFD700');

  useEffect(() => {
    // Generate random colors for the box
    const hue = Math.floor(Math.random() * 360);
    const mainColor = `hsl(${hue}, 70%, 85%)`; // Lighter, more pastel color
    
    setBoxColor(mainColor);
  }, []);

  return (
    <div 
      style={{ 
        position: 'relative', 
        width, 
        height,
        marginTop: comment ? '25px' : '0' // Add margin when there's a comment to make space for the label
      }} 
      onClick={onClick} 
      onContextMenu={onContextMenu}
    >
      {/* Comment indicator with label */}
      {comment && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            pointerEvents: 'none', // Prevent the label from interfering with clicks
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Add shadow for better visibility
            }}
          >
            {commentLabel || 'Comment'}
          </div>
        </div>
      )}
      {/* Question Box */}
      <AnimatedColoredBox 
        width={width} 
        height={height} 
        color={boxColor}
        isNew={isNew}
        finalPosition={finalPosition}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#666',
            textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          ?
        </span>
      </AnimatedColoredBox>
    </div>
  );
};

export default QuestionBox; 