import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ReactDOM from 'react-dom';

interface MarkdownEditorItemProps {
  width?: number;
  height?: number;
  initialContent?: string;
  showPreview?: boolean;
  onClosePreview?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const MarkdownEditorItem: React.FC<MarkdownEditorItemProps> = ({
  width = 40,
  height = 40,
  initialContent = '',
  showPreview = false,
  onClosePreview,
  onContextMenu,
}) => {
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  const dragThreshold = 200; // milliseconds
  const ICON_SIZE = 24;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dialogSize, setDialogSize] = useState({ width: '60vw', height: '80vh' });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

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
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setContent(prev => prev + pastedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        setContent(prev => prev + text);
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = {
      width: dialogRef.current?.offsetWidth || 0,
      height: dialogRef.current?.offsetHeight || 0
    };
  };

  const handleDialogDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      return; // Don't start drag if clicking a button
    }
    e.preventDefault();
    setIsDraggingDialog(true);
    dragStartPos.current = {
      x: e.clientX - dialogPosition.x,
      y: e.clientY - dialogPosition.y
    };
  };

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;

      const newWidth = Math.max(400, resizeStartSize.current.width + deltaX);
      const newHeight = Math.max(300, resizeStartSize.current.height + deltaY);

      setDialogSize({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    const handleDialogDragMove = (e: MouseEvent) => {
      if (!isDraggingDialog) return;

      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      // Calculate bounds to keep dialog within viewport
      const maxX = window.innerWidth - (dialogRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (dialogRef.current?.offsetHeight || 0);

      setDialogPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleDialogDragEnd = () => {
      setIsDraggingDialog(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    if (isDraggingDialog) {
      window.addEventListener('mousemove', handleDialogDragMove);
      window.addEventListener('mouseup', handleDialogDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('mousemove', handleDialogDragMove);
      window.removeEventListener('mouseup', handleDialogDragEnd);
    };
  }, [isResizing, isDraggingDialog, dialogPosition]);

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
        onContextMenu={onContextMenu}
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
      {isDialogOpen && ReactDOM.createPortal(
        <div
          ref={dialogRef}
          style={{
            position: 'fixed',
            top: dialogPosition.y,
            left: dialogPosition.x,
            transform: 'none',
            zIndex: 2147483647,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            width: dialogSize.width,
            height: dialogSize.height,
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'none',
            animation: 'none',
            willChange: 'auto',
          }}
        >
          {/* Header */}
          <div
            onMouseDown={handleDialogDragStart}
            style={{
              padding: '12px 16px',
              backgroundColor: '#4a90e2',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'none',
              animation: 'none',
              cursor: isDraggingDialog ? 'grabbing' : 'grab',
              userSelect: 'none',
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
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
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
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: '20px',
              height: '20px',
              cursor: 'nwse-resize',
              zIndex: 2147483647,
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '4px',
                bottom: '4px',
                width: '8px',
                height: '8px',
                borderRight: '2px solid #4a90e2',
                borderBottom: '2px solid #4a90e2',
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MarkdownEditorItem;
