import React, { useState } from 'react';
import AnimatedColoredBox from './AnimatedColoredBox';
import GridBox from './GridBox';

interface BoxGridContainerProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
}

const BOX_COLORS = ['#FFD700', '#4A90E2', '#50E3C2', '#F5A623'];
const BOX_SIZE = 28;
const GAP = 10;
const LINE_HEIGHT = 36;

const BoxGridContainer: React.FC<BoxGridContainerProps> = ({
  children,
  width = 300,
  height = 200,
}) => {
  // Track which boxes are AnimatedColoredBox (true) or GridBox (false)
  const [boxes, setBoxes] = useState<(boolean)[]>([true, false]);

  // Handler to replace a GridBox with AnimatedColoredBox and add a new GridBox
  const handleGridBoxClick = (idx: number) => {
    setBoxes(prev => {
      const newArr = [...prev];
      newArr[idx] = true;
      newArr.push(false);
      return newArr;
    });
  };

  // Layout: flex row, wrap, with vertical line after each pair
  return (
    <div
      style={{
        width,
        minHeight: height,
        background: 'transparent',
        boxShadow: 'none',
        position: 'relative',
        padding: 18,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        userSelect: 'none',
        gap: GAP,
      }}
    >
      {boxes.map((isAnimated, idx) => (
        <React.Fragment key={idx}>
          {isAnimated ? (
            <AnimatedColoredBox
              width={BOX_SIZE}
              height={BOX_SIZE}
              color={BOX_COLORS[idx % BOX_COLORS.length]}
              style={{ position: 'static' }}
            />
          ) : (
            <GridBox
              width={BOX_SIZE}
              height={BOX_SIZE}
              onClick={() => handleGridBoxClick(idx)}
              style={{ cursor: 'pointer' }}
            />
          )}
          {/* Draw vertical line after each box except last */}
          {idx < boxes.length - 1 && (
            <div
              style={{
                width: 2,
                height: LINE_HEIGHT,
                background: '#d3d3d3',
                alignSelf: 'center',
                marginLeft: GAP / 2,
                marginRight: GAP / 2,
              }}
            />
          )}
        </React.Fragment>
      ))}
      {children}
    </div>
  );
};

export default BoxGridContainer;
