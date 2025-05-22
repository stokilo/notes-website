import React from 'react';

interface IsometricBuildingProps {
  color?: string;
  size?: number;
}

const IsometricBuilding: React.FC<IsometricBuildingProps> = ({
  color = '#4a90e2',
  size = 100,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        transform: 'rotateX(60deg) rotateZ(-45deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main building */}
      <div
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          transform: 'translateZ(0)',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      />
      {/* Roof */}
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size / 2}px solid ${color}`,
          transform: `translateZ(${size / 2}px) rotateX(45deg)`,
          filter: 'brightness(0.8)',
        }}
      />
      {/* Windows */}
      {[0, 1].map((row) =>
        [0, 1].map((col) => (
          <div
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              width: size / 4,
              height: size / 4,
              backgroundColor: '#fff',
              transform: `translateZ(1px) translate(${
                (col + 0.5) * (size / 2) - size / 8
              }px, ${(row + 0.5) * (size / 2) - size / 8}px)`,
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
            }}
          />
        ))
      )}
    </div>
  );
};

export default IsometricBuilding; 