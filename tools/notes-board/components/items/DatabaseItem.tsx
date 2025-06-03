import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DatabaseIcon } from '../icons/FileIcons';

interface DatabaseItemProps {
  width?: number;
  height?: number;
  animated?: boolean;
}

const DatabaseItem: React.FC<DatabaseItemProps> = ({
  width = 48,
  height = 48,
  animated = true,
}) => {
  // Animation controls
  const controls = useAnimation();

  React.useEffect(() => {
    if (!animated) return;
    controls.start({
      y: [0, -6, 0, 6, 0],
      scale: [1, 1.08, 1, 0.95, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    });
  }, [animated, controls]);

  return (
    <motion.div
      animate={animated ? controls : {}}
      style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <DatabaseIcon size={Math.min(width, height)} color="#4a90e2" />
    </motion.div>
  );
};

export default DatabaseItem; 