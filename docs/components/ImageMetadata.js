import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ImageMetadata = ({ imageUrl }) => {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Function to extract shapes from image metadata
  const extractShapesFromMetadata = (metadata) => {
    const extractedShapes = [];
    
    // Check for EXIF data
    if (metadata.exif) {
      // Extract shapes from EXIF UserComment or other relevant fields
      if (metadata.exif.UserComment) {
        try {
          const userComment = metadata.exif.UserComment;
          console.log('Found EXIF UserComment:', userComment);
          // Try to parse JSON from UserComment
          const parsedData = JSON.parse(userComment);
          if (parsedData.shapes && Array.isArray(parsedData.shapes)) {
            console.log('Extracted shapes from EXIF:', parsedData.shapes);
            extractedShapes.push(...parsedData.shapes);
          }
        } catch (e) {
          console.warn('Could not parse shapes from EXIF UserComment:', e);
        }
      }
    }

    // Check for PNG text chunks
    if (metadata.png) {
      console.log('Found PNG chunks:', metadata.png);
      // Look for shapes in PNG text chunks
      Object.entries(metadata.png).forEach(([key, value]) => {
        if (key.toLowerCase().includes('shape') || key.toLowerCase().includes('region')) {
          try {
            const parsedData = JSON.parse(value);
            if (parsedData.shapes && Array.isArray(parsedData.shapes)) {
              console.log(`Extracted shapes from PNG chunk ${key}:`, parsedData.shapes);
              extractedShapes.push(...parsedData.shapes);
            }
          } catch (e) {
            console.warn(`Could not parse shapes from PNG chunk: ${key}`, e);
          }
        }
      });
    }

    // Check for XMP metadata
    if (metadata.xmp) {
      console.log('Found XMP metadata:', metadata.xmp);
      // Extract shapes from XMP metadata
      if (metadata.xmp.Regions) {
        try {
          const regions = JSON.parse(metadata.xmp.Regions);
          if (regions.shapes && Array.isArray(regions.shapes)) {
            console.log('Extracted shapes from XMP:', regions.shapes);
            extractedShapes.push(...regions.shapes);
          }
        } catch (e) {
          console.warn('Could not parse shapes from XMP Regions:', e);
        }
      }
    }

    console.log('All extracted shapes:', extractedShapes);
    return extractedShapes;
  };

  // Function to parse PNG chunks
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
      }

      offset += 12 + length; // Move to next chunk (length + type + data + CRC)
    }

    return chunks;
  };

  // Function to parse EXIF data
  const parseEXIF = (view, start, littleEndian) => {
    const exif = {};
    const entries = view.getUint16(start, littleEndian);
    let entryOffset = start + 2;

    for (let i = 0; i < entries; i++) {
      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valueOffset = entryOffset + 8;

      // Parse different EXIF tags
      switch (tag) {
        case 0x9286: // UserComment
          exif.UserComment = new TextDecoder().decode(
            view.buffer.slice(valueOffset, valueOffset + count)
          );
          break;
        case 0x9003: // DateTimeOriginal
          exif.dateTimeOriginal = new TextDecoder().decode(
            view.buffer.slice(valueOffset, valueOffset + count)
          );
          break;
      }

      entryOffset += 12;
    }

    return exif;
  };

  useEffect(() => {
    const loadImageMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a temporary image to get dimensions
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded with dimensions:', {
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.src = imageUrl;

        // Fetch the image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Create a FileReader to read the image data
        const reader = new FileReader();
        
        reader.onload = function(e) {
          const view = new DataView(e.target.result);
          const metadata = {
            width: 0,
            height: 0,
            exif: null,
            png: null,
            xmp: null
          };

          // Check file type and parse accordingly
          if (view.getUint16(0, false) === 0xFFD8) {
            console.log('Processing JPEG file');
            // JPEG file
            let offset = 2;
            while (offset < view.byteLength) {
              if (view.getUint16(offset, false) === 0xFFE1) {
                // EXIF marker found
                const exifLength = view.getUint16(offset + 2, false);
                const exifData = parseEXIF(view, offset + 10, true);
                metadata.exif = exifData;
                console.log('Found EXIF data:', exifData);
              }
              offset += 2 + view.getUint16(offset + 2, false);
            }
          } else if (
            view.getUint32(0, false) === 0x89504E47 &&
            view.getUint32(4, false) === 0x0D0A1A0A
          ) {
            console.log('Processing PNG file');
            // PNG file
            metadata.png = parsePNGChunks(view);
          }

          // Extract shapes from metadata
          const extractedShapes = extractShapesFromMetadata(metadata);
          console.log('Setting shapes state:', extractedShapes);
          setShapes(extractedShapes);

          // If no shapes found in metadata, try to detect shapes using image analysis
          if (extractedShapes.length === 0) {
            console.log('No shapes found in metadata, creating default shape');
            // Create a temporary image to get dimensions
            const img = new Image();
            img.onload = () => {
              metadata.width = img.naturalWidth;
              metadata.height = img.naturalHeight;
              
              // Create a default shape with the new format
              const defaultShape = {
                x: 0,
                y: 0,
                width: metadata.width,
                height: metadata.height,
                type: 'Rounded Rectangle',
                borderStyle: 'Solid',
                borderColor: 'Red',
                pillStyle: 'Modern',
                pillPosition: 0,
                pillSize: 0.1
              };
              console.log('Created default shape:', defaultShape);
              setShapes([defaultShape]);
            };
            img.src = imageUrl;
          }

          setLoading(false);
        };
        
        reader.readAsArrayBuffer(blob);
      } catch (err) {
        console.error('Error loading image metadata:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadImageMetadata();
  }, [imageUrl]);

  useEffect(() => {
    if (shapes && shapes.length > 0) {
      showOriginalImage();
    }
  }, [shapes]);

  const handleNextShape = () => {
    if (shapes && shapes.length > 0) {
      if (currentShapeIndex === -1) {
        // First click - show first shape
        setCurrentShapeIndex(0);
        zoomToShape(shapes[0]);
      } else {
        // Navigate to next shape if available
        const nextIndex = currentShapeIndex + 1;
        if (nextIndex < shapes.length) {
          setCurrentShapeIndex(nextIndex);
          zoomToShape(shapes[nextIndex]);
        }
      }
    }
  };

  const handlePreviousShape = () => {
    if (shapes && shapes.length > 0) {
      if (currentShapeIndex === 0) {
        // Going back to original view
        setCurrentShapeIndex(-1);
        showOriginalImage();
      } else {
        // Navigate to previous shape
        const prevIndex = currentShapeIndex - 1;
        setCurrentShapeIndex(prevIndex);
        zoomToShape(shapes[prevIndex]);
      }
    }
  };

  const zoomToShape = (shape) => {
    if (!imageRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    // Minimum dimensions for the shape
    const minWidth = 100;
    const minHeight = 200;

    // Add padding to small shapes
    const paddedWidth = Math.max(shape.width, minWidth);
    const paddedHeight = Math.max(shape.height, minHeight);

    // Calculate zoom level to fit the padded shape in the container
    const zoomX = containerWidth / (paddedWidth * 1.2); // Add 20% padding
    const zoomY = containerHeight / (paddedHeight * 1.2);
    const newZoom = Math.min(zoomX, zoomY);

    // Calculate center position of the shape
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    // Calculate new position to center the shape
    const newX = (containerWidth / 2) - (centerX * newZoom);
    const newY = (containerHeight / 2) - (centerY * newZoom);

    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  // Add function to show original image
  const showOriginalImage = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    marginBottom: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
  };

  const imageStyle = {
    position: 'absolute',
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    transformOrigin: '0 0',
    transition: 'transform 0.3s ease-out',
    maxWidth: 'none',
  };

  const shapeOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    transform: `scale(${1/zoom})`,
    transformOrigin: '0 0',
  };

  const shapeStyle = (shape, isCurrent) => ({
    position: 'absolute',
    left: `${shape.x}px`,
    top: `${shape.y}px`,
    width: `${shape.width}px`,
    height: `${shape.height}px`,
    border: `${isCurrent ? '3px' : '2px'} ${shape.borderStyle?.toLowerCase() || 'solid'} ${shape.borderColor?.toLowerCase() || '#ff0000'}`,
    borderRadius: shape.pillStyle === 'Modern' ? `${shape.pillSize * 100}%` : '0',
    pointerEvents: 'none',
    boxShadow: isCurrent ? '0 0 10px rgba(255, 0, 0, 0.5)' : 'none',
  });

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    minWidth: '60px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const middleButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    minWidth: '120px'
  };

  const middleButtonDisabledStyle = {
    ...middleButtonStyle,
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  };

  if (loading) {
    return <div style={containerStyle}>Loading image metadata...</div>;
  }

  if (error) {
    return <div style={containerStyle}>Error: {error}</div>;
  }

  return (
    <div style={containerStyle}>
      <div ref={containerRef} style={imageContainerStyle}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Image with shapes"
          style={imageStyle}
        />
      </div>
      
      {shapes && (
        <div style={controlsStyle}>
          <button
            style={!shapes.length || currentShapeIndex === -1 ? buttonDisabledStyle : buttonStyle}
            onClick={handlePreviousShape}
            disabled={!shapes.length || currentShapeIndex === -1}
          >
            {"<"}
          </button>
          <button
            style={middleButtonStyle}
            onClick={showOriginalImage}
          >
            Show Original
          </button>
          <button
            style={!shapes.length || currentShapeIndex === shapes.length - 1 ? buttonDisabledStyle : buttonStyle}
            onClick={handleNextShape}
            disabled={!shapes.length || currentShapeIndex === shapes.length - 1}
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  );
};

ImageMetadata.propTypes = {
  imageUrl: PropTypes.string.isRequired,
};

export default ImageMetadata; 