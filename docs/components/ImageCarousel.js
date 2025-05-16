import React, { useState, useEffect, useRef } from "react";
import BrowserOnly from '@docusaurus/BrowserOnly';

const ImageCarouselInner = ({
  images,
  buttonTextLeft = "<",
  buttonTextRight = ">",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGif, setIsGif] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const imageRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex].imageUrl;
  const currentFileName = images[currentIndex].imageUrl.split('/').pop();

  useEffect(() => {
    // Check if the current image is a GIF
    setIsGif(currentImage.toLowerCase().endsWith('.gif'));
    
    // Force image reload on iOS Safari
    if (imageRef.current) {
      imageRef.current.src = currentImage;
    }
  }, [currentImage]);

  const handleImageLoad = (e) => {
    // Set dimensions based on the first image
    if (!imageDimensions.width && !imageDimensions.height) {
      const maxWidth = viewportSize.width * 0.8; // 80% of viewport width
      const maxHeight = viewportSize.height * 0.6; // 60% of viewport height
      
      let width = e.target.naturalWidth;
      let height = e.target.naturalHeight;
      
      // Scale down if image is larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const scale = Math.min(widthRatio, heightRatio);
        
        width = width * scale;
        height = height * scale;
      }
      
      setImageDimensions({ width, height });
    }
  };

  const enterFullScreen = () => {
    setIsFullScreen(true);
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
  };

  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    margin: "0 8px",
    transition: "background-color 0.3s ease",
    userSelect: "none",
    "&:hover": {
      backgroundColor: "#388E3C",
    },
    "&:disabled": {
      backgroundColor: "#ccc",
      cursor: "not-allowed",
      color: "#666",
    },
  };

  const containerStyle = {
    textAlign: "center",
    margin: "20px 0",
    fontFamily: "Arial, sans-serif",
    maxWidth: "100%",
    overflow: "hidden",
  };

  const imageContainerStyle = {
    position: "relative",
    display: "inline-block",
    width: imageDimensions.width ? `${imageDimensions.width}px` : "auto",
    height: imageDimensions.height ? `${imageDimensions.height}px` : "auto",
    maxWidth: "100%",
  };

  const filenameStyle = {
    marginTop: "8px",
    color: "#666",
    fontSize: "14px",
    padding: "4px 8px",
  };

  const getImageStyle = (isFullScreenMode) => ({
    maxWidth: "100%",
    height: "auto",
    display: "block",
    margin: "0 auto",
    cursor: "pointer",
    userSelect: "none",
    ...(isFullScreenMode ? {
      maxHeight: "80vh",
      width: "auto",
      objectFit: "contain",
      overflow: "auto",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    } : {
      width: imageDimensions.width ? `${imageDimensions.width}px` : "auto",
      height: imageDimensions.height ? `${imageDimensions.height}px` : "auto",
      objectFit: "contain",
    })
  });

  return (
    <>
      {!isFullScreen ? (
        <div style={containerStyle}>
          <div style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            display: "inline-block",
            maxWidth: "100%",
          }}>
            <div style={imageContainerStyle}>
              <img
                ref={imageRef}
                src={currentImage}
                alt={`Image ${currentIndex + 1}`}
                onClick={enterFullScreen}
                onLoad={handleImageLoad}
                style={getImageStyle(false)}
                {...(isGif && { autoPlay: true, loop: true })}
                loading="eager"
              />
            </div>
            <div style={filenameStyle}>
              {currentFileName}
            </div>
            <div style={{ 
              padding: "10px", 
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
            }}>
              <button
                onClick={previousImage}
                disabled={currentIndex === 0}
                style={{
                  ...buttonStyle,
                  ...(currentIndex === 0 ? buttonStyle["&:disabled"] : {}),
                }}
              >
                {buttonTextLeft}
              </button>
              <button
                onClick={nextImage}
                disabled={currentIndex === images.length - 1}
                style={{
                  ...buttonStyle,
                  ...(currentIndex === images.length - 1 ? buttonStyle["&:disabled"] : {}),
                }}
              >
                {buttonTextRight}
              </button>
              <button onClick={enterFullScreen} style={buttonStyle}>
                Zoom
              </button>
            </div>
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
            boxSizing: "border-box",
            gap: "20px",
          }}
        >
          <div 
            style={{
              ...imageContainerStyle,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <img
              ref={imageRef}
              src={currentImage}
              alt={`Full Screen Image ${currentIndex + 1}`}
              onClick={exitFullScreen}
              onLoad={handleImageLoad}
              style={getImageStyle(true)}
              {...(isGif && { autoPlay: true, loop: true })}
              loading="eager"
            />
          </div>
          <div style={{
            ...filenameStyle,
            color: "white",
            marginTop: "0",
          }}>
            {currentFileName}
          </div>
          <div style={{ marginTop: "0" }}>
            <button
              onClick={previousImage}
              disabled={currentIndex === 0}
              style={{
                ...buttonStyle,
                ...(currentIndex === 0 ? buttonStyle["&:disabled"] : {}),
              }}
            >
              {buttonTextLeft}
            </button>
            <button
              onClick={nextImage}
              disabled={currentIndex === images.length - 1}
              style={{
                ...buttonStyle,
                ...(currentIndex === images.length - 1 ? buttonStyle["&:disabled"] : {}),
              }}
            >
              {buttonTextRight}
            </button>
            <button onClick={exitFullScreen} style={buttonStyle}>
              Exit Zoom
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const ImageCarousel= (props) => {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => {
        return <ImageCarouselInner {...props} />
      }}
    </BrowserOnly>
  );
};

export default ImageCarousel;