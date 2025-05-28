import React from 'react';

interface ContextButtonProps {
  onClick: () => void;
  icon: React.ReactNode | string;
  text: string;
  title?: string;
  backgroundColor?: string;
  textColor?: string;
}

const ContextButton: React.FC<ContextButtonProps> = ({
  onClick,
  icon,
  text,
  title,
  backgroundColor = 'white',
  textColor = 'black',
}) => {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor,
        color: textColor,
        cursor: 'pointer',
        fontSize: '14px',
        width: '100%',
        justifyContent: 'flex-start',
      }}
    >
      {typeof icon === 'string' ? (
        <img src={icon} alt="" style={{ width: '24px', height: '24px' }} />
      ) : (
        icon
      )}
      {text && <span>{text}</span>}
    </button>
  );
};

export default ContextButton;
