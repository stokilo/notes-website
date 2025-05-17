import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ImageMetadata = ({ imageUrl }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to parse PNG chunks
  const parsePNGChunks = (view) => {
    const chunks = {};
    let offset = 8; // Skip PNG signature

    while (offset < view.byteLength) {
      const length = view.getUint32(offset);
      const type = String.fromCharCode(
        view.getUint8(offset + 4),
        view.getUint8(offset + 5),
        view.getUint8(offset + 6),
        view.getUint8(offset + 7)
      );

      // Parse different chunk types
      switch (type) {
        case 'tEXt':
        case 'iTXt':
          const textData = new TextDecoder().decode(
            view.buffer.slice(offset + 8, offset + 8 + length)
          );
          const [keyword, text] = textData.split('\0');
          chunks[keyword] = text;
          break;
        case 'tIME':
          const year = view.getUint16(offset + 8);
          const month = view.getUint8(offset + 10);
          const day = view.getUint8(offset + 11);
          const hour = view.getUint8(offset + 12);
          const minute = view.getUint8(offset + 13);
          const second = view.getUint8(offset + 14);
          chunks.lastModified = new Date(year, month - 1, day, hour, minute, second).toISOString();
          break;
        case 'pHYs':
          chunks.pixelsPerUnitX = view.getUint32(offset + 8);
          chunks.pixelsPerUnitY = view.getUint32(offset + 12);
          chunks.unitSpecifier = view.getUint8(offset + 16);
          break;
        case 'gAMA':
          chunks.gamma = view.getUint32(offset + 8) / 100000;
          break;
        case 'cHRM':
          chunks.whitePointX = view.getUint32(offset + 8) / 100000;
          chunks.whitePointY = view.getUint32(offset + 12) / 100000;
          chunks.redX = view.getUint32(offset + 16) / 100000;
          chunks.redY = view.getUint32(offset + 20) / 100000;
          chunks.greenX = view.getUint32(offset + 24) / 100000;
          chunks.greenY = view.getUint32(offset + 28) / 100000;
          chunks.blueX = view.getUint32(offset + 32) / 100000;
          chunks.blueY = view.getUint32(offset + 36) / 100000;
          break;
      }

      offset += 12 + length; // Move to next chunk (length + type + data + CRC)
    }

    return chunks;
  };

  useEffect(() => {
    const loadImageMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a new image element
        const img = new Image();
        
        // Create a promise to handle the image load
        const imageLoadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error('Failed to load image'));
        });

        // Set the image source
        img.src = imageUrl;

        // Wait for the image to load
        const loadedImage = await imageLoadPromise;

        // Extract basic metadata
        const basicMetadata = {
          width: loadedImage.naturalWidth,
          height: loadedImage.naturalHeight,
          src: loadedImage.src,
          complete: loadedImage.complete,
          loadingTime: new Date().toISOString(),
        };

        // Try to get image-specific metadata
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Create a FileReader to read the image data
          const reader = new FileReader();
          
          reader.onload = function(e) {
            const view = new DataView(e.target.result);
            
            // Check file type and parse accordingly
            if (view.getUint16(0, false) === 0xFFD8) {
              // JPEG EXIF parsing (existing code)
              // ... existing code ...
            } else if (
              view.getUint32(0, false) === 0x89504E47 &&
              view.getUint32(4, false) === 0x0D0A1A0A
            ) {
              // PNG file
              const pngMetadata = parsePNGChunks(view);
              setMetadata({ ...basicMetadata, png: pngMetadata });
            } else {
              setMetadata(basicMetadata);
            }
          };
          
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          console.warn('Error reading image metadata:', e);
          setMetadata(basicMetadata);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadImageMetadata();
  }, [imageUrl]);

  // Helper function to find EXIF tags
  const findEXIFTag = (view, start, littleEndian, tag) => {
    const entries = view.getUint16(start, littleEndian);
    let entryOffset = start + 2;
    
    for (let i = 0; i < entries; i++) {
      if (view.getUint16(entryOffset, littleEndian) === tag) {
        return entryOffset + 8;
      }
      entryOffset += 12;
    }
    return null;
  };

  // Helper function to get string from DataView
  const getStringFromDB = (view, start, length) => {
    let str = '';
    for (let i = start; i < start + length; i++) {
      str += String.fromCharCode(view.getUint8(i));
    }
    return str.replace(/\0/g, '');
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const imageStyle = {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '20px',
  };

  const metadataStyle = {
    backgroundColor: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '14px',
  };

  const metadataItemStyle = {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#333',
  };

  const valueStyle = {
    color: '#666',
  };

  if (loading) {
    return <div style={containerStyle}>Loading image metadata...</div>;
  }

  if (error) {
    return <div style={containerStyle}>Error: {error}</div>;
  }

  return (
    <div style={containerStyle}>
      <img src={imageUrl} alt="Image with metadata" style={imageStyle} />
      <div style={metadataStyle}>
        <h3>Image Metadata</h3>
        {metadata && (
          <>
            <div style={metadataItemStyle}>
              <span style={labelStyle}>Dimensions:</span>
              <span style={valueStyle}>{metadata.width} x {metadata.height} pixels</span>
            </div>
            <div style={metadataItemStyle}>
              <span style={labelStyle}>Source:</span>
              <span style={valueStyle}>{metadata.src}</span>
            </div>
            <div style={metadataItemStyle}>
              <span style={labelStyle}>Loading Time:</span>
              <span style={valueStyle}>{metadata.loadingTime}</span>
            </div>
            {metadata.png && (
              <>
                {metadata.png.lastModified && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Last Modified:</span>
                    <span style={valueStyle}>{metadata.png.lastModified}</span>
                  </div>
                )}
                {metadata.png.pixelsPerUnitX && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Resolution:</span>
                    <span style={valueStyle}>
                      {metadata.png.pixelsPerUnitX} x {metadata.png.pixelsPerUnitY} pixels per unit
                      ({metadata.png.unitSpecifier === 1 ? 'meters' : 'unknown'})
                    </span>
                  </div>
                )}
                {metadata.png.gamma && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Gamma:</span>
                    <span style={valueStyle}>{metadata.png.gamma}</span>
                  </div>
                )}
                {Object.entries(metadata.png)
                  .filter(([key]) => !['lastModified', 'pixelsPerUnitX', 'pixelsPerUnitY', 'unitSpecifier', 'gamma'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} style={metadataItemStyle}>
                      <span style={labelStyle}>{key}:</span>
                      <span style={valueStyle}>{value}</span>
                    </div>
                  ))}
              </>
            )}
            {metadata.exif && (
              <>
                {metadata.exif.dateTime && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Date Taken:</span>
                    <span style={valueStyle}>{metadata.exif.dateTime}</span>
                  </div>
                )}
                {metadata.exif.make && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Camera Make:</span>
                    <span style={valueStyle}>{metadata.exif.make}</span>
                  </div>
                )}
                {metadata.exif.model && (
                  <div style={metadataItemStyle}>
                    <span style={labelStyle}>Camera Model:</span>
                    <span style={valueStyle}>{metadata.exif.model}</span>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

ImageMetadata.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default ImageMetadata; 