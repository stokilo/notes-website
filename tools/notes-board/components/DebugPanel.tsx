import React, { useEffect, useState } from 'react';

interface DebugPanelProps {
  className?: string;
}

interface DebugInfo {
  mouseX: number;
  mouseY: number;
  windowWidth: number;
  windowHeight: number;
  lastAction?: string;
  dragInfo?: {
    itemId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  };
}

const DebugPanel: React.FC<DebugPanelProps> = ({ className = '' }) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    mouseX: 0,
    mouseY: 0,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        mouseX: e.clientX,
        mouseY: e.clientY,
      }));
    };

    const handleResize = () => {
      setDebugInfo(prev => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }));
    };

    const handleDebugUpdate = (e: CustomEvent) => {
      const { type, itemId, startX, startY, currentX, currentY, endX, endY } = e.detail;

      setDebugInfo(prev => {
        const newInfo = { ...prev };

        switch (type) {
          case 'dragStart':
            newInfo.lastAction = `Started dragging ${itemId}`;
            newInfo.dragInfo = {
              itemId,
              startX,
              startY,
              currentX,
              currentY,
            };
            break;
          case 'dragMove':
            newInfo.lastAction = `Dragging ${itemId}`;
            if (newInfo.dragInfo) {
              newInfo.dragInfo.currentX = currentX;
              newInfo.dragInfo.currentY = currentY;
            }
            break;
          case 'dragEnd':
            newInfo.lastAction = `Dropped ${itemId} at (${endX}, ${endY})`;
            newInfo.dragInfo = undefined;
            break;
        }

        return newInfo;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    window.addEventListener('debug-update', handleDebugUpdate as EventListener);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('debug-update', handleDebugUpdate as EventListener);
    };
  }, []);

  return <></>
  // return (
  //   <div
  //     className={`debug-panel ${className}`}
  //     style={{
  //       position: 'fixed',
  //       bottom: '20px',
  //       right: '20px',
  //       backgroundColor: 'rgba(0, 0, 0, 0.8)',
  //       color: '#fff',
  //       padding: '10px',
  //       borderRadius: '4px',
  //       fontFamily: 'monospace',
  //       fontSize: '12px',
  //       zIndex: 9999,
  //       minWidth: '200px',
  //     }}
  //   >
  //     <div>Mouse: ({debugInfo.mouseX}, {debugInfo.mouseY})</div>
  //     <div>Window: {debugInfo.windowWidth}x{debugInfo.windowHeight}</div>
  //     {debugInfo.lastAction && (
  //       <div>Last Action: {debugInfo.lastAction}</div>
  //     )}
  //     {debugInfo.dragInfo && (
  //       <div>
  //         <div>Dragging: {debugInfo.dragInfo.itemId}</div>
  //         <div>Start: ({debugInfo.dragInfo.startX}, {debugInfo.dragInfo.startY})</div>
  //         <div>Current: ({debugInfo.dragInfo.currentX}, {debugInfo.dragInfo.currentY})</div>
  //       </div>
  //     )}
  //   </div>
  // );
};

export default DebugPanel; 