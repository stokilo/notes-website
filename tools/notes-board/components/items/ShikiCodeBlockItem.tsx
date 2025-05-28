import React, { useState, useEffect } from 'react';
import * as shiki from 'shiki';

interface ShikiCodeBlockItemProps {
  width?: number;
  height?: number;
  code?: string;
  url?: string;
  language?: string;
  showPreview?: boolean;
  onClosePreview?: () => void;
  onCodeChange?: (code: string) => void;
  isPreview?: boolean;
}

const ShikiCodeBlockItem: React.FC<ShikiCodeBlockItemProps> = ({
  width = 40,
  height = 40,
  code = '',
  url,
  language = 'typescript',
  showPreview = false,
  onClosePreview,
  onCodeChange,
  isPreview = false,
}) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorCode, setEditorCode] = useState(code);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If URL is provided, fetch the code
        let codeToHighlight = code;
        if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch code from URL: ${response.statusText}`);
          }
          codeToHighlight = await response.text();
        }

        const highlighter = await shiki.createHighlighter({
          themes: ['github-dark'],
          langs: ['typescript', 'javascript', 'html', 'css', 'json', 'markdown', 'bash', 'shell', 'java', 'kotlin', 'scala', 'groovy'],
        });
        
        const highlighted = highlighter.codeToHtml(codeToHighlight, { 
          lang: language,
          themes: {
            light: 'github-dark',
            dark: 'github-dark'
          }
        });
        setHighlightedCode(highlighted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load code');
        setHighlightedCode('');
      } finally {
        setIsLoading(false);
      }
    };

    if (showPreview) {
      highlightCode();
    }
  }, [code, url, language, showPreview]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClosePreview?.();
        setShowEditor(false);
      }
    };

    if (showPreview || showEditor) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPreview, showEditor, onClosePreview]);

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return; // Don't open editor if it's just a preview
    e.stopPropagation();
    setShowEditor(true);
    setEditorCode(code);
  };

  const handleSave = () => {
    onCodeChange?.(editorCode);
    setShowEditor(false);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width, 
        height,
      }}
    >
      {/* Code icon */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <svg
          width={width * 0.6}
          height={height * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="#4a90e2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Code editor dialog */}
      {showEditor && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
            backgroundColor: '#2d2d2d',
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
              backgroundColor: '#4a90e2',
              borderBottom: '1px solid #4d4d4d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              Edit {language.toUpperCase()} Code
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSave}
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
                Save
              </button>
              <button
                onClick={() => setShowEditor(false)}
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
                Cancel
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              position: 'relative',
            }}
          >
            <textarea
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                border: 'none',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                padding: '12px',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {/* Code preview dialog */}
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
            backgroundColor: '#2d2d2d',
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
              padding: `${Math.max(1, Math.floor(height * 0.1))}px ${Math.max(2, Math.floor(width * 0.1))}px`,
              backgroundColor: '#4a90e2',
              borderBottom: '1px solid #4d4d4d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
              {language.toUpperCase()} Code Preview
              {url && (
                <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                  from {url}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClosePreview?.();
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
              position: 'relative',
            }}
          >
            {isLoading ? (
              <div style={{ 
                color: '#fff', 
                textAlign: 'center', 
                padding: '20px',
                fontSize: '14px'
              }}>
                Loading code...
              </div>
            ) : error ? (
              <div style={{ 
                color: '#ff6b6b', 
                textAlign: 'center', 
                padding: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShikiCodeBlockItem; 