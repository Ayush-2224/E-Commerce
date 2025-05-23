import React from "react";

const HorizontalLine = ({
  color = "#e5e7eb",      // Default: Tailwind gray-200
  thickness = "1px",     // Default thickness
  margin = "1rem 0",     // Default vertical spacing
  width = "100%",        // Default full width
  style = {},            // Optional custom styles
}) => {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${thickness} solid ${color}`,
        margin: margin,
        width: width,
        ...style, // allow overriding any style
      }}
    />
  );
};

export default HorizontalLine;
