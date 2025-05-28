import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface CommentEditorProps {
  initialContent?: string;
  initialLabel?: string;
  position: { x: number; y: number };
  onSave: (content: string, label: string) => void;
  onClose: () => void;
  isViewMode?: boolean;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  initialContent = '',
  initialLabel = '',
  position,
  onSave,
  onClose,
  isViewMode = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [label, setLabel] = useState(initialLabel);
  const [isEditing, setIsEditing] = useState(!initialContent);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Calculate responsive size based on viewport
  useEffect(() => {
    const calculateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // For mobile devices (width < 768px)
      if (viewportWidth < 768) {
        setSize({
          width: Math.min(viewportWidth - 32, 600), // 32px for margins
          height: Math.min(viewportHeight - 32, 400)
        });
      } else {
        setSize({
          width: Math.min(viewportWidth * 0.8, 600),
          height: Math.min(viewportHeight * 0.8, 400)
        });
      }
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (labelInputRef.current) {
      labelInputRef.current.focus();
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(content, label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      onClose();
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { ...size };
  };

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;

      setSize({
        width: Math.max(400, resizeStartSize.current.width + deltaX),
        height: Math.max(300, resizeStartSize.current.height + deltaY),
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

  // Calculate center position
  const centerPosition = {
    x: (window.innerWidth - size.width) / 2,
    y: (window.innerHeight - size.height) / 2,
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: centerPosition.y,
        left: centerPosition.x,
        zIndex: 1100,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        width: size.width,
        height: size.height,
        maxWidth: '95vw',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        resize: 'both',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', height: 'calc(100% - 50px)', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
        {/* Preview view */}
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRight: isViewMode ? 'none' : window.innerWidth < 768 ? 'none' : '1px solid #eee',
            borderBottom: window.innerWidth < 768 && !isViewMode ? '1px solid #eee' : 'none',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
            height: window.innerWidth < 768 ? '40%' : 'auto',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#666' }}>Preview</h3>
          {label && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#666' }}>Label:</strong>{' '}
              <span style={{ color: '#333' }}>{label}</span>
            </div>
          )}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)',
            }}
          >
            {content ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 1em 0' }}>{children}</p>,
                  h1: ({ children }) => <h1 style={{ fontSize: '1.5em', margin: '0.5em 0' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '1.3em', margin: '0.5em 0' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '1.1em', margin: '0.5em 0' }}>{children}</h3>,
                  ul: ({ children }) => <ul style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '0.25em 0' }}>{children}</li>,
                  code: ({ children }) => (
                    <code style={{
                      backgroundColor: '#f0f0f0',
                      padding: '0.2em 0.4em',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                    }}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre style={{
                      backgroundColor: '#f0f0f0',
                      padding: '1em',
                      borderRadius: '4px',
                      overflow: 'auto',
                      margin: '0.5em 0',
                    }}>
                      {children}
                    </pre>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <em>No comment yet</em>
            )}
          </div>
        </div>

        {/* Editor view - only show if not in view mode */}
        {!isViewMode && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>
                Label:
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                placeholder="Enter a label for this comment"
                ref={labelInputRef}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                padding: '12px',
                flex: 1,
                overflowY: 'auto',
                outline: 'none',
                border: 'none',
                resize: 'none',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
              placeholder="Enter your comment here... (Markdown supported)"
            />
          </div>
        )}
      </div>

      <div
        style={{
          padding: '8px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          height: '50px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '6px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
        {!isViewMode && (
          <button
            onClick={handleSave}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#4a90e2',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        )}
      </div>

      {/* Resize handle - only show if not in view mode */}
      {!isViewMode && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '20px',
            height: '20px',
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={handleResizeStart}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRight: '2px solid #ccc',
              borderBottom: '2px solid #ccc',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CommentEditor; 