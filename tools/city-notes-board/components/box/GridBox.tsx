import React from 'react';

interface GridBoxProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const GridBox: React.FC<GridBoxProps> = ({ width = 28, height = 28, style = {}, children, onClick }) => {
  return (
    <div
      style={{
        border: '1.5px dashed #d3d3d3',
        borderRadius: 5,
        background: 'rgba(0,0,0,0.02)',
        width,
        height,
        minWidth: width,
        minHeight: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GridBox; 