import React, { useRef, useEffect, useState } from 'react';

interface ScrollablePanelProps {
  children: React.ReactNode;
  onScrollEnd?: () => void;
  className?: string;
}

const ScrollablePanel: React.FC<ScrollablePanelProps> = ({
  children,
  onScrollEnd,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // pixels from bottom to trigger load more
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    if (isNearBottom && !isNearBottom) {
      setIsNearBottom(true);
      onScrollEnd?.();
    } else if (!isNearBottom && isNearBottom) {
      setIsNearBottom(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scrollable-panel ${className}`}
      style={{
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
};

export default ScrollablePanel; 