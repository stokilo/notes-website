import React, { useEffect, useState } from 'react';

interface GrassProps {
  width?: number;
  height?: number;
  label?: string;
  onLabelChange?: (newLabel: string) => void;
}

const Grass: React.FC<GrassProps> = ({
  width = 100,
  height = 100,
  label,
  onLabelChange,
}) => {
  const [hueRotate, setHueRotate] = useState(0);
  const [saturate, setSaturate] = useState(100);
  const [brightness, setBrightness] = useState(100);

  useEffect(() => {
    // Randomize colors on component mount
    setHueRotate(Math.random() * 360); // Random hue rotation (0-360)
    setSaturate(80 + Math.random() * 40); // Random saturation (80-120%)
    setBrightness(90 + Math.random() * 20); // Random brightness (90-110%)
  }, []);

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            minWidth: 'max-content',
          }}
        >
          {label}
        </div>
      )}
      {/* Grass area with randomized colors */}
      <img
        src="/grass.svg"
        alt="Grass"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: `hue-rotate(${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}%)`,
        }}
      />
    </div>
  );
};

export default Grass; 