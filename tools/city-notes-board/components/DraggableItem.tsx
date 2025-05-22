import React, { useState, useRef, useEffect } from 'react';

interface DraggableItemProps {
  children: React.ReactNode;
  id: string;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  id,
  initialPosition = { x: 0, y: 0 },
  onPositionChange,
  onDragStart,
  onDragEnd,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);

    // Update debug panel
    const debugEvent = new CustomEvent('debug-update', {
      detail: {
        type: 'dragStart',
        itemId: id,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      },
    });
    window.dispatchEvent(debugEvent);

    onDragStart?.({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      setPosition({ x: newX, y: newY });
      onPositionChange?.({ x: newX, y: newY });

      // Update debug panel
      const debugEvent = new CustomEvent('debug-update', {
        detail: {
          type: 'dragMove',
          itemId: id,
          currentX: e.clientX,
          currentY: e.clientY,
        },
      });
      window.dispatchEvent(debugEvent);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      setIsDragging(false);
      onDragEnd?.({ x: e.clientX, y: e.clientY });

      // Update debug panel
      const debugEvent = new CustomEvent('debug-update', {
        detail: {
          type: 'dragEnd',
          itemId: id,
          endX: e.clientX,
          endY: e.clientY,
        },
      });
      window.dispatchEvent(debugEvent);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onPositionChange, onDragEnd]);

  return (
    <div
      ref={itemRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

export default DraggableItem; 