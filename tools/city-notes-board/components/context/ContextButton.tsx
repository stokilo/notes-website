import React from 'react';

interface ContextButtonProps {
  onClick: () => void;
  icon?: string;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  height?: string;
}

const ContextButton: React.FC<ContextButtonProps> = ({
  onClick,
  icon,
  text,
  backgroundColor = 'white',
  textColor = 'black',
  height = '80px',
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '80px',
        height,
        borderRadius: '12px',
        border: 'none',
        backgroundColor,
        color: textColor,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        padding: 0,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        if (backgroundColor === '#ff4444') {
          e.currentTarget.style.backgroundColor = '#ff6666';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        if (backgroundColor === '#ff4444') {
          e.currentTarget.style.backgroundColor = '#ff4444';
        }
      }}
    >
      {icon ? (
        <img
          src={icon}
          alt={text || 'Button icon'}
          style={{
            width: '56px',
            height: '56px',
          }}
        />
      ) : (
        text
      )}
    </button>
  );
};

export default ContextButton;
