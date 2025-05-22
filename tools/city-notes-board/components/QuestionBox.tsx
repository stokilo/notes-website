import React, { useEffect, useState } from 'react';

interface QuestionBoxProps {
  width?: number;
  height?: number;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const QuestionBox: React.FC<QuestionBoxProps> = ({
  width = 40,
  height = 40,
  label,
  onLabelChange,
}) => {
  const [boxColor, setBoxColor] = useState('#FFD700');
  const [borderColor, setBorderColor] = useState('#B8860B');
  const [patternColor, setPatternColor] = useState('#B8860B');

  useEffect(() => {
    // Generate random colors for the box
    const hue = Math.floor(Math.random() * 360);
    const mainColor = `hsl(${hue}, 100%, 50%)`;
    const darkerColor = `hsl(${hue}, 100%, 35%)`;
    
    setBoxColor(mainColor);
    setBorderColor(darkerColor);
    setPatternColor(darkerColor);
  }, []);

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            minWidth: 'max-content',
          }}
        >
          {label}
        </div>
      )}
      {/* Question Box */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: boxColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, transparent 48%, ${patternColor} 49%, ${patternColor} 51%, transparent 52%)`,
            backgroundSize: '8px 8px',
            opacity: 0.3,
          }}
        />
        <span
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: borderColor,
            textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
            zIndex: 1,
          }}
        >
          ?
        </span>
      </div>
    </div>
  );
};

export default QuestionBox; 