import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const Main: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>City Notes Board</h1>
      </header>
      <main className="app-main">
        <p>Welcome to your city notes board!</p>
      </main>
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
