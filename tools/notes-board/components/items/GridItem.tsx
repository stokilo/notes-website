import React, { useEffect, useState } from 'react';

interface GridItemProps {
  width?: number;
  height?: number;
  rows?: number;
  columns?: number;
  isMagnet?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
  isPlaceholder?: boolean;
}

const GridItem: React.FC<GridItemProps> = ({
  width = 100,
  height = 100,
  rows = 3,
  columns = 3,
  isMagnet = false,
  onClick,
  onContextMenu,
  isNew,
  finalPosition,
  isPlaceholder = false,
}) => {
  const [gridColor, setGridColor] = useState('#E0E0E0');
  const [borderColor, setBorderColor] = useState('#BDBDBD');

  useEffect(() => {
    if (!isPlaceholder) {
      // Generate random colors for the grid
      const hue = Math.floor(Math.random() * 360);
      const mainColor = `hsl(${hue}, 70%, 90%)`; // Lighter color for grid
      const borderHue = (hue + 30) % 360;
      const borderColor = `hsl(${borderHue}, 70%, 80%)`; // Slightly darker for border
      setGridColor(mainColor);
      setBorderColor(borderColor);
    }
  }, [isPlaceholder]);

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: '12px',
        backgroundColor: isPlaceholder ? '#F5F5F5' : gridColor,
        border: `2px solid ${isPlaceholder ? '#E0E0E0' : borderColor}`,
        overflow: 'hidden',
        cursor: isMagnet ? 'grab' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: isMagnet ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Grid lines */}
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div
          key={`row-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            top: `${((i + 1) * cellHeight)}px`,
            width: '100%',
            height: '1px',
            backgroundColor: isPlaceholder ? '#E0E0E0' : borderColor,
            opacity: 0.5,
          }}
        />
      ))}
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <div
          key={`col-${i}`}
          style={{
            position: 'absolute',
            top: 0,
            left: `${((i + 1) * cellWidth)}px`,
            height: '100%',
            width: '1px',
            backgroundColor: isPlaceholder ? '#E0E0E0' : borderColor,
            opacity: 0.5,
          }}
        />
      ))}
      
      {/* Magnet indicator */}
      {isMagnet && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        />
      )}
    </div>
  );
};

export default GridItem;
