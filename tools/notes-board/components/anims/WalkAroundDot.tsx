import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const animationRef = useRef<{ animate1: () => Promise<void>; animate2: () => Promise<void>; animate3: () => Promise<void>; } | null>(null);

  // Animation sequences
  const createAnimations = useCallback(() => {
    const { width, height } = viewportSize;

    const animate1 = async () => {
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

    const animate2 = async () => {
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

    const animate3 = async () => {
      // Start from bottom left
      await controls3.start({
        x: 0,
        y: height - size,
        rotate: 0,
        transition: { duration: 0 }
      });

      while (true) {
        // Bottom left to top left
        await controls3.start({
          x: 0,
          y: 0,
          rotate: 90,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top left to top right
        await controls3.start({
          x: width - size,
          y: 0,
          rotate: 180,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Top right to bottom right
        await controls3.start({
          x: width - size,
          y: height - size,
          rotate: 270,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });

        // Bottom right to bottom left
        await controls3.start({
          x: 0,
          y: height - size,
          rotate: 0,
          transition: {
            duration: speed,
            ease: "linear",
          },
        });
      }
    };

    return { animate1, animate2, animate3 };
  }, [controls1, controls2, controls3, viewportSize, size, speed]);

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

  // Start animations when viewport size changes
  useEffect(() => {
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      // Stop any existing animations
      controls1.stop();
      controls2.stop();
      controls3.stop();

      // Create new animations with updated viewport size
      const animations = createAnimations();
      animationRef.current = animations;

      // Start new animations
      animations.animate1();
      animations.animate2();
      animations.animate3();
    }
  }, [viewportSize, createAnimations, controls1, controls2, controls3]);

  const renderCircle = (controls: any, color: string, borderColor: string, pulseDuration: number) => (
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
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
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
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: pulseDuration * 0.8,
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
          }}
        />
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {renderCircle(controls1, '#4a90e2', '#ffffff', 2.5)}
      {renderCircle(controls2, '#50E3C2', '#ffffff', 3)}
      {renderCircle(controls3, '#F5A623', '#ffffff', 3.5)}
    </>
  );
};

export default WalkAroundDot;
