import React from 'react';

interface SeparatorItemProps {
  width?: number;
  height?: number;
  color?: string;
}

const SeparatorItem: React.FC<SeparatorItemProps> = ({
  width = 8,
  height = 100,
  color = '#e0e0e0',
}) => {
  // Calculate the end cap size based on the width
  const endCapSize = width * 1.5;
  
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0',
      }}
    >
      {/* Top cap */}
      <div
        style={{
          width: endCapSize,
          height: endCapSize,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Main line with 3D effect */}
      <div
        style={{
          width: '100%',
          flex: 1,
          background: `linear-gradient(90deg, 
            ${color} 0%, 
            ${color} 45%, 
            ${color} 55%, 
            ${color} 100%
          )`,
          boxShadow: `
            inset 1px 0 2px rgba(255, 255, 255, 0.5),
            inset -1px 0 2px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.1)
          `,
          borderRadius: '2px',
        }}
      />
      
      {/* Bottom cap */}
      <div
        style={{
          width: endCapSize,
          height: endCapSize,
          backgroundColor: color,
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      />
    </div>
  );
};

export default SeparatorItem; 