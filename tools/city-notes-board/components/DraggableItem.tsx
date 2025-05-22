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
  const dragOffset = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastPositionRef = useRef(position);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsDragging(true);
    onDragStart?.({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      // Only update if position has changed significantly
      if (
        Math.abs(newX - lastPositionRef.current.x) > 1 ||
        Math.abs(newY - lastPositionRef.current.y) > 1
      ) {
        lastPositionRef.current = { x: newX, y: newY };
        
        // Use requestAnimationFrame for smooth animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          setPosition({ x: newX, y: newY });
          onPositionChange?.({ x: newX, y: newY });
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;

      setIsDragging(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onDragEnd?.({ x: e.clientX, y: e.clientY });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, onPositionChange, onDragEnd]);

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
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

export default DraggableItem; 