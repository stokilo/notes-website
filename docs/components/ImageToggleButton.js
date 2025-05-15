import React, { useState, useRef } from "react";

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
  const [zoomRectSize, setZoomRectSize] = useState({ width: 0, height: 0 }); // Dynamically calculated
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const toggleImage = () => {
    setShowFirst(!showFirst);
    setIsDragging(false);
    setZoomPosition({ x: 0, y: 0 });
    setZoomRectSize({ width: 0, height: 0 }); // Reset zoom size
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateZoom(e);

    // Prevent image dragging (browser default)
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateZoom(e);
    } else {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const updateZoom = (e) => {
    if (!imageRef.current) return;

    const imageElement = imageRef.current;
    const rect = imageElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setZoomPosition({ x, y });
    }
  };

  const currentImage = showFirst ? firstImage.imageUrl : secondImage.imageUrl;

  // Calculate zoom rectangle size based on image dimensions
  React.useEffect(() => {
    if (imageRef.current) {
      const imageWidth = imageRef.current.width;
      const imageHeight = imageRef.current.height;
      const newZoomRectWidth = imageWidth * 0.25;  // 25% of image width
      const newZoomRectHeight = imageHeight * 0.25; // 25% of image height
      setZoomRectSize({ width: newZoomRectWidth, height: newZoomRectHeight });
    }
  }, [currentImage]); // Recalculate when the image changes

  return (
    <div
      style={{ textAlign: "center", margin: "20px 0", position: "relative" }}
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
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
          userSelect: "none", // Prevent image selection while dragging
        }}
        ref={imageRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable="false" // Prevent default image dragging
      />

      {isDragging && zoomRectSize.width > 0 && ( // Ensure size is calculated before rendering
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