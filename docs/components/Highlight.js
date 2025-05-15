import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

export const Highlight = ({ children, color, className, ...props }) => {
  const baseStyle = {
    backgroundColor: color,
    borderRadius: '20px',
    color: '#fff',
    padding: '8px 16px', // Slightly adjusted padding for balance
    cursor: 'default',
    display: 'inline-block', // Allows for more flexible layout
    fontSize: '0.9rem',       // Slightly smaller font for better pill appearance
    lineHeight: 1.2,        // Improve vertical rhythm
    transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Smooth transitions
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
  };

  const hoverStyle = {
    backgroundColor: darkenColor(color, 10), // Darken on hover
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Enhance shadow on hover
  };

  // Helper function to darken a color (basic implementation)
  function darkenColor(hex, percent) {
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(1, 3), 16) - percent)).toString(16).padStart(2, '0');
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(3, 5), 16) - percent)).toString(16).padStart(2, '0');
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(5, 7), 16) - percent)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }


  const combinedStyle = {
    ...baseStyle,
    ...props.style, // Allow users to override styles
  };

  return (
    <span
      style={combinedStyle}
      className={className} // Allow users to add custom classes
      {...props} // Pass other props to the span
    >
      {children}
    </span>
  );
};

Highlight.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
  className: PropTypes.string,      // Optional CSS class
  style: PropTypes.object,        // Optional style overrides
};

Highlight.defaultProps = {
  className: '',  // Default empty string
  style: {},      // Default empty object
};

export default Highlight;