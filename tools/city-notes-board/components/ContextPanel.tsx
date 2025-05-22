import React from 'react';

interface ContextPanelProps {
  onAddBuilding: () => void;
  onAddStreet: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({
  onAddBuilding,
  onAddStreet,
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
      <button
        onClick={onAddBuilding}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          padding: 0,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <img
          src="/house.svg"
          alt="Add Building"
          style={{
            width: '56px',
            height: '56px',
          }}
        />
      </button>
      <button
        onClick={onAddStreet}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          padding: 0,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        <img
          src="/street.svg"
          alt="Add Street"
          style={{
            width: '56px',
            height: '56px',
          }}
        />
      </button>
    </div>
  );
};

export default ContextPanel; 