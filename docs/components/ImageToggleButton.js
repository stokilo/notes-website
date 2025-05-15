// ./components/ImageToggleButton.js
import React, { useState, useRef, useEffect } from "react";

const ImageToggleButton = ({
                             firstImage,
                             secondImage
                             // buttonTextLeft and buttonTextRight props are no longer used
                             // in this swipe-based implementation.
                           }) => {
  // State to track the position of the slider (0 to 100 percentage)
  const [sliderPosition, setSliderPosition] = useState(50); // Start in the middle
  // State to track if the user is currently dragging the slider
  const [isDragging, setIsDragging] = useState(false);
  // Ref to the container element to measure its width and track pointer position
  const containerRef = useRef(null);

  // Effect to add and remove global event listeners for dragging
  // We add listeners to the document so dragging continues even if the pointer
  // leaves the component area.
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      // Prevent default behavior like text selection or image dragging
      e.preventDefault();

      const containerRect = containerRef.current.getBoundingClientRect();
      // Get the pointer's X position (unified for mouse and touch)
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      // Calculate the position relative to the container's left edge
      let newPosition = (clientX - containerRect.left) / containerRect.width * 100;

      // Clamp the position between 0 and 100 to stay within bounds
      newPosition = Math.max(0, Math.min(100, newPosition));

      setSliderPosition(newPosition);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    // Add event listeners when dragging starts
    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }

    // Clean up event listeners when dragging stops or component unmounts
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]); // Re-run effect only when isDragging changes

  // Handle pointer down event on the draggable handle
  const handleHandlePointerDown = (e) => {
    // Prevent default to avoid image drag or other browser behaviors
    e.preventDefault();
    setIsDragging(true);
  };

  // Handle pointer down event on the container itself
  // This allows clicking anywhere on the image to jump the slider to that position
  // and optionally start dragging immediately.
  const handleContainerPointerDown = (e) => {
    // Only start drag if clicking the container background or the images
    // (images have pointer-events: none, so clicks pass through)
    if (e.target === containerRef.current || e.target.tagName === "IMG") {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      let newPosition = (clientX - containerRect.left) / containerRect.width * 100;
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
      setIsDragging(true);
    }
  };


  const containerStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    margin: "20px auto",
    overflow: "hidden",
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
    // Add a minimum height
    minHeight: "300px" // Adjust this value based on your image aspect ratio and desired size
  };

  const imageStyle = {
    position: "absolute", // Position images on top of each other
    top: 0,
    left: 0,
    width: "100%",
    height: "100%", // Ensure images cover the container height
    objectFit: "cover", // Cover the area without distorting aspect ratio
    pointerEvents: "none", // Allow pointer events to pass through to the container/handle
    userSelect: "none"
    // transition: isDragging ? 'none' : 'width 0.1s ease', // Optional: Add transition when not dragging
  };

  // Style for the first image (left side)
  const firstImageStyle = {
    ...imageStyle,
    width: `${sliderPosition}%` // Control visible width based on slider position
  };

  // Style for the second image (right side)
  const secondImageStyle = {
    ...imageStyle,
    left: `${sliderPosition}%`, // Position based on slider
    width: `${100 - sliderPosition}%` // Control visible width based on slider
  };

  // Style for the draggable handle (SVG indicator)
  const handleStyle = {
    position: "absolute",
    top: 0,
    left: `${sliderPosition}%`, // Position based on slider
    transform: "translateX(-50%)", // Center the handle horizontally on the slider position
    height: "100%", // Make handle cover full height for easier dragging
    width: "40px", // Width of the draggable area/indicator
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: 10, // Ensure handle is on top of images
    display: "flex", // Use flexbox to center SVG vertically
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    touchAction: "none" // Prevent default touch actions on handle
  };

  // SVG icon for the handle (a vertical line with arrows)
  const svgIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "white", filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }} // Add a shadow for visibility
    >
      <line x1="12" y1="5" x2="12" y2="19"></line> {/* Vertical line */}
      <polyline points="19 12 12 19 5 12"></polyline> {/* Arrows */}
    </svg>
  );

  // Basic validation: Check if image URLs are provided
  if (!firstImage?.imageUrl || !secondImage?.imageUrl) {
    console.warn("ImageToggleButton: firstImage or secondImage props are missing or invalid.");
    // Render a fallback message or null if images are missing
    return <div style={{color: "red", textAlign: "center"}}>Error: Missing image URLs for comparison.</div>;
  }


  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onPointerDown={handleContainerPointerDown} // Allow dragging from container background/images
    >
      {/* First Image (Left side) */}
      <img
        src={firstImage.imageUrl}
        alt={firstImage.altText || "Before Image"} // Use provided alt text or default
        style={firstImageStyle}
      />

      {/* Second Image (Right side) */}
      <img
        src={secondImage.imageUrl}
        alt={secondImage.altText || "After Image"} // Use provided alt text or default
        style={secondImageStyle}
      />

      {/* Draggable Handle (SVG Indicator) */}
      <div
        style={handleStyle}
        onPointerDown={handleHandlePointerDown} // Allow dragging from the handle itself
      >
        {svgIcon}
      </div>
    </div>
  );
};

// Optional: Add PropTypes for better type checking
// import PropTypes from 'prop-types';
// ImageToggleButton.propTypes = {
//   firstImage: PropTypes.shape({
//     imageUrl: PropTypes.string.isRequired,
//     altText: PropTypes.string, // Optional alt text prop
//   }).isRequired,
//   secondImage: PropTypes.shape({
//     imageUrl: PropTypes.string.isRequired,
//     altText: PropTypes.string, // Optional alt text prop
//   }).isRequired,
//   // buttonTextLeft and buttonTextRight are not used in this slider version
// };


export default ImageToggleButton;