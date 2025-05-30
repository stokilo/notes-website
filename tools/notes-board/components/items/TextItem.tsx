import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface TextItemProps {
  width: number;
  height: number;
  text: string;
  onTextChange: (text: string) => void;
  isViewMode?: boolean;
  isSelected?: boolean;
  hasBorder?: boolean;
}

const TextItem: React.FC<TextItemProps> = ({
  width,
  height,
  text,
  onTextChange,
  isViewMode = false,
  isSelected = false,
  hasBorder = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isViewMode && !isEditing) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle CMD+A or CTRL+A
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      if (textareaRef.current) {
        textareaRef.current.select();
      }
      return;
    }

    // Handle Shift+Enter to finish editing
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      e.stopPropagation();
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        width: '100%',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: isSelected && !isViewMode ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
        borderRadius: '4px',
        border: hasBorder ? (isSelected && !isViewMode ? '1px solid rgba(74, 144, 226, 0.3)' : '1px solid #e0e0e0') : 'none',
        cursor: isViewMode ? 'default' : 'text',
      }}
    >
      {isEditing && !isViewMode ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            padding: 0,
          }}
          placeholder="Enter Markdown text here..."
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
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
            {text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default TextItem; 