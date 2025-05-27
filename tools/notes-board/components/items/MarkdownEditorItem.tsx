import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorItemProps {
  width?: number;
  height?: number;
  initialContent?: string;
  showPreview?: boolean;
  onClosePreview?: () => void;
}

const MarkdownEditorItem: React.FC<MarkdownEditorItemProps> = ({
  width = 40,
  height = 40,
  initialContent = '',
  showPreview = false,
  onClosePreview,
}) => {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  const dragThreshold = 200; // milliseconds
  const ICON_SIZE = 24;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDialogOpen(false);
        onClosePreview?.();
      }
    };

    if (isDialogOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isDialogOpen, onClosePreview]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDialogOpen(false);
        onClosePreview?.();
      }
    };

    if (isDialogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDialogOpen, onClosePreview]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      dragStartTime.current = Date.now();
      setIsDragging(false);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      const dragDuration = Date.now() - dragStartTime.current;
      if (dragDuration < dragThreshold) {
        setIsDialogOpen(true);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: width,
        height: height,
        transform: 'none',
        transition: 'none',
        animation: 'none',
        willChange: 'auto',
      }}
    >
      {/* Markdown icon */}
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'none',
          transform: 'none',
          animation: 'none',
          willChange: 'auto',
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'none',
            transform: 'none',
            animation: 'none',
            willChange: 'auto',
          }}
        >
          <path
            d="M4 6H20M4 12H20M4 18H12"
            stroke="#4a90e2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Markdown editor dialog */}
      {isDialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: '60vw',
            maxWidth: '800px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'none',
            animation: 'none',
            ':hover': {
              transform: 'translate(-50%, -50%)',
              transition: 'none',
              animation: 'none'
            }
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#4a90e2',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'none',
              animation: 'none',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setViewMode('edit')}
                style={{
                  background: viewMode === 'edit' ? '#3d3d3d' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  transition: 'none',
                  animation: 'none',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                style={{
                  background: viewMode === 'preview' ? '#3d3d3d' : 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  transition: 'none',
                  animation: 'none',
                }}
              >
                Preview
              </button>
            </div>
            <button
              onClick={() => setIsDialogOpen(false)}
              style={{
                background: '#3d3d3d',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                transition: 'none',
                animation: 'none',
              }}
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
              transition: 'none',
              animation: 'none',
            }}
          >
            {viewMode === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  resize: 'none',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  outline: 'none',
                  transition: 'none',
                  animation: 'none',
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  padding: '16px',
                  overflow: 'auto',
                  backgroundColor: '#f8f9fa',
                  transition: 'none',
                  animation: 'none',
                }}
              >
                <div className="markdown-content">
                  {content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={i} style={{ margin: '0 0 16px 0', fontSize: '2em' }}>{line.slice(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={i} style={{ margin: '0 0 16px 0', fontSize: '1.5em' }}>{line.slice(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={i} style={{ margin: '0 0 16px 0', fontSize: '1.17em' }}>{line.slice(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={i} style={{ margin: '0 0 8px 0', listStyleType: 'disc', marginLeft: '20px' }}>{line.slice(2)}</li>;
                    } else if (line.startsWith('```')) {
                      return <pre key={i} style={{ 
                        backgroundColor: '#e9ecef', 
                        padding: '16px', 
                        borderRadius: '4px', 
                        overflow: 'auto',
                        margin: '0 0 16px 0',
                        fontFamily: 'monospace'
                      }}>{line.slice(3)}</pre>;
                    } else if (line.startsWith('`') && line.endsWith('`')) {
                      return <code key={i} style={{ 
                        backgroundColor: '#e9ecef', 
                        padding: '2px 4px', 
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}>{line.slice(1, -1)}</code>;
                    } else {
                      return <p key={i} style={{ margin: '0 0 16px 0' }}>{line}</p>;
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditorItem;
