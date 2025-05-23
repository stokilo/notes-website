import React from 'react';
import ContextButton from './ContextButton';

interface TopContextPanelProps {
  onAddSingleBoxSet: () => void;
}

const TopContextPanel: React.FC<TopContextPanelProps> = ({
  onAddSingleBoxSet,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        zIndex: 1000,
      }}
    >
      <ContextButton
        onClick={onAddSingleBoxSet}
        icon="/box-set.svg"
        text="Add Single Box"
      />
    </div>
  );
};

export default TopContextPanel; 