import React from 'react';
import DraggableContainer from './drag/DraggableContainer';
import WalkAroundDot from './anims/WalkAroundDot';

interface NotesBoardProps {
  className?: string;
}

const NotesBoard: React.FC<NotesBoardProps> = ({ className }) => {
  return (
    <>
      <div className={`app-container ${className || ''}`}>
        <DraggableContainer />
      </div>
      <WalkAroundDot size={16} speed={40.0} />
    </>
  );
};

export default NotesBoard; 