// ./components/ImageToggleButton.js
import React, { useState } from "react";

const ImageToggleButton = ({
                             firstImage,
                             secondImage,
                             buttonTextLeft = "Show Left",
                             buttonTextRight = "Show Right"
                           }) => {
  const [showFirst, setShowFirst] = useState(true);

  const toggleImage = () => {
    setShowFirst(!showFirst);
  };

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <img
        src={showFirst ? firstImage.imageUrl : secondImage.imageUrl}
        alt="Comparison"
        style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
      />
      <button
        onClick={toggleImage}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer"
          // Add more styling as needed
        }}
      >
        {showFirst ? buttonTextRight : buttonTextLeft}
      </button>
    </div>
  );
};

export default ImageToggleButton;