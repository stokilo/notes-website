import React, { useEffect, useState } from 'react';
import { createHighlighter } from 'shiki'; // Import needed things from shiki
import styles from './ShikiCodeBlock.module.css'; // Import a CSS module

const ShikiCodeBlock = ({ code, language, theme, source }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [fileContent, setFileContent] = useState('');

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

  if (!isLoaded) {
    return <pre><code>Loading...</code></pre>; // Or some other loading indicator
  }

  return (
    <div className={styles.codeBlockContainer} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  );
};

export default ShikiCodeBlock;