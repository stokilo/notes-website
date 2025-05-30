import React, { useState, useRef, useEffect } from 'react';

interface TextItemProps {
  width: number;
  height: number;
  text: string;
  onTextChange: (text: string) => void;
  isViewMode?: boolean;
  isSelected?: boolean;
}

const TextItem: React.FC<TextItemProps> = ({
  width,
  height,
  text,
  onTextChange,
  isViewMode = false,
  isSelected = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isViewMode && !isEditing) {
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
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '8px',
        boxSizing: 'border-box',
        backgroundColor: isSelected && !isViewMode ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
        borderRadius: '4px',
        border: isSelected && !isViewMode ? '1px solid rgba(74, 144, 226, 0.3)' : 'none',
      }}
    >
      {isEditing && !isViewMode ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            padding: 0,
          }}
        />
      ) : (
        <div
          onClick={handleClick}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            cursor: isViewMode ? 'default' : 'text',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default TextItem; 