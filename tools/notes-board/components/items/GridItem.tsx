import React, { useEffect, useState, useRef } from 'react';

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
  isDraggingOver?: boolean;
  droppedItems?: Array<{
    id: string;
    row: number;
    col: number;
    item: any;
  }>;
  onItemDrop?: (row: number, col: number) => void;
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
  isDraggingOver = false,
  droppedItems = [],
  onItemDrop,
}) => {
  const [gridColor, setGridColor] = useState('#E0E0E0');
  const [borderColor, setBorderColor] = useState('#BDBDBD');
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current || !isDraggingOver) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which cell the mouse is over
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    // Check if the mouse is within the grid bounds
    if (col >= 0 && col < columns && row >= 0 && row < rows) {
      setHoveredCell({ row, col });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredCell(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current || !onItemDrop) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col >= 0 && col < columns && row >= 0 && row < rows) {
      onItemDrop(row, col);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
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
        pointerEvents: isDraggingOver ? 'auto' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        onContextMenu?.(e);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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
      
      {/* Hovered cell highlight */}
      {hoveredCell && (
        <div
          style={{
            position: 'absolute',
            left: hoveredCell.col * cellWidth,
            top: hoveredCell.row * cellHeight,
            width: cellWidth,
            height: cellHeight,
            backgroundColor: 'rgba(74, 144, 226, 0.2)',
            border: '2px solid rgba(74, 144, 226, 0.5)',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Dropped items */}
      {droppedItems.map(({ id, row, col, item }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: col * cellWidth + (cellWidth - (item?.size?.width || 0)) / 2,
            top: row * cellHeight + (cellHeight - (item?.size?.height || 0)) / 2,
            width: item?.size?.width || 0,
            height: item?.size?.height || 0,
            zIndex: 2,
          }}
        >
          {item}
        </div>
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
