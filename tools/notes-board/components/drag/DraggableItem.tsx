import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // or any other highlight.js theme

interface DraggableItemProps {
  children: React.ReactNode;
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
  onDragStart: (id: string, position: { x: number; y: number }) => void;
  onDragEnd: (id: string, position: { x: number; y: number }) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
  rotation?: number;
  onResizeEnd?: () => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  children,
  id,
  position,
  size,
  onPositionChange,
  onSizeChange,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onClick,
  isSelected = false,
  isNew = false,
  finalPosition,
  rotation = 0,
  onResizeEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef(size);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to the container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    dragOffset.current = {
      x: containerX - position.x,
      y: containerY - position.y,
    };
    setIsDragging(true);
    onDragStart(id, { x: e.clientX, y: e.clientY });
  }, [position, onDragStart, id]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itemRef.current) return;

    const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to the container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    resizeStartSize.current = { ...size };
    resizeStartPos.current = {
      x: containerX,
      y: containerY,
    };
    setIsResizing(true);
  }, [size]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing) {
      onClick?.(e);
    }
  }, [isDragging, isResizing, onClick]);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      if (!isDragging || !itemRef.current) return;

      const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate position relative to the container
      const containerX = e.clientX - containerRect.left;
      const containerY = e.clientY - containerRect.top;

      const newX = containerX - dragOffset.current.x;
      const newY = containerY - dragOffset.current.y;

      // Debounce the parent update to reduce state updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        onPositionChange(id, { x: newX, y: newY });
      });
    };

    const updateSize = (e: MouseEvent) => {
      if (!isResizing || !itemRef.current) return;

      const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate position relative to the container
      const containerX = e.clientX - containerRect.left;
      const containerY = e.clientY - containerRect.top;

      const deltaX = containerX - resizeStartPos.current.x;
      const deltaY = containerY - resizeStartPos.current.y;
      
      const newWidth = Math.max(10, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(10, resizeStartSize.current.height + deltaY);

      // Debounce the parent update to reduce state updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        onSizeChange(id, { width: newWidth, height: newHeight });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
      updateSize(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd(id, { x: e.clientX, y: e.clientY });
      }
      if (isResizing) {
        setIsResizing(false);
        onResizeEnd?.();
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
  }, [isDragging, isResizing, id, onPositionChange, onSizeChange, onDragEnd, onResizeEnd]);

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
        willChange: 'auto',
        transform: `translate3d(0, 0, 0) rotate(${rotation}deg)`,
        outline: isSelected ? '2px solid #4a90e2' : 'none',
        outlineOffset: '2px',
        boxShadow: isSelected ? '0 0 8px rgba(74, 144, 226, 0.5)' : 'none',
        transition: 'none',
        animation: 'none',
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={onContextMenu}
      onClick={handleClick}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
          borderRadius: '4px',
          border: isSelected ? '1px solid rgba(74, 144, 226, 0.3)' : 'none',
          transition: 'none',
          animation: 'none',
          willChange: 'auto',
        }}
      >
        {children}
      </div>
      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          right: -4,
          bottom: -4,
          width: 8,
          height: 8,
          backgroundColor: isSelected ? '#4a90e2' : '#999',
          borderRadius: '50%',
          cursor: 'nwse-resize',
          border: '1px solid white',
          boxShadow: '0 0 2px rgba(0,0,0,0.2)',
          zIndex: 1001,
          opacity: isSelected ? 1 : 0,
          transition: 'none',
          animation: 'none',
          willChange: 'auto',
        }}
        onMouseDown={handleResizeStart}
      />
      <style>
        {`
          .draggable-item {
            transition: none !important;
            animation: none !important;
          }
          .draggable-item:hover {
            transition: none !important;
            animation: none !important;
          }
          .draggable-item:hover > div[style*="position: absolute"] {
            opacity: 1 !important;
            transition: none !important;
            animation: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default DraggableItem; 