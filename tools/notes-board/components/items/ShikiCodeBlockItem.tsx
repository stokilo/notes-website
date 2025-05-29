import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import * as shiki from 'shiki';
// Note: Direct grammar import does not work in browser builds. Use string language names.
// import javaGrammar from 'shiki/langs/java.tmLanguage.json';

// List of supported languages (strings only for browser compatibility)
const SUPPORTED_LANGUAGES = [
  'java',
  'typescript',
  'javascript',
  'html',
  'css',
  'json',
  'markdown',
  'bash',
  'shell',
  'kotlin',
  'scala',
  'groovy',
  'python',
  'ruby',
  'php',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'swift',
  'yaml',
  'xml',
  'sql',
  'graphql',
  'diff',
  'dockerfile',
  'ini',
  'toml',
  'plaintext'
];

// Singleton highlighter instance
let highlighterInstance: shiki.Highlighter | null = null;
let highlighterPromise: Promise<shiki.Highlighter> | null = null;

const getHighlighter = async () => {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = shiki.createHighlighter({
    themes: ['github-dark'],
    langs: SUPPORTED_LANGUAGES as shiki.BundledLanguage[],
  }).then(async instance => {
    // Preload all languages
    await Promise.all(SUPPORTED_LANGUAGES.map(lang => instance.loadLanguage(lang as shiki.BundledLanguage)));
    highlighterInstance = instance;
    return instance;
  }).catch(err => {
    console.error('Error creating highlighter:', err);
    highlighterPromise = null;
    throw err;
  });

  return highlighterPromise;
};

interface ShikiCodeBlockItemProps {
  width?: number;
  height?: number;
  code?: string;
  url?: string;
  language?: string;
  showPreview?: boolean;
  onClosePreview?: () => void;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  isPreview?: boolean;
  isViewMode?: boolean;
}

const ShikiCodeBlockItem: React.FC<ShikiCodeBlockItemProps> = ({
  width = 40,
  height = 40,
  code = '',
  url,
  language = 'java',
  showPreview = false,
  onClosePreview,
  onCodeChange,
  onLanguageChange,
  isPreview = false,
  isViewMode = false,
}) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorCode, setEditorCode] = useState(code);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update selected language when prop changes
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Detect language from code content
  useEffect(() => {
    const detectLanguage = async () => {
      if (!editorCode.trim()) return;
      
      try {
        const highlighter = await getHighlighter();
        
        const detected = highlighter.getLoadedLanguages().find(lang => {
          try {
            highlighter.codeToHtml(editorCode, { 
              lang: lang as shiki.BundledLanguage,
              themes: {
                light: 'github-dark',
                dark: 'github-dark'
              }
            });
            return true;
          } catch {
            return false;
          }
        });
        
        if (detected) {
          setDetectedLanguage(detected);
          if (selectedLanguage === 'plaintext') {
            setSelectedLanguage(detected);
            onLanguageChange?.(detected);
          }
        }
      } catch (err) {
        console.error('Language detection failed:', err);
      }
    };

    detectLanguage();
  }, [editorCode, selectedLanguage, onLanguageChange]);

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

        const highlighter = await getHighlighter();
        
        const highlighted = highlighter.codeToHtml(codeToHighlight, { 
          lang: selectedLanguage as shiki.BundledLanguage,
          themes: {
            light: 'github-dark',
            dark: 'github-dark'
          }
        });

        // Add a class to the highlighted code for styling
        const highlightedWithClass = highlighted.replace(
          '<pre class="shiki"',
          '<pre class="shiki shiki-code-block"'
        );

        setHighlightedCode(highlightedWithClass);
      } catch (err) {
        console.error('Highlighting error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load code');
        setHighlightedCode('');
      } finally {
        setIsLoading(false);
      }
    };

    if (showPreview) {
      highlightCode();
    }
  }, [code, url, selectedLanguage, showPreview]);

  // Add effect to handle view mode changes
  useEffect(() => {
    if (isViewMode) {
      // When entering view mode, ensure highlighter is initialized
      getHighlighter().catch(err => {
        console.error('Error initializing highlighter:', err);
      });
    }
  }, [isViewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside the editor dialog
      if (showEditor && event.target instanceof Element) {
        const dialog = document.querySelector('[style*="position: relative"][style*="zIndex: 100000"]');
        if (dialog?.contains(event.target)) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }

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
    if (isPreview) return;
    e.stopPropagation();
    setShowEditor(true);
    setEditorCode(code || '');
    setSelectedLanguage(language || 'plaintext');
  };

  const handleSave = () => {
    onCodeChange?.(editorCode);
    onLanguageChange?.(selectedLanguage);
    setShowEditor(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    // Update preview immediately when language changes
    const highlightCode = async () => {
      try {
        const highlighter = await getHighlighter();
        const highlighted = highlighter.codeToHtml(editorCode, { 
          lang: newLanguage as shiki.BundledLanguage,
          themes: {
            light: 'github-dark',
            dark: 'github-dark'
          }
        });
        const highlightedWithClass = highlighted.replace(
          '<pre class="shiki"',
          '<pre class="shiki shiki-code-block"'
        );
        setHighlightedCode(highlightedWithClass);
      } catch (err) {
        console.error('Highlighting error:', err);
      }
    };
    highlightCode();
  };

  // Add effect to update highlighted code when editor code changes
  useEffect(() => {
    const updateHighlightedCode = async () => {
      if (!editorCode.trim()) return;
      
      try {
        const highlighter = await getHighlighter();
        const highlighted = highlighter.codeToHtml(editorCode, { 
          lang: selectedLanguage as shiki.BundledLanguage,
          themes: {
            light: 'github-dark',
            dark: 'github-dark'
          }
        });
        const highlightedWithClass = highlighted.replace(
          '<pre class="shiki"',
          '<pre class="shiki shiki-code-block"'
        );
        setHighlightedCode(highlightedWithClass);
      } catch (err) {
        console.error('Highlighting error:', err);
      }
    };

    if (showEditor) {
      updateHighlightedCode();
    }
  }, [editorCode, selectedLanguage, showEditor]);

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
      {showEditor && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              isolation: 'isolate',
            }}
            onClick={(e) => {
              // Only close if clicking the backdrop itself
              if (e.target === e.currentTarget) {
                setShowEditor(false);
              }
            }}
          >
            {/* Dialog */}
            <div
              style={{
                position: 'relative',
                zIndex: 100000,
                backgroundColor: '#2d2d2d',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                width: '95vw',
                maxWidth: '1800px',
                height: '70vh',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: 'translateZ(0)',
              }}
              onClick={(e) => {
                // Stop propagation to prevent the backdrop click handler from firing
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                // Stop propagation to prevent the backdrop click handler from firing
                e.stopPropagation();
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
                  flexShrink: 0,
                  zIndex: 100001,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Edit Code</span>
                  {!isViewMode && (
                    <select
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      style={{
                        backgroundColor: '#3d3d3d',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        zIndex: 100002,
                      }}
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                  {detectedLanguage && detectedLanguage !== selectedLanguage && (
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>
                      Detected: {detectedLanguage}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isViewMode && (
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
                        zIndex: 100002,
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
                  )}
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
                      zIndex: 100002,
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
                  backgroundColor: '#1e1e1e',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 100001,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div 
                  style={{ display: 'flex', flex: 1, gap: '16px' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Editor */}
                  {!isViewMode && (
                    <div style={{ flex: 1, position: 'relative', zIndex: 100002 }}>
                      <textarea
                        value={editorCode}
                        onChange={(e) => {
                          const newCode = e.target.value;
                          setEditorCode(newCode);
                          // Update preview immediately
                          const updatePreview = async () => {
                            try {
                              const highlighter = await getHighlighter();
                              const highlighted = highlighter.codeToHtml(newCode, { 
                                lang: selectedLanguage as shiki.BundledLanguage,
                                themes: {
                                  light: 'github-dark',
                                  dark: 'github-dark'
                                }
                              });
                              const highlightedWithClass = highlighted.replace(
                                '<pre class="shiki"',
                                '<pre class="shiki shiki-code-block"'
                              );
                              setHighlightedCode(highlightedWithClass);
                            } catch (err) {
                              console.error('Highlighting error:', err);
                            }
                          };
                          updatePreview();
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          minHeight: '200px',
                          backgroundColor: '#1e1e1e',
                          color: '#fff',
                          border: 'none',
                          outline: 'none',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          padding: '12px',
                          borderRadius: '4px',
                          resize: 'none',
                          whiteSpace: 'pre',
                          tabSize: 2,
                          position: 'relative',
                          zIndex: 100003,
                        }}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                    </div>
                  )}
                  {/* Preview */}
                  <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 100002 }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: highlightedCode }} 
                      style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '4px',
                        padding: '16px',
                        height: '100%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
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
              {selectedLanguage.toUpperCase()} Code Preview
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
              <div 
                dangerouslySetInnerHTML={{ __html: highlightedCode }} 
                style={{
                  backgroundColor: '#1e1e1e',
                  borderRadius: '4px',
                  padding: '16px',
                }}
              />
            )}
          </div>
        </div>
      )}

      <style>
        {`
          .shiki-code-block {
            margin: 0;
            padding: 16px;
            background-color: #1e1e1e !important;
            border-radius: 4px;
            overflow: auto;
          }
          .shiki-code-block code {
            font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
            font-size: 14px;
            line-height: 1.5;
            display: block;
          }
          .shiki-code-block .line {
            display: block;
            min-height: 1.5em;
            padding: 0 1em;
          }
          .shiki-code-block .line-number {
            display: inline-block;
            width: 2em;
            text-align: right;
            margin-right: 1em;
            color: #666;
            user-select: none;
          }
          .shiki-code-block .highlighted {
            background-color: rgba(255, 255, 255, 0.1);
          }
          .shiki-code-block .keyword {
            color: #ff7b72;
          }
          .shiki-code-block .string {
            color: #a5d6ff;
          }
          .shiki-code-block .comment {
            color: #8b949e;
          }
          .shiki-code-block .function {
            color: #d2a8ff;
          }
          .shiki-code-block .class {
            color: #7ee787;
          }
          .shiki-code-block .number {
            color: #79c0ff;
          }
          .shiki-code-block .operator {
            color: #ff7b72;
          }
          .shiki-code-block .variable {
            color: #ffa657;
          }
          .shiki-code-block .parameter {
            color: #ffa657;
          }
          .shiki-code-block .property {
            color: #ffa657;
          }
          .shiki-code-block .type {
            color: #7ee787;
          }
          .shiki-code-block .modifier {
            color: #ff7b72;
          }
          .shiki-code-block .annotation {
            color: #ff7b72;
          }
        `}
      </style>
    </div>
  );
};

export default ShikiCodeBlockItem; 