import React from 'react';
import { motion } from 'framer-motion';

interface BoxGlassMeasuringContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

const BoxGlassMeasuringContainer: React.FC<BoxGlassMeasuringContainerProps> = ({
  children,
  width = 200,
  height = 400,
}) => {
  // Convert children to array if it's not already
  const childrenArray = React.Children.toArray(children);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)',
        backdropFilter: 'blur(5px)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      {/* Glass container effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      />

      {/* Measurement markings */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: '10px',
            top: `${(index * 20) + 10}%`,
            width: '15px',
            height: '1px',
            background: 'rgba(0,0,0,0.2)',
          }}
        />
      ))}

      {/* Volume indicators */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`volume-${index}`}
          style={{
            position: 'absolute',
            left: '25px',
            top: `${(index * 20) + 10}%`,
            fontSize: '10px',
            color: 'rgba(0,0,0,0.4)',
            transform: 'translateY(-50%)',
          }}
        >
          {100 - (index * 20)}ml
        </div>
      ))}

      {/* Content container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {childrenArray.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BoxGlassMeasuringContainer;
