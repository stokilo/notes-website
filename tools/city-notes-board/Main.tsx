import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MdHome, MdAddRoad } from 'react-icons/md';
import './styles.css';
import ContextMenu from './components/ContextMenu';
import IsometricBuilding from './components/IsometricBuilding';
import IsometricStreet from './components/IsometricStreet';

interface Building {
  id: number;
  color: string;
  size: number;
  position: { x: number; y: number };
}

interface Street {
  id: number;
  width: number;
  length: number;
  position: { x: number; y: number };
  rotation: number;
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
  const [streets, setStreets] = useState<Street[]>([]);
  const [nextId, setNextId] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setContextMenu({
      show: true,
      position: { 
        x: e.clientX,
        y: e.clientY
      },
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(2, scale * zoomFactor));
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newOffsetX = canvasOffset.x - (mouseX * (zoomFactor - 1));
    const newOffsetY = canvasOffset.y - (mouseY * (zoomFactor - 1));
    
    setScale(newScale);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  };

  const addBuilding = () => {
    const colors = ['#4a90e2', '#50c878', '#e67e22', '#e74c3c', '#9b59b6'];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newBuilding: Building = {
      id: nextId,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 50) + 50,
      position: {
        x: (contextMenu.position.x - rect.left - canvasOffset.x) / scale,
        y: (contextMenu.position.y - rect.top - canvasOffset.y) / scale,
      },
    };
    setBuildings([...buildings, newBuilding]);
    setNextId(nextId + 1);
  };

  const addStreet = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newStreet: Street = {
      id: nextId,
      width: 100,
      length: 200,
      position: {
        x: (contextMenu.position.x - rect.left - canvasOffset.x) / scale,
        y: (contextMenu.position.y - rect.top - canvasOffset.y) / scale,
      },
      rotation: Math.floor(Math.random() * 4) * 90, // Random rotation in 90-degree increments
    };
    setStreets([...streets, newStreet]);
    setNextId(nextId + 1);
  };

  const menuItems = [
    {
      label: 'Add Building',
      onClick: addBuilding,
      icon: <MdHome size={20} style={{ marginRight: '8px' }} />,
    },
    {
      label: 'Add Street',
      onClick: addStreet,
      icon: <MdAddRoad size={20} style={{ marginRight: '8px' }} />,
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
      onWheel={handleWheel}
    >
      <div 
        ref={canvasRef}
        className="canvas"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {streets.map((street) => (
          <div
            key={street.id}
            className="street-container"
            style={{
              position: 'absolute',
              left: street.position.x,
              top: street.position.y,
              transform: `translate(-50%, -50%) rotate(${street.rotation}deg)`,
            }}
          >
            <IsometricStreet
              width={street.width}
              length={street.length}
            />
          </div>
        ))}
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
