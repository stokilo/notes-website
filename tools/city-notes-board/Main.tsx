import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import ScrollablePanel from './components/ScrollablePanel';
import ContextMenu from './components/ContextMenu';

const Main: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    position: { x: number; y: number };
  }>({
    show: false,
    position: { x: 0, y: 0 },
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleScrollEnd = () => {
    console.log('Reached end of scroll');
    // Here you can implement loading more content
  };

  const menuItems = [
    {
      label: 'Add Note',
      onClick: () => console.log('Add note clicked'),
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
      <header className="app-header">
        <h1>City Notes Board</h1>
      </header>
      <main className="app-main">
        <ScrollablePanel onScrollEnd={handleScrollEnd}>
          {/* Example content - replace with your actual components */}
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                margin: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              Sample Content {index + 1}
            </div>
          ))}
        </ScrollablePanel>
      </main>
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
