import React, { useMemo } from 'react';

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
  // Calculate sizes based on the width
  const endCapSize = width * 3;
  const innerPadding = width * 0.5;
  
  // Vibrant color palette
  const colorPalette = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Sage Green
    '#FFEEAD', // Cream Yellow
    '#D4A5A5', // Dusty Rose
    '#9B59B6', // Purple
    '#3498DB', // Blue
    '#E74C3C', // Red
    '#2ECC71', // Green
  ];

  // Generate gradient colors based on the base color
  const getGradientColors = (baseColor: string) => {
    return {
      light: `${baseColor}33`, // Very transparent
      medium: `${baseColor}66`, // Semi-transparent
      dark: `${baseColor}99`, // More opaque
      solid: baseColor, // Solid color
    };
  };

  // Function to generate a color from the palette based on position
  const getColorFromPalette = (index: number) => {
    return colorPalette[index % colorPalette.length];
  };

  // Generate random segments for the separator
  const segments = useMemo(() => {
    const segmentHeight = 4; // Height of each rectangle
    const minGap = 2; // Minimum gap between segments
    const maxGap = 6; // Maximum gap between segments
    const segments: { top: number; height: number; color: string }[] = [];
    
    let currentTop = endCapSize / 2;
    const availableHeight = height - endCapSize;
    
    while (currentTop < availableHeight) {
      // Randomly decide if we should create a gap
      const shouldCreateGap = Math.random() < 0.3; // 30% chance of gap
      
      if (shouldCreateGap) {
        const gapHeight = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
        currentTop += gapHeight;
      } else {
        // Create a segment with a color from the palette
        segments.push({
          top: currentTop,
          height: segmentHeight,
          color: getColorFromPalette(segments.length),
        });
        currentTop += segmentHeight + minGap;
      }
    }
    
    return segments;
  }, [height, endCapSize]);

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
            background: `radial-gradient(circle at center, ${colorPalette[0]}33 0%, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.7,
          }}
        />
        {/* Main cap */}
        <div
          style={{
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle at 30% 30%, ${colorPalette[0]}, ${colorPalette[1]})`,
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
      
      {/* Segmented line */}
      <div
        style={{
          width: '100%',
          flex: 1,
          position: 'relative',
        }}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: segment.top,
              left: 0,
              width: '100%',
              height: segment.height,
              background: `linear-gradient(90deg, 
                ${getGradientColors(segment.color).dark} 0%, 
                ${segment.color} 20%,
                ${segment.color} 80%,
                ${getGradientColors(segment.color).dark} 100%
              )`,
              boxShadow: `
                inset 1px 0 3px rgba(255, 255, 255, 0.7),
                inset -1px 0 3px rgba(0, 0, 0, 0.2),
                0 2px 4px rgba(0, 0, 0, 0.1)
              `,
              borderRadius: '2px',
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
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>
        ))}
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
            background: `radial-gradient(circle at center, ${colorPalette[colorPalette.length - 1]}33 0%, transparent 70%)`,
            filter: 'blur(4px)',
            opacity: 0.7,
          }}
        />
        {/* Main cap */}
        <div
          style={{
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle at 70% 70%, ${colorPalette[colorPalette.length - 1]}, ${colorPalette[colorPalette.length - 2]})`,
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