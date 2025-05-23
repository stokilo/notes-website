import React from 'react';

interface BoxGridContainerProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
}

const BOX_COLORS = ['#FFD700', '#4A90E2', '#50E3C2', '#F5A623'];

const BoxGridContainer: React.FC<BoxGridContainerProps> = ({
  children,
  width = 200,
  height = 200,
}) => {
  return (
    <div
      style={{
        width,
        height,
        // borderRadius: 16,
        // border: '1.5px solid #d3d3d3',
        background: 'transparent',
        boxShadow: 'none',
        position: 'relative',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      {/* Top row: 4 colored boxes aligned with grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 28px)',
        gap: 10,
        marginBottom: 18,
        width: '100%',
        maxWidth: 170,
      }}>
        {BOX_COLORS.map((color, i) => (
          <div
            key={color}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: color,
              border: '1.5px solid #e0e0e0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.07)',
              gridColumn: i + 1,
            }}
          />
        ))}
      </div>
      {/* Space for one row */}
      <div style={{ height: 32 }} />
      {/* 4x4 grid of rectangles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 28px)',
          gridTemplateRows: 'repeat(4, 28px)',
          gap: 10,
          width: '100%',
          maxWidth: 170,
          height: 'auto',
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            style={{
              border: '1.5px dashed #d3d3d3',
              borderRadius: 5,
              background: 'rgba(0,0,0,0.02)',
              width: 28,
              height: 28,
              minWidth: 28,
              minHeight: 28,
            }}
          />
        ))}
      </div>
      {/* Children overlay if needed */}
      {children}
    </div>
  );
};

export default BoxGridContainer;
