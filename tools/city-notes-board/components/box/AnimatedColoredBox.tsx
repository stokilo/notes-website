import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedColoredBoxProps {
  width?: number;
  height?: number;
  color?: string;
  children?: React.ReactNode;
}

const AnimatedColoredBox: React.FC<AnimatedColoredBoxProps> = ({
  width = 20,
  height = 20,
  color = '#f0f0f0',
  children,
}) => {
  const [rotation, setRotation] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Random animation intervals
    const rotationInterval = setInterval(() => {
      setRotation(Math.random() * 10 - 5); // Random rotation between -10 and 10 degrees
    }, 5000);

    const shakeInterval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }, 8000);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(shakeInterval);
    };
  }, []);

  return (
    <motion.div
      animate={{
        rotate: rotation,
        x: shake ? [0, -2, 2, -2, 2, 0] : 0,
      }}
      transition={{
        rotate: { duration: 0.5, ease: "easeInOut" },
        x: { duration: 0.5, ease: "easeInOut" }
      }}
      style={{
        width,
        height,
        backgroundColor: color,
        border: `1px solid ${color}20`, // 20% opacity border
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedColoredBox;
