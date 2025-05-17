import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ImageMetadata = ({ imageUrl }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Try to get EXIF data if available
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Create a FileReader to read the image data
          const reader = new FileReader();
          
          reader.onload = function(e) {
            const view = new DataView(e.target.result);
            
            // Check for JPEG EXIF data
            if (view.getUint16(0, false) === 0xFFD8) {
              const exifData = {};
              let offset = 2;
              
              while (offset < view.byteLength) {
                if (view.getUint16(offset, false) === 0xFFE1) {
                  const exifLength = view.getUint16(offset + 2, false);
                  const exifStart = offset + 10;
                  
                  // Extract some basic EXIF data
                  try {
                    const tiffOffset = exifStart;
                    const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
                    
                    // Extract date taken if available
                    const dateTimeOffset = findEXIFTag(view, tiffOffset, littleEndian, 0x9003);
                    if (dateTimeOffset) {
                      exifData.dateTime = getStringFromDB(view, dateTimeOffset, 20);
                    }
                    
                    // Extract camera make if available
                    const makeOffset = findEXIFTag(view, tiffOffset, littleEndian, 0x010F);
                    if (makeOffset) {
                      exifData.make = getStringFromDB(view, makeOffset, 20);
                    }
                    
                    // Extract camera model if available
                    const modelOffset = findEXIFTag(view, tiffOffset, littleEndian, 0x0110);
                    if (modelOffset) {
                      exifData.model = getStringFromDB(view, modelOffset, 20);
                    }
                  } catch (e) {
                    console.warn('Error parsing EXIF data:', e);
                  }
                  
                  break;
                }
                offset += 2 + view.getUint16(offset + 2, false);
              }
              
              setMetadata({ ...basicMetadata, exif: exifData });
            } else {
              setMetadata(basicMetadata);
            }
          };
          
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          console.warn('Error reading EXIF data:', e);
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