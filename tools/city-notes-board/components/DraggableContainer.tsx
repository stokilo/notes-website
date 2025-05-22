import React, { useState } from 'react';
import DraggableItem from './DraggableItem';
import DebugPanel from './DebugPanel';
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
      props: type === 'building' ? { color: '#4a90e2' } : { width: 100, length: 200 },
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
      
      {/* Add buttons to create new items */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={() => addItem('building', { x: 100, y: 100 })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Building
        </button>
        <button
          onClick={() => addItem('street', { x: 100, y: 100 })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Street
        </button>
      </div>
    </div>
  );
};

export default DraggableContainer; 