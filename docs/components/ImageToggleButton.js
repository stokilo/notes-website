import React, { useState, useRef, useEffect } from "react";

const ImageToggleButton = ({
                             firstImage,
                             secondImage,
                             buttonTextLeft = "Show Left",
                             buttonTextRight = "Show Right",
                             zoomFactor = 2,
                           }) => {
  const [showFirst, setShowFirst] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomRectSize, setZoomRectSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState({ x: null, y: null });

  const toggleImage = () => {
    setShowFirst(!showFirst);
    setIsDragging(false);
    setZoomPosition({ x: 0, y: 0 });
    setZoomRectSize({ width: 0, height: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateZoom(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateZoom(e.clientX, e.clientY);
    } else {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      updateZoom(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      updateZoom(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart({ x: null, y: null });
  };

  const updateZoom = (clientX, clientY) => {
    if (!imageRef.current) return;

    const imageElement = imageRef.current;
    const rect = imageElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMousePosition({ x: clientX, y: clientY });
      setZoomPosition({ x, y });
    }
  };

  const currentImage = showFirst ? firstImage.imageUrl : secondImage.imageUrl;

  useEffect(() => {
    if (imageRef.current) {
      const imageWidth = imageRef.current.width;
      const imageHeight = imageRef.current.height;
      const newZoomRectWidth = imageWidth * 0.50;
      const newZoomRectHeight = imageHeight * 0.50;
      setZoomRectSize({ width: newZoomRectWidth, height: newZoomRectHeight });
    }
  }, [currentImage]);

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

  return (
    <div
      style={{
        textAlign: "center",
        margin: "20px 0",
        position: "relative",
        fontFamily: "Arial, sans-serif",
      }}
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <img
        src={currentImage}
        alt="Comparison"
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
          margin: "0 auto",
          cursor: "move",
          userSelect: "none",
          touchAction: "none",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        ref={imageRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable="false"
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
      </div>

      {isDragging && zoomRectSize.width > 0 && (
        <div
          style={{
            position: "fixed", // Fixed position at the bottom
            bottom: "0", // Align to the bottom
            left: "50%", // Center horizontally
            transform: "translateX(-50%)", // Correctly center

            width: `${zoomRectSize.width}px`, // Set rectangle width
            height: `${zoomRectSize.height}px`, // Set rectangle height
            borderTop: "2px solid red",
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            justifyContent: "center", // Center the content
            alignItems: "center",     // Align items vertically
            overflow: "hidden",
          }}
        >
          <img
            src={currentImage}
            alt="Zoomed"
            style={{
              position: "absolute",
              left: -zoomPosition.x * zoomFactor + zoomRectSize.width/2,
              top: -zoomPosition.y * zoomFactor + zoomRectSize.height/2,
              width: imageRef.current
                ? imageRef.current.width * zoomFactor
                : "auto",
              height: imageRef.current
                ? imageRef.current.height * zoomFactor
                : "auto",
              pointerEvents: "none",
              maxWidth: "none",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageToggleButton;