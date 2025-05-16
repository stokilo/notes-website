import React, { useState, useEffect } from "react";

const ImageCarousel = ({
  images,
  buttonTextLeft = "<",
  buttonTextRight = ">",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGif, setIsGif] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    // Reset loading state when image changes
    setIsLoading(true);
  }, [currentImage]);

  const handleImageLoad = () => {
    setIsLoading(false);
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
  };

  const imageContainerStyle = {
    position: "relative",
    display: "inline-block",
  };

  const filenameStyle = {
    marginTop: "8px",
    color: "#666",
    fontSize: "14px",
    padding: "4px 8px",
  };

  const loadingStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#666",
    fontSize: "16px",
  };

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
              {isLoading && <div style={loadingStyle}>Loading...</div>}
              <img
                src={currentImage}
                alt={`Image ${currentIndex + 1}`}
                onClick={enterFullScreen}
                onLoad={handleImageLoad}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  cursor: "pointer",
                  userSelect: "none",
                  opacity: isLoading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
                {...(isGif && { autoPlay: true, loop: true })}
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
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <div 
            style={{
              ...imageContainerStyle,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isLoading && <div style={{...loadingStyle, color: "white"}}>Loading...</div>}
            <img
              src={currentImage}
              alt={`Full Screen Image ${currentIndex + 1}`}
              onClick={exitFullScreen}
              onLoad={handleImageLoad}
              style={{
                maxHeight: "85vh",
                maxWidth: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                overflow: "auto",
                cursor: "pointer",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                userSelect: "none",
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.3s ease",
              }}
              {...(isGif && { autoPlay: true, loop: true })}
            />
          </div>
          <div style={{
            ...filenameStyle,
            color: "white",
            marginTop: "16px",
          }}>
            {currentFileName}
          </div>
          <div style={{ marginTop: "10px" }}>
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

export default ImageCarousel;