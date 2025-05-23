import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface WalkAroundDotProps {
  size?: number;
  color?: string;
  borderColor?: string;
  speed?: number;
}

const WalkAroundDot: React.FC<WalkAroundDotProps> = ({
  size = 20,
  color = '#4a90e2',
  borderColor = '#ffffff',
  speed = 0.5,
}) => {
  const [time, setTime] = useState(new Date());
  const controls = useAnimation();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get viewport size and update on resize
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Animation sequence
  useEffect(() => {
    const animate = async () => {
      const { width, height } = viewportSize;
      
      // Start from bottom left
      await controls.start({
        x: 0,
        y: height - size,
        transition: { duration: 0 }
      });

      while (true) {
        // Bottom left to bottom right
        await controls.start({
          x: width - size,
          y: height - size,
          transition: {
            duration: speed * 2,
            ease: "linear",
          },
        });

        // Bottom right to top right
        await controls.start({
          x: width - size,
          y: 0,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top right to top left
        await controls.start({
          x: 0,
          y: 0,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top left to bottom left
        await controls.start({
          x: 0,
          y: height - size,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });
      }
    };

    if (viewportSize.width > 0 && viewportSize.height > 0) {
      animate();
    }
  }, [controls, viewportSize, size, speed]);

  return (
    <motion.div
      animate={controls}
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        left: 0,
        top: 0,
      }}
    >
      {/* Time display */}
      <div
        style={{
          position: 'absolute',
          left: -60,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#666',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          textShadow: '0 0 4px rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '2px 4px',
          borderRadius: '4px',
        }}
      >
        {time.toLocaleTimeString()}
      </div>

      {/* Outer circle */}
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          border: `2px solid ${borderColor}`,
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        {/* Inner circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            backgroundColor: borderColor,
            opacity: 0.8,
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default WalkAroundDot;
