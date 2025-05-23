import React from 'react';
import ContextButton from './ContextButton';
import ShikiCodeBlockItem from '../items/ShikiCodeBlockItem';

interface ContextPanelProps {
  onAddBox: () => void;
  onAddCircle: () => void;
  onAddCodeBlock: () => void;
  onClearScene: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  onAddBox,
  onAddCircle,
  onAddCodeBlock,
  onClearScene,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000,
      }}
    >
      <ContextButton
        onClick={onAddBox}
        icon="/box.svg"
        text="Add Building"
      />
      <ContextButton
        onClick={onAddCircle}
        icon="/street.svg"
        text="Add Street"
      />
      <ContextButton
        onClick={onAddCodeBlock}
        icon="/code.svg"
        text="Add Code"
        backgroundColor="transparent"
        textColor="white"
      />
      <ContextButton
        onClick={onClearScene}
        icon="/trash.svg"
        text="Clear"
        backgroundColor="#ff4444"
        textColor="white"
      />
    </div>
  );
};

export default ContextPanel; 