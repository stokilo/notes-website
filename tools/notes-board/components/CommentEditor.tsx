import React, { useState, useEffect, useRef } from 'react';

interface CommentEditorProps {
  initialContent?: string;
  initialLabel?: string;
  position: { x: number; y: number };
  onSave: (content: string, label: string) => void;
  onClose: () => void;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  initialContent = '',
  initialLabel = '',
  position,
  onSave,
  onClose,
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
    if (e.key === 'Enter' && !e.shiftKey) {
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
        display: 'flex',
        flexDirection: 'column',
        resize: 'both',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', height: 'calc(100% - 50px)' }}>
        {/* Read-only view */}
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRight: '1px solid #eee',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', color: '#666' }}>Current Comment</h3>
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
              whiteSpace: 'pre-wrap',
            }}
          >
            {content || <em>No comment yet</em>}
          </div>
        </div>

        {/* Editor view */}
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
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
            placeholder="Enter your comment here..."
          />
        </div>
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
      </div>

      {/* Resize handle */}
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
    </div>
  );
};

export default CommentEditor; 