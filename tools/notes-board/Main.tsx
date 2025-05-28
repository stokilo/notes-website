import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import NotesBoard from './components/NotesBoard';

const Main: React.FC = () => {
  return <NotesBoard />;
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
