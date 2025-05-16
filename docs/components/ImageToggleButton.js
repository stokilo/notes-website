import React, { useState, useRef } from "react";

const ImageToggleButton = ({
                             firstImage,
                             secondImage,
                             buttonTextLeft = "Show Left",
                             buttonTextRight = "Show Right",
                           }) => {
  const [showFirst, setShowFirst] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const toggleImage = () => {
    setShowFirst(!showFirst);
    if (isFullScreen) {
      setFullScreenImage(showFirst ? secondImage.imageUrl : firstImage.imageUrl);
    }
  };

  const currentImage = showFirst ? firstImage.imageUrl : secondImage.imageUrl;

  const enterFullScreen = () => {
    setIsFullScreen(true);
    setFullScreenImage(currentImage);
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
    setFullScreenImage(null);
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
            <div style={{ 
              padding: "10px", 
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button onClick={enterFullScreen} style={buttonStyle}>
                Zoom
              </button>
            </div>
            <img
              src={currentImage}
              alt="Comparison"
              onClick={enterFullScreen}
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
                margin: "0 auto",
                cursor: "pointer",
              }}
            />
            <div style={{ 
              padding: "10px", 
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
            }}>
              <button
                onClick={toggleImage}
                disabled={showFirst}
                style={{
                  ...buttonStyle,
                  ...(showFirst ? buttonStyle["&:disabled"] : buttonStyle),
                }}
              >
                {buttonTextLeft}
              </button>
              <button
                onClick={toggleImage}
                disabled={!showFirst}
                style={{
                  ...buttonStyle,
                  ...(!showFirst ? buttonStyle["&:disabled"] : buttonStyle),
                }}
              >
                {buttonTextRight}
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
          <img
            src={fullScreenImage}
            alt="Full Screen"
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
          />
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={toggleImage}
              disabled={showFirst}
              style={{
                ...buttonStyle,
                ...(showFirst ? buttonStyle["&:disabled"] : buttonStyle),
              }}
            >
              {buttonTextLeft}
            </button>
            <button
              onClick={toggleImage}
              disabled={!showFirst}
              style={{
                ...buttonStyle,
                ...(!showFirst ? buttonStyle["&:disabled"] : buttonStyle),
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

export default ImageToggleButton;