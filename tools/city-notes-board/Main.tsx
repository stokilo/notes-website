import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { FaHome } from 'react-icons/fa';
import './styles.css';
import ScrollablePanel from './components/ScrollablePanel';
import ContextMenu from './components/ContextMenu';
import IsometricBuilding from './components/IsometricBuilding';

interface Building {
  id: number;
  color: string;
  size: number;
  position: { x: number; y: number };
}

const Main: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    position: { x: number; y: number };
  }>({
    show: false,
    position: { x: 0, y: 0 },
  });

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasOffset({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addBuilding = () => {
    const colors = ['#4a90e2', '#50c878', '#e67e22', '#e74c3c', '#9b59b6'];
    const newBuilding: Building = {
      id: nextId,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 50) + 50,
      position: {
        x: contextMenu.position.x - canvasOffset.x,
        y: contextMenu.position.y - canvasOffset.y,
      },
    };
    setBuildings([...buildings, newBuilding]);
    setNextId(nextId + 1);
  };

  const menuItems = [
    {
      label: 'Add Building',
      onClick: addBuilding,
      icon: <FaHome size={16} style={{ marginRight: '8px' }} />,
    },
    {
      label: 'Refresh',
      onClick: () => console.log('Refresh clicked'),
    },
    {
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      disabled: true,
    },
  ];

  return (
    <div 
      className="app-container" 
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        ref={canvasRef}
        className="canvas"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {buildings.map((building) => (
          <div
            key={building.id}
            className="building-container"
            style={{
              position: 'absolute',
              left: building.position.x,
              top: building.position.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <IsometricBuilding
              color={building.color}
              size={building.size}
            />
          </div>
        ))}
      </div>
      {contextMenu.show && (
        <ContextMenu
          items={menuItems}
          position={contextMenu.position}
          onClose={() => setContextMenu({ ...contextMenu, show: false })}
        />
      )}
    </div>
  );
};

// Initialize the app
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
