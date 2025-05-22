import React, { useState } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from './DebugPanel';
import ContextPanel from './ContextPanel';
import IsometricBuilding from './IsometricBuilding';
import IsometricStreet from './IsometricStreet';

interface DraggableContainerProps {
  className?: string;
}

interface DraggableItem {
  id: string;
  type: 'building' | 'street';
  position: { x: number; y: number };
  props?: any;
}

const DraggableContainer: React.FC<DraggableContainerProps> = ({ className = '' }) => {
  const [items, setItems] = useState<DraggableItem[]>([]);

  const handlePositionChange = (id: string, newPosition: { x: number; y: number }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, position: newPosition } : item
      )
    );
  };

  const addItem = (type: 'building' | 'street', position: { x: number; y: number }) => {
    const newItem: DraggableItem = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      props: type === 'building' 
        ? { color: '#4a90e2', size: 50, height: 40 } 
        : { width: 50, length: 100 },
    };
    setItems(prev => [...prev, newItem]);
  };

  const renderItem = (item: DraggableItem) => {
    const commonProps = {
      id: item.id,
      initialPosition: item.position,
      onPositionChange: (pos: { x: number; y: number }) => handlePositionChange(item.id, pos),
    };

    return (
      <DraggableItem key={item.id} {...commonProps}>
        {item.type === 'building' ? (
          <IsometricBuilding {...item.props} />
        ) : (
          <IsometricStreet {...item.props} />
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
    </div>
  );
};

export default DraggableContainer; 