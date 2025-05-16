import React, { useState, useEffect } from "react";

const ImageCarousel = ({
  images,
  buttonTextLeft = "<",
  buttonTextRight = ">",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isGif, setIsGif] = useState(false);

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
  }, [currentImage]);

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
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "14px",
    zIndex: 1,
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
              <img
                src={currentImage}
                alt={`Image ${currentIndex + 1}`}
                onClick={enterFullScreen}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  margin: "0 auto",
                  cursor: "pointer",
                }}
                {...(isGif && { autoPlay: true, loop: true })}
              />
              <div style={filenameStyle}>
                {currentFileName}
              </div>
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
          }}
        >
          <div style={imageContainerStyle}>
            <img
              src={currentImage}
              alt={`Full Screen Image ${currentIndex + 1}`}
              onClick={exitFullScreen}
              style={{
                maxHeight: "80vh",
                maxWidth: "90%",
                objectFit: "contain",
                overflow: "auto",
                cursor: "pointer",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
              {...(isGif && { autoPlay: true, loop: true })}
            />
            <div style={filenameStyle}>
              {currentFileName}
            </div>
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