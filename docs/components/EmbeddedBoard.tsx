import React from 'react';

interface EmbeddedBoardProps {
  serviceUrl: string;
  importUrl?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

const EmbeddedBoard: React.FC<EmbeddedBoardProps> = ({
  serviceUrl,
  importUrl,
  width = '100%',
  height = '500px',
  style = {},
}) => {
  const iframeUrl = importUrl 
    ? `${serviceUrl}?importUrl=${encodeURIComponent(importUrl)}`
    : serviceUrl;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        height,
        margin: '20px auto',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...style,
      }}
    >
      <iframe
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Embedded Board"
      />
    </div>
  );
};

export default EmbeddedBoard; 