import React, { useState, useEffect } from 'react';

interface ShikiCodeBlockItemProps {
  width?: number;
  height?: number;
  code?: string;
  language?: string;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const ShikiCodeBlockItem: React.FC<ShikiCodeBlockItemProps> = ({
  width = 40,
  height = 40,
  code = '',
  language = 'typescript',
  onClick,
  onContextMenu,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
    onClick?.(e);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width, 
        height,
      }} 
      onClick={handleClick} 
      onContextMenu={onContextMenu}
    >
      {/* Code icon */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2d2d2d',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <svg
          width={width * 0.6}
          height={height * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 3L4 7L8 11M16 21L20 17L16 13M14 3L10 21"
            stroke="#4a90e2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Code preview dialog */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
            backgroundColor: '#1e1e1e',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: '80vw',
            maxWidth: '1200px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#2d2d2d',
              borderBottom: '1px solid #3d3d3d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              {language.toUpperCase()} Code Preview
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
              style={{
                background: '#3d3d3d',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4d4d4d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3d3d3d';
              }}
            >
              Close
            </button>
          </div>

          {/* Code content */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#d4d4d4',
              whiteSpace: 'pre',
            }}
          >
            {code}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShikiCodeBlockItem; 