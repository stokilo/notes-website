import React, { useEffect, useState } from 'react';
import { createHighlighter} from 'shiki'; // Import needed things from shiki

const ShikiCodeBlock = ({ code, language, theme }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function highlight() {
      try {

        const highlighter = await createHighlighter({
          themes: [theme],
          langs: ['java'],
        });

        const html = highlighter.codeToHtml(code, {
          lang: 'java',
          theme: theme
        })
        setHighlightedCode(html);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error highlighting code with Shiki:", error);
        setHighlightedCode(code);
        setIsLoaded(true);
      }
    }

    highlight();
  }, [code, language, theme]);

  if (!isLoaded) {
    return <pre><code>Loading...</code></pre>; // Or some other loading indicator
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  );
};

export default ShikiCodeBlock;