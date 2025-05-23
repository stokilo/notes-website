import React from 'react';
import ContextButton from './ContextButton';
import BoxSetItem from '../items/BoxSetItem';
import SeparatorItem from '../items/SeparatorItem';

interface TopContextPanelProps {
  onAddSingleBoxSet: () => void;
  onAddSeparator: () => void;
}

const TopContextPanel: React.FC<TopContextPanelProps> = ({
  onAddSingleBoxSet,
  onAddSeparator,
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
      <div
        onClick={onAddSingleBoxSet}
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <BoxSetItem width={24} height={24} />
      </div>
      <div
        onClick={onAddSeparator}
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <SeparatorItem width={2} height={24} />
      </div>
    </div>
  );
};

export default TopContextPanel; 