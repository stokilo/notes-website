import React, { useState, useEffect, useRef } from 'react';

interface CommentEditorProps {
  initialContent?: string;
  position: { x: number; y: number };
  onSave: (content: string) => void;
  onClose: () => void;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  initialContent = '',
  position,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent);
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
    onSave(content);
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
        width: '400px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {isEditing ? (
        <>
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
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
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
              Cancel
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
        </>
      ) : (
        <>
          <div
            style={{
              padding: '12px',
              flex: 1,
              overflowY: 'auto',
              maxHeight: '60vh',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
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
              onClick={handleEdit}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#4a90e2',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CommentEditor; 