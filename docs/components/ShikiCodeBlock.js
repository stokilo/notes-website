import React, { useEffect, useState } from 'react';
import { createHighlighter } from 'shiki'; // Import needed things from shiki
import styles from './ShikiCodeBlock.module.css'; // Import a CSS module

const ShikiCodeBlock = ({ code, language, theme, source }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    async function fetchCode() {
      if (source) {
        try {
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`Failed to fetch code from ${source}: ${response.status} ${response.statusText}`);
          }
          const text = await response.text();
          setFileContent(text);
        } catch (error) {
          console.error("Error fetching code from source:", error);
          setFileContent(`Error: Could not load code from ${source}`);
        }
      }
    }

    fetchCode();
  }, [source]);

  useEffect(() => {
    async function highlight() {
      try {
        const highlighter = await createHighlighter({
          themes: [theme],
          langs: [language], // Use the language prop
        });

        const codeToHighlight = source ? fileContent : code; // Use fetched content or code prop
        const html = highlighter.codeToHtml(codeToHighlight, {
          lang: language, // Use the language prop
          theme: theme
        });

        setHighlightedCode(html);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error highlighting code with Shiki:", error);
        setHighlightedCode(source ? fileContent : code);
        setIsLoaded(true);
      }
    }

    if (fileContent || code) { // Only highlight if code is available
      highlight();
    }
  }, [code, language, theme, fileContent, source]);

  const enterFullScreen = () => {
    setIsFullScreen(true);
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
  };

  if (!isLoaded) {
    return <pre><code>Loading...</code></pre>; // Or some other loading indicator
  }

  const buttonStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    margin: "0 8px",
    transition: "background-color 0.3s ease",
  };

  const containerStyle = {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  return (
    <>
      {!isFullScreen ? (
        <div style={containerStyle}>
          <div style={{ 
            padding: "10px", 
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
            display: "flex",
            justifyContent: "flex-end"
          }}>
            <button onClick={enterFullScreen} style={buttonStyle}>
              Zoom
            </button>
          </div>
          <div className={styles.codeBlockContainer}>
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div 
            style={{
              maxHeight: "80vh",
              maxWidth: "90%",
              overflow: "auto",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={exitFullScreen} style={buttonStyle}>
              Exit Zoom
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShikiCodeBlock;