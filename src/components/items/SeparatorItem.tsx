import React from 'react';

interface SeparatorItemProps {
  width?: number;
  height?: number;
  color?: string;
}

const SeparatorItem: React.FC<SeparatorItemProps> = ({
  width = 2,
  height = 120,
  color = '#4a90e2',
}) => {
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Main line with gradient fade */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg,
            transparent 0%,
            ${color} 20%,
            ${color} 80%,
            transparent 100%
          )`,
          opacity: 0.8,
          boxShadow: `
            0 0 8px ${color}33,
            inset 0 0 4px ${color}66
          `,
        }}
      />
    </div>
  );
};

export default SeparatorItem; 