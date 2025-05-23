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
  const controls1 = useAnimation();
  const controls2 = useAnimation();
  const controls3 = useAnimation();
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

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

  // Animation sequence for first circle (clockwise)
  useEffect(() => {
    const animate1 = async () => {
      const { width, height } = viewportSize;
      
      // Start from bottom left
      await controls1.start({
        x: 0,
        y: height - size,
        rotate: 0,
        transition: { duration: 0 }
      });

      while (true) {
        // Bottom left to bottom right
        await controls1.start({
          x: width - size,
          y: height - size,
          rotate: 0,
          transition: {
            duration: speed * 2,
            ease: "linear",
          },
        });

        // Bottom right to top right
        await controls1.start({
          x: width - size,
          y: 0,
          rotate: 90,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top right to top left
        await controls1.start({
          x: 0,
          y: 0,
          rotate: 180,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top left to bottom left
        await controls1.start({
          x: 0,
          y: height - size,
          rotate: 270,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });
      }
    };

    // Animation sequence for second circle (counter-clockwise)
    const animate2 = async () => {
      const { width, height } = viewportSize;
      
      // Start from bottom right
      await controls2.start({
        x: width - size,
        y: height - size,
        rotate: 0,
        transition: { duration: 0 }
      });

      while (true) {
        // Bottom right to bottom left
        await controls2.start({
          x: 0,
          y: height - size,
          rotate: 180,
          transition: {
            duration: speed * 2,
            ease: "linear",
          },
        });

        // Bottom left to top left
        await controls2.start({
          x: 0,
          y: 0,
          rotate: 270,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top left to top right
        await controls2.start({
          x: width - size,
          y: 0,
          rotate: 0,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top right to bottom right
        await controls2.start({
          x: width - size,
          y: height - size,
          rotate: 90,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });
      }
    };

    // Animation sequence for third circle (diagonal)
    const animate3 = async () => {
      const { width, height } = viewportSize;
      
      // Start from bottom left
      await controls3.start({
        x: 0,
        y: height - size,
        rotate: 45,
        transition: { duration: 0 }
      });

      while (true) {
        // Bottom left to top right
        await controls3.start({
          x: width - size,
          y: 0,
          rotate: 45,
          transition: {
            duration: speed * 1.5,
            ease: "linear",
          },
        });

        // Top right to bottom left
        await controls3.start({
          x: 0,
          y: height - size,
          rotate: 225,
          transition: {
            duration: speed * 1.5,
            ease: "linear",
          },
        });
      }
    };

    if (viewportSize.width > 0 && viewportSize.height > 0) {
      animate1();
      animate2();
      animate3();
    }
  }, [controls1, controls2, controls3, viewportSize, size, speed]);

  const renderCircle = (controls: any, color: string, borderColor: string) => (
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
          opacity: 1,
        }}
      >
        {/* Inner circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.9, 1, 0.9],
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
            opacity: 1,
          }}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {renderCircle(controls1, '#4a90e2', '#ffffff')}
      {renderCircle(controls2, '#50E3C2', '#ffffff')}
      {renderCircle(controls3, '#F5A623', '#ffffff')}
    </>
  );
};

export default WalkAroundDot;
