import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import DraggableContainer from './components/drag/DraggableContainer';
import WalkAroundDot from './components/anims/WalkAroundDot';

const Main: React.FC = () => {
  return (
    <>
      <div className="app-container">
        <DraggableContainer />
      </div>
      <WalkAroundDot size={16} speed={40.0} />
    </>
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
