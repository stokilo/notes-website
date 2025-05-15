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
    updateZoom(e.clientX, e.clientY); // Use clientX and clientY for mouse events
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateZoom(e.clientX, e.clientY); // Use clientX and clientY for mouse events
    } else {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) { // Only handle single-finger touch
      setIsDragging(true);
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      updateZoom(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault(); // Prevent scrolling/panning
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      updateZoom(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault(); // Prevent scrolling/panning
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

  return (
    <div
      style={{ textAlign: "center", margin: "20px 0", position: "relative" }}
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}

      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd} // Good practice to handle touchcancel
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
          touchAction: 'none', // Prevent default touch actions (scrolling) on the image
        }}
        ref={imageRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable="false"
      />

      {isDragging && zoomRectSize.width > 0 && (
        <div
          style={{
            position: "absolute",
            left: zoomPosition.x - zoomRectSize.width / 2,
            top: zoomPosition.y - zoomRectSize.height / 2,
            width: `${zoomRectSize.width}px`,
            height: `${zoomRectSize.height}px`,
            border: "2px solid red",
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={currentImage}
            alt="Zoomed"
            style={{
              position: "absolute",
              left: -zoomPosition.x * zoomFactor + zoomRectSize.width / 2,
              top: -zoomPosition.y * zoomFactor + zoomRectSize.height / 2,
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

      <button
        onClick={toggleImage}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {showFirst ? buttonTextRight : buttonTextLeft}
      </button>
    </div>
  );
};

export default ImageToggleButton;