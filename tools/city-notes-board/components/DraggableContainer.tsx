import React, { useState } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from './DebugPanel';
import ContextPanel from './ContextPanel';
import IsometricBuilding from './IsometricBuilding';
import IsometricStreet from './IsometricStreet';
import ContextMenu from './ContextMenu';

interface DraggableContainerProps {
  className?: string;
}

interface DraggableItem {
  id: string;
  type: 'building' | 'street';
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

  const addItem = (type: 'building' | 'street', position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      size: { width: 50, height: 50 },
      props: type === 'building' 
        ? { color: '#4a90e2', size: 50, height: 40 } 
        : { width: 50, length: 100 },
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${items.filter(i => i.type === type).length + 1}`,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleContextMenu = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      itemId,
    });
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

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      initialSize: item.size,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
      onSizeChange: (size: { width: number; height: number }) => handleSizeChange(item.id, size),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, item.id),
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
        ) : (
          <IsometricStreet 
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
      className={`draggable-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
      }}
    >
      {items.map(renderItem)}
      <DebugPanel />
      <ContextPanel
        onAddBuilding={() => addItem('building', { x: window.innerWidth / 2 - 25, y: window.innerHeight / 2 - 25 })}
        onAddStreet={() => addItem('street', { x: window.innerWidth / 2 - 25, y: window.innerHeight / 2 - 25 })}
      />
      {contextMenu.show && (
        <ContextMenu
          items={[
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