import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import DraggableContainer from './components/DraggableContainer';

const Main: React.FC = () => {
  return (
    <div className="app-container">
      <DraggableContainer />
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
