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
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(content, label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1100,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Read-only view */}
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRight: '1px solid #eee',
            overflowY: 'auto',
            maxHeight: '60vh',
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
            }}
            dangerouslySetInnerHTML={{ __html: content || '<em>No comment yet</em>' }}
          />
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
              placeholder="Enter a label for this comment"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              onClick={() => handleFormat('bold')}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              B
            </button>
            <button
              onClick={() => handleFormat('italic')}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontStyle: 'italic',
              }}
            >
              I
            </button>
            <button
              onClick={() => handleFormat('underline')}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              U
            </button>
            <button
              onClick={() => handleFormat('insertUnorderedList')}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              • List
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            onKeyDown={handleKeyDown}
            style={{
              padding: '12px',
              flex: 1,
              overflowY: 'auto',
              minHeight: '200px',
              maxHeight: '60vh',
              outline: 'none',
              direction: 'ltr',
              textAlign: 'left',
              unicodeBidi: 'plaintext',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
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
    </div>
  );
};

export default CommentEditor; 