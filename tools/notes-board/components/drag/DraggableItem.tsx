import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DraggableItemProps {
  children: React.ReactNode;
  id: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onDragStart?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  disableAnimations?: boolean;
  zoom?: number;
  onResizeEnd?: () => void;
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
  onContextMenu,
  onClick,
  isSelected = false,
  disableAnimations = false,
  zoom = 1,
  onResizeEnd,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef(size);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastPositionRef = useRef(position);
  const onPositionChangeRef = useRef(onPositionChange);
  const onSizeChangeRef = useRef(onSizeChange);
  const onDragEndRef = useRef(onDragEnd);
  const onResizeEndRef = useRef(onResizeEnd);

  // Update refs when callbacks change
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
    onSizeChangeRef.current = onSizeChange;
    onDragEndRef.current = onDragEnd;
    onResizeEndRef.current = onResizeEnd;
  }, [onPositionChange, onSizeChange, onDragEnd, onResizeEnd]);

  // Update position when initialPosition changes
  useEffect(() => {
    if (JSON.stringify(initialPosition) !== JSON.stringify(lastPositionRef.current)) {
      const newPosition = {
        x: initialPosition.x,
        y: initialPosition.y
      };
      setPosition(newPosition);
      lastPositionRef.current = newPosition;
    }
  }, [initialPosition]);

  // Update size when initialSize changes
  useEffect(() => {
    if (JSON.stringify(initialSize) !== JSON.stringify(size)) {
      setSize(initialSize);
    }
  }, [initialSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to the container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    // Convert to unzoomed coordinates
    const unzoomedX = containerX / zoom;
    const unzoomedY = containerY / zoom;

    dragOffset.current = {
      x: unzoomedX - position.x,
      y: unzoomedY - position.y,
    };
    setIsDragging(true);
    onDragStart?.({ x: e.clientX, y: e.clientY });
  }, [position, zoom, onDragStart]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!itemRef.current) return;

    const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate position relative to the container
    const containerX = e.clientX - containerRect.left;
    const containerY = e.clientY - containerRect.top;

    // Convert to unzoomed coordinates
    const unzoomedX = containerX / zoom;
    const unzoomedY = containerY / zoom;

    resizeStartSize.current = { ...size };
    resizeStartPos.current = {
      x: unzoomedX,
      y: unzoomedY,
    };
    setIsResizing(true);
  }, [size, zoom]);

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

      // Convert to unzoomed coordinates
      const unzoomedX = containerX / zoom;
      const unzoomedY = containerY / zoom;

      const newX = unzoomedX - dragOffset.current.x;
      const newY = unzoomedY - dragOffset.current.y;

      // Update local state immediately for smooth animation
      setPosition({ x: newX, y: newY });

      // Debounce the parent update to reduce state updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        onPositionChangeRef.current?.({ x: newX, y: newY });
      });
    };

    const updateSize = (e: MouseEvent) => {
      if (!isResizing || !itemRef.current) return;

      const containerRect = itemRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      // Calculate position relative to the container
      const containerX = e.clientX - containerRect.left;
      const containerY = e.clientY - containerRect.top;

      // Convert to unzoomed coordinates
      const unzoomedX = containerX / zoom;
      const unzoomedY = containerY / zoom;

      const deltaX = unzoomedX - resizeStartPos.current.x;
      const deltaY = unzoomedY - resizeStartPos.current.y;
      
      const newWidth = Math.max(10, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(10, resizeStartSize.current.height + deltaY);

      // Update local state immediately for smooth animation
      setSize({ width: newWidth, height: newHeight });

      // Debounce the parent update to reduce state updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        onSizeChangeRef.current?.({ width: newWidth, height: newHeight });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
      updateSize(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        onDragEndRef.current?.({ x: e.clientX, y: e.clientY });
      }
      if (isResizing) {
        setIsResizing(false);
        onResizeEndRef.current?.();
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
  }, [isDragging, isResizing, zoom]);

  useEffect(() => {
    if (disableAnimations) return;

    let isActive = true;
    const rotationInterval = setInterval(() => {
      if (isActive) {
        setRotation(prev => prev + (Math.random() * 2 - 1));
      }
    }, 3000);

    const scaleInterval = setInterval(() => {
      if (isActive) {
        setScale(prev => prev === 1 ? 1.0002 : 1);
      }
    }, 7000);

    return () => {
      isActive = false;
      clearInterval(rotationInterval);
      clearInterval(scaleInterval);
    };
  }, [disableAnimations]);

  // Separate effect for hover state
  useEffect(() => {
    if (disableAnimations) return;
    
    let isActive = true;
    const handleMouseEnter = () => {
      if (isActive) setHover(true);
    };
    const handleMouseLeave = () => {
      if (isActive) setHover(false);
    };
    
    const element = itemRef.current;
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      isActive = false;
      if (element) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [disableAnimations]);

  return (
    <motion.div
      ref={itemRef}
      className="draggable-item"
      animate={disableAnimations ? {} : {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      transition={{
        x: { duration: 0 },
        y: { duration: 0 },
        width: { duration: 0 },
        height: { duration: 0 },
      }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging || isResizing ? 1000 : 1,
        willChange: 'auto',
        transform: 'translate3d(0, 0, 0)',
        outline: isSelected ? '2px solid #4a90e2' : 'none',
        outlineOffset: '2px',
        boxShadow: isSelected ? '0 0 8px rgba(74, 144, 226, 0.5)' : 'none',
        transition: 'none',
        animation: 'none',
        ...(disableAnimations ? {
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          width: size.width,
          height: size.height,
        } : {})
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
    </motion.div>
  );
};

export default DraggableItem; 