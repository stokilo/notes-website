import React, { useState, useRef, useEffect } from 'react';

interface DraggableItemProps {
  children: React.ReactNode;
  id: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  id,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 100, height: 100 },
  onPositionChange,
  onSizeChange,
  onDragStart,
  onDragEnd,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef(size);
  const resizeStartPos = useRef({ x: 0, y: 0 });
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

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    resizeStartSize.current = { ...size };
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
    setIsResizing(true);
  };

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;

      if (
        Math.abs(newX - lastPositionRef.current.x) > 1 ||
        Math.abs(newY - lastPositionRef.current.y) > 1
      ) {
        lastPositionRef.current = { x: newX, y: newY };
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        animationFrameRef.current = requestAnimationFrame(() => {
          setPosition({ x: newX, y: newY });
          onPositionChange?.({ x: newX, y: newY });
        });
      }
    };

    const updateSize = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      const newWidth = Math.max(60, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(60, resizeStartSize.current.height + deltaY);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setSize({ width: newWidth, height: newHeight });
        onSizeChange?.({ width: newWidth, height: newHeight });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
      updateSize(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.({ x: e.clientX, y: e.clientY });
      }
      if (isResizing) {
        setIsResizing(false);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, onPositionChange, onSizeChange, onDragEnd]);

  return (
    <div
      ref={itemRef}
      className="draggable-item"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging || isResizing ? 1000 : 1,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          right: -6,
          bottom: -6,
          width: 12,
          height: 12,
          backgroundColor: '#4a90e2',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          border: '2px solid white',
          boxShadow: '0 0 4px rgba(0,0,0,0.2)',
          zIndex: 1001,
          opacity: 0,
          transition: 'opacity 0.2s ease',
        }}
        onMouseDown={handleResizeStart}
      />
      <style>
        {`
          .draggable-item:hover > div[style*="position: absolute"] {
            opacity: 1 !important;
          }
        `}
      </style>
    </div>
  );
};

export default DraggableItem; 