import React from 'react';

interface SeparatorItemProps {
  width?: number;
  height?: number;
  color?: string;
}

const SeparatorItem: React.FC<SeparatorItemProps> = ({
  width = 12,
  height = 120,
  color = '#e0e0e0',
}) => {
  // Calculate sizes based on the width
  const endCapSize = width * 2;
  const innerPadding = width * 0.5;
  
  // Generate gradient colors based on the base color
  const getGradientColors = (baseColor: string) => {
    return {
      light: `${baseColor}dd`, // More transparent
      medium: `${baseColor}ff`, // Full opacity
      dark: `${baseColor}cc`, // Less transparent
    };
  };

  const colors = getGradientColors(color);

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
        padding: `${innerPadding}px 0`,
      }}
    >
      {/* Top cap with advanced effects */}
      <div
        style={{
          width: endCapSize,
          height: endCapSize,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at center, ${colors.light} 0%, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.5,
          }}
        />
        {/* Main cap */}
        <div
          style={{
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle at 30% 30%, ${colors.medium}, ${colors.dark})`,
            borderRadius: '50%',
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1),
              inset 0 2px 4px rgba(255, 255, 255, 0.5)
            `,
            transform: 'perspective(100px) rotateX(10deg)',
          }}
        />
      </div>
      
      {/* Main line with advanced 3D effect */}
      <div
        style={{
          width: '100%',
          flex: 1,
          position: 'relative',
          background: `linear-gradient(90deg, 
            ${colors.dark} 0%, 
            ${colors.medium} 20%,
            ${colors.medium} 80%,
            ${colors.dark} 100%
          )`,
          boxShadow: `
            inset 1px 0 3px rgba(255, 255, 255, 0.7),
            inset -1px 0 3px rgba(0, 0, 0, 0.2),
            0 2px 4px rgba(0, 0, 0, 0.1)
          `,
          borderRadius: '4px',
          transform: 'perspective(100px) rotateX(5deg)',
        }}
      >
        {/* Inner highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: `linear-gradient(180deg, 
              rgba(255, 255, 255, 0.2) 0%,
              transparent 100%
            )`,
            borderRadius: '4px 4px 0 0',
          }}
        />
      </div>
      
      {/* Bottom cap with advanced effects */}
      <div
        style={{
          width: endCapSize,
          height: endCapSize,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `radial-gradient(circle at center, ${colors.light} 0%, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.5,
          }}
        />
        {/* Main cap */}
        <div
          style={{
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle at 70% 70%, ${colors.medium}, ${colors.dark})`,
            borderRadius: '50%',
            boxShadow: `
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 -2px 4px rgba(255, 255, 255, 0.5)
            `,
            transform: 'perspective(100px) rotateX(-10deg)',
          }}
        />
      </div>
    </div>
  );
};

export default SeparatorItem; 