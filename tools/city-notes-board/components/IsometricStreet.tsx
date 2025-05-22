import React from 'react';

interface IsometricStreetProps {
  width?: number;
  length?: number;
  color?: string;
  hasSidewalk?: boolean;
}

const IsometricStreet: React.FC<IsometricStreetProps> = ({
  width = 100,
  length = 200,
  color = '#4a4a4a',
  hasSidewalk = true,
}) => {
  const sidewalkColor = '#e0e0e0';
  const roadMarkingColor = '#ffffff';

  return (
    <div
      style={{
        width: length,
        height: width,
        position: 'relative',
        transform: 'rotateX(60deg) rotateZ(-45deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main road */}
      <div
        style={{
          position: 'absolute',
          width: length,
          height: width,
          backgroundColor: color,
          transform: 'translateZ(0)',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Road markings */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '4px',
            backgroundColor: roadMarkingColor,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '4px',
            height: '100%',
            backgroundColor: roadMarkingColor,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0.8,
          }}
        />
      </div>

      {/* Sidewalks */}
      {hasSidewalk && (
        <>
          {/* Top sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: length,
              height: width * 0.2,
              backgroundColor: sidewalkColor,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          />
          {/* Bottom sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: length,
              height: width * 0.2,
              backgroundColor: sidewalkColor,
              bottom: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          />
          {/* Left sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: width * 0.2,
              height: width,
              backgroundColor: sidewalkColor,
              left: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          />
          {/* Right sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: width * 0.2,
              height: width,
              backgroundColor: sidewalkColor,
              right: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          />
        </>
      )}
    </div>
  );
};

export default IsometricStreet; 