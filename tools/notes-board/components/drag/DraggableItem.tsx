import React, { useState, useRef, useEffect } from 'react';
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

  // Update position when initialPosition changes
  useEffect(() => {
    setPosition(initialPosition);
    lastPositionRef.current = initialPosition;
  }, [initialPosition]);

  // Update size when initialSize changes
  useEffect(() => {
    setSize(initialSize);
  }, [initialSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
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
  };

  const handleResizeStart = (e: React.MouseEvent) => {
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
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) {
      onClick?.(e);
    }
  };

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
        if (onPositionChange) {
          onPositionChange({ x: newX, y: newY });
        }
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
        if (onSizeChange) {
          onSizeChange({ width: newWidth, height: newHeight });
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e);
      updateSize(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        if (onDragEnd) {
          onDragEnd({ x: e.clientX, y: e.clientY });
        }
      }
      if (isResizing) {
        setIsResizing(false);
        if (onResizeEnd) {
          onResizeEnd();
        }
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
  }, [isDragging, isResizing, onPositionChange, onSizeChange, onDragEnd, onResizeEnd, zoom]);

  useEffect(() => {
    if (disableAnimations) return;

    // Random animation intervals
    const rotationInterval = setInterval(() => {
      setRotation(Math.random() * 2 - 1); // Random rotation between -1 and 1 degrees
    }, 3000);

    const scaleInterval = setInterval(() => {
      setScale(1.0002);
      setTimeout(() => setScale(1), 3500);
    }, 7000);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(scaleInterval);
    };
  }, [disableAnimations]);

  return (
    <motion.div
      ref={itemRef}
      className="draggable-item"
      animate={disableAnimations ? {} : {
        rotate: rotation,
        scale: hover ? 1.1 : scale,
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      }}
      transition={disableAnimations ? {} : {
        rotate: { duration: 0.5, ease: "easeInOut" },
        scale: { duration: 0.2, ease: "easeInOut" },
        x: { duration: 0, ease: "linear" },
        y: { duration: 0, ease: "linear" },
        width: { duration: 0, ease: "linear" },
        height: { duration: 0, ease: "linear" },
      }}
      whileHover={disableAnimations ? {} : { scale: 1.1 }}
      onHoverStart={() => !disableAnimations && setHover(true)}
      onHoverEnd={() => !disableAnimations && setHover(false)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging || isResizing ? 1000 : 1,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        outline: isSelected ? '2px solid #4a90e2' : 'none',
        outlineOffset: '2px',
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
      {disableAnimations ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
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
    </motion.div>
  );
};

export default DraggableItem; 