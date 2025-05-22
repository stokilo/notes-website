import React, { useState } from 'react';
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleScrollEnd = () => {
    console.log('Reached end of scroll');
  };

  const addBuilding = () => {
    const colors = ['#4a90e2', '#50c878', '#e67e22', '#e74c3c', '#9b59b6'];
    const newBuilding: Building = {
      id: nextId,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 50) + 50,
    };
    setBuildings([...buildings, newBuilding]);
    setNextId(nextId + 1);
  };

  const menuItems = [
    {
      label: 'Add Building',
      onClick: addBuilding,
      icon: <FaHome style={{ marginRight: '8px' }} />,
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
    <div className="app-container" onContextMenu={handleContextMenu}>
      <ScrollablePanel onScrollEnd={handleScrollEnd}>
        <div className="buildings-grid">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="building-container"
            >
              <IsometricBuilding
                color={building.color}
                size={building.size}
              />
            </div>
          ))}
        </div>
      </ScrollablePanel>
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
