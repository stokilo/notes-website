import React, { useEffect, useState } from 'react';
import AnimatedColoredBox from './box/AnimatedColoredBox';

interface QuestionBoxProps {
  width?: number;
  height?: number;
  comment?: string;
  commentLabel?: string;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  width = 40,
  height = 40,
  comment,
  commentLabel,
}) => {
  const [boxColor, setBoxColor] = useState('#FFD700');

  useEffect(() => {
    // Generate random colors for the box
    const hue = Math.floor(Math.random() * 360);
    const mainColor = `hsl(${hue}, 70%, 85%)`; // Lighter, more pastel color
    
    setBoxColor(mainColor);
  }, []);

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Comment indicator with label */}
      {comment && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 1001,
          }}
        >
          {commentLabel && (
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
              }}
            >
              {commentLabel}
            </div>
          )}
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4a90e2',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            C
          </div>
        </div>
      )}
      {/* Question Box */}
      <AnimatedColoredBox width={width} height={height} color={boxColor}>
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