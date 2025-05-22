import React, { useState, useEffect, useRef } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from './DebugPanel';
import ContextPanel from './ContextPanel';
import IsometricBuilding from './IsometricBuilding';
import IsometricStreet from './IsometricStreet';
import Grass from './Grass';
import ContextMenu from './ContextMenu';

interface DraggableContainerProps {
  className?: string;
}

interface DraggableItem {
  id: string;
  type: 'building' | 'street' | 'grass';
  position: { x: number; y: number };
  size: { width: number; height: number };
  props?: any;
  label?: string;
}

const DraggableContainer: React.FC<DraggableContainerProps> = ({ className = '' }) => {
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    itemId: string;
  }>({ show: false, x: 0, y: 0, itemId: '' });
  const [copiedItem, setCopiedItem] = useState<DraggableItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingType, setDrawingType] = useState<'grass' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastDrawnPosition = useRef<{ x: number; y: number } | null>(null);

  const handleCopy = (itemId: string) => {
    const itemToCopy = items.find(item => item.id === itemId);
    if (itemToCopy) {
      setCopiedItem(itemToCopy);
      console.log('Item copied:', itemToCopy);
    }
  };

  const handlePaste = () => {
    if (!copiedItem) return;

    // Calculate new position with offset from original
    const offset = 20;
    const newPosition = {
      x: copiedItem.position.x + offset,
      y: copiedItem.position.y + offset,
    };

    // Ensure the new position is within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (newPosition.x + copiedItem.size.width > viewportWidth) {
      newPosition.x = viewportWidth - copiedItem.size.width - 20;
    }
    if (newPosition.y + copiedItem.size.height > viewportHeight) {
      newPosition.y = viewportHeight - copiedItem.size.height - 20;
    }

    const newItem: DraggableItem = {
      ...copiedItem,
      id: `${copiedItem.type}-${Date.now()}`,
      position: newPosition,
    };

    setItems(prev => [...prev, newItem]);
    console.log('Item pasted:', newItem);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for CMD+C (Mac) or CTRL+C (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        e.preventDefault();
        if (selectedItemId) {
          handleCopy(selectedItemId);
        }
      }
      // Check for CMD+V (Mac) or CTRL+V (Windows)
      else if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
    };

    // Add event listener to the document instead of window
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, copiedItem, items]); // Add items to dependencies

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const handleSizeChange = (id: string, newSize: { width: number; height: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, size: newSize } : item
      )
    );
  };

  const addItem = (type: 'building' | 'street' | 'grass', position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      size: { width: 100, height: 100 },
      props: type === 'building' 
        ? { color: '#4a90e2', size: 100, height: 80 } 
        : type === 'street'
        ? { width: 100, length: 200 }
        : { width: 100, height: 100 },
      label: undefined
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    if (isDrawing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(itemId);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      itemId,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDrawing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Only clear selection if clicking directly on the container
    if (e.target === containerRef.current) {
      setSelectedItemId(null);
      setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
    }
  };

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    if (isDrawing) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    setSelectedItemId(itemId);
  };

  const handleLabelChange = (itemId: string, newLabel: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, label: newLabel } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setContextMenu({ show: false, x: 0, y: 0, itemId: '' });
  };

  const startDrawing = (type: 'grass') => {
    setIsDrawing(true);
    setDrawingType(type);
    setSelectedItemId(null); // Clear any selected item
    setContextMenu({ show: false, x: 0, y: 0, itemId: '' }); // Hide context menu
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setDrawingType(null);
    setIsDragging(false);
    lastDrawnPosition.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawing) {
      e.preventDefault(); // Prevent other interactions
      e.stopPropagation();
      setIsDragging(true);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addItem(drawingType!, { x, y });
      lastDrawnPosition.current = { x, y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !drawingType || !isDragging) return;

    e.preventDefault(); // Prevent other interactions
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only create new items if we've moved far enough from the last position
    if (!lastDrawnPosition.current || 
        Math.hypot(x - lastDrawnPosition.current.x, y - lastDrawnPosition.current.y) > 30) {
      addItem(drawingType, { x, y });
      lastDrawnPosition.current = { x, y };
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawing) {
      e.preventDefault(); // Prevent other interactions
      e.stopPropagation();
    }
    stopDrawing();
  };

  useEffect(() => {
    // Add global mouse up listener to stop drawing if mouse leaves the container
    const handleGlobalMouseUp = () => {
      stopDrawing();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      initialSize: item.size,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
      onSizeChange: (size: { width: number; height: number }) => handleSizeChange(item.id, size),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
      onClick: (e: React.MouseEvent) => handleItemClick(e, item.id),
      isSelected: item.id === selectedItemId,
    };

    return (
      <DraggableItem key={item.id} {...commonProps}>
        {item.type === 'building' ? (
          <IsometricBuilding 
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : item.type === 'street' ? (
          <IsometricStreet 
            {...item.props} 
            width={item.size.width}
            height={item.size.height}
            label={item.label} 
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        ) : (
          <Grass
            {...item.props}
            width={item.size.width}
            height={item.size.height}
            label={item.label}
            onLabelChange={(newLabel) => handleLabelChange(item.id, newLabel)}
          />
        )}
      </DraggableItem>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`draggable-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        cursor: isDrawing ? 'crosshair' : 'default',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      tabIndex={0}
    >
      {items.map(renderItem)}
      <DebugPanel />
      <ContextPanel
        onAddBuilding={() => addItem('building', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onAddStreet={() => addItem('street', { x: window.innerWidth / 2 - 50, y: window.innerHeight / 2 - 50 })}
        onAddGrass={() => startDrawing('grass')}
      />
      {contextMenu.show && (
        <ContextMenu
          items={[
            {
              label: 'Add Label',
              onClick: () => {
                const item = items.find(i => i.id === contextMenu.itemId);
                if (item) {
                  handleLabelChange(contextMenu.itemId, '');
                }
              },
            },
            {
              label: 'Copy',
              onClick: () => handleCopy(contextMenu.itemId),
            },
            {
              label: 'Paste',
              onClick: handlePaste,
              disabled: !copiedItem,
            },
            {
              label: 'Delete',
              onClick: () => handleDeleteItem(contextMenu.itemId),
            },
          ]}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu({ show: false, x: 0, y: 0, itemId: '' })}
        />
      )}
    </div>
  );
};

export default DraggableContainer; 