import React from 'react';

interface IsometricStreetProps {
  width?: number;
  length?: number;
  color?: string;
  hasSidewalk?: boolean;
  hasMarkings?: boolean;
  label?: string;
}

const IsometricStreet: React.FC<IsometricStreetProps> = ({
  width = 50,
  length = 100,
  color = '#4a4a4a',
  hasSidewalk = true,
  hasMarkings = true,
  label,
}) => {
  const sidewalkColor = '#e0e0e0';
  const roadMarkingColor = '#ffffff';
  const sidewalkWidth = width * 0.15;

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
      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%) rotateX(-60deg) rotateZ(45deg)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {label}
        </div>
      )}

      {/* Base shadow */}
      <div
        style={{
          position: 'absolute',
          width: length,
          height: width,
          backgroundColor: 'rgba(0,0,0,0.2)',
          transform: 'translateZ(-1px)',
          filter: 'blur(4px)',
        }}
      />

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
        {hasMarkings && (
          <>
            {/* Center line */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '4px',
                backgroundColor: roadMarkingColor,
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.8,
                backgroundImage: 'linear-gradient(90deg, transparent 50%, #fff 50%)',
                backgroundSize: '20px 100%',
              }}
            />
            {/* Side lines */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                backgroundColor: roadMarkingColor,
                top: '25%',
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '2px',
                backgroundColor: roadMarkingColor,
                top: '75%',
                opacity: 0.6,
              }}
            />
          </>
        )}
      </div>

      {/* Sidewalks */}
      {hasSidewalk && (
        <>
          {/* Top sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: length,
              height: sidewalkWidth,
              backgroundColor: sidewalkColor,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          >
            {/* Sidewalk pattern */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
          {/* Bottom sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: length,
              height: sidewalkWidth,
              backgroundColor: sidewalkColor,
              bottom: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          >
            {/* Sidewalk pattern */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
          {/* Left sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: sidewalkWidth,
              height: width,
              backgroundColor: sidewalkColor,
              left: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          >
            {/* Sidewalk pattern */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
          {/* Right sidewalk */}
          <div
            style={{
              position: 'absolute',
              width: sidewalkWidth,
              height: width,
              backgroundColor: sidewalkColor,
              right: 0,
              transform: 'translateZ(1px)',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          >
            {/* Sidewalk pattern */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default IsometricStreet; 