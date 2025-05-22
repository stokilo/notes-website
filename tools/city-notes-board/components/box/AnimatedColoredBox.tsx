import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedColoredBoxProps {
  width?: number;
  height?: number;
  color?: string;
  children?: React.ReactNode;
  isNew?: boolean;
  finalPosition?: { x: number; y: number };
}

const AnimatedColoredBox: React.FC<AnimatedColoredBoxProps> = ({
  width = 20,
  height = 20,
  color = '#f0f0f0',
  children,
  isNew = false,
  finalPosition,
}) => {
  const [rotation, setRotation] = useState(0);
  const [shake, setShake] = useState(false);
  const [scale, setScale] = useState(1);
  const [hover, setHover] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    // Initial falling animation for new boxes
    if (isNew && finalPosition) {
      controls.start({
        y: finalPosition.y,
        transition: {
          type: "spring",
          damping: 15,
          stiffness: 100,
          duration: 1.5
        }
      });
    }

    // Random animation intervals
    const rotationInterval = setInterval(() => {
      setRotation(Math.random() * 10 - 5); // Random rotation between -5 and 5 degrees
    }, 3000);

    const shakeInterval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }, 5000);

    const scaleInterval = setInterval(() => {
      setScale(1.05);
      setTimeout(() => setScale(1), 500);
    }, 7000);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(shakeInterval);
      clearInterval(scaleInterval);
    };
  }, [isNew, finalPosition, controls]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: 'absolute',
        left: finalPosition?.x || 0,
        top: 0,
        width,
        height,
      }}
    >
      <motion.div
        animate={{
          rotate: rotation,
          x: shake ? [0, -3, 3, -3, 3, 0] : 0,
          scale: hover ? 1.1 : scale,
        }}
        transition={{
          rotate: { duration: 0.5, ease: "easeInOut" },
          x: { duration: 0.5, ease: "easeInOut" },
          scale: { duration: 0.2, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.1 }}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        style={{
          width,
          height,
          backgroundColor: color,
          border: `1px solid ${color}20`,
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedColoredBox;
