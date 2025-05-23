import React from 'react';

interface SeparatorItemProps {
  width?: number;
  height?: number;
  color?: string;
}

const SeparatorItem: React.FC<SeparatorItemProps> = ({
  width = 2,
  height = 24,
  color = '#e0e0e0',
}) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: color,
        borderRadius: '1px',
      }}
    />
  );
};

export default SeparatorItem; 