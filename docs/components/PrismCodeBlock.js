import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

import 'prismjs/components/prism-java';

function PrismCodeBlock({ code, language }) {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre>
             <code ref={codeRef} className={`language-${language}`}>
               {code}
             </code>
           </pre>
  );
}

export default PrismCodeBlock;