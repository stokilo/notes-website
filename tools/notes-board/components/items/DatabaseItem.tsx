import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DatabaseIcon } from '../icons/FileIcons';

interface DatabaseItemProps {
  width?: number;
  height?: number;
  animated?: boolean;
  label?: string;
}

const DatabaseItem: React.FC<DatabaseItemProps> = ({
  width = 48,
  height = 48,
  animated = true,
  label,
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
      style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <DatabaseIcon size={Math.min(width, height)} />
      {label && (
        <div style={{
          marginTop: 4,
          fontSize: 12,
          color: '#333',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: width,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{label}</div>
      )}
    </motion.div>
  );
};

export default DatabaseItem; 