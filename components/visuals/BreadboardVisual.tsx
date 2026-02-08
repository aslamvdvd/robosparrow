import React from "react";

interface BreadboardVisualProps {
  width: number;
  height: number;
  isSelected: boolean;
}

const BreadboardVisual: React.FC<BreadboardVisualProps> = ({
  width,
  height,
  isSelected,
}) => {
  return (
    <div
      className={`w-full h-full relative ${isSelected ? "drop-shadow-[0_0_10px_rgba(0,0,0,0.2)]" : ""}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Body (White/Off-white Plastic) */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="4"
          fill="#f9fafb"
          stroke="#d1d5db"
          strokeWidth="1"
        />

        {/* Center Groove */}
        <rect
          x="10"
          y={height / 2 - 4}
          width={width - 20}
          height="8"
          fill="#e5e7eb"
          rx="2"
        />

        {/* Power Rails Stripes (Red/Blue) */}
        {/* Top */}
        <line
          x1="20"
          y1="12"
          x2={width - 20}
          y2="12"
          stroke="#ef4444"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
        <line
          x1="20"
          y1="33"
          x2={width - 20}
          y2="33"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Bottom */}
        <line
          x1="20"
          y1={height - 33}
          x2={width - 20}
          y2={height - 33}
          stroke="#ef4444"
          strokeWidth="2"
          strokeOpacity="0.8"
        />
        <line
          x1="20"
          y1={height - 12}
          x2={width - 20}
          y2={height - 12}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeOpacity="0.8"
        />

        {/* Grid Labels (Simplified) */}
        {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((n) => (
          <text
            key={n}
            x={18 + (n - 1) * 9.15}
            y="55"
            fontSize="8"
            fill="#9ca3af"
            textAnchor="middle"
          >
            {n}
          </text>
        ))}

        <defs>
          <pattern
            id="grid-pattern-bb"
            width="9.15"
            height="9.15"
            patternUnits="userSpaceOnUse"
          >
            <rect x="2" y="2" width="5" height="5" fill="#1f2937" rx="1" />
          </pattern>
        </defs>

        {/* Top Grid Area */}
        <rect
          x="15"
          y="60"
          width={width - 30}
          height="40"
          fill="url(#grid-pattern-bb)"
          opacity="0.1"
        />

        {/* Bottom Grid Area */}
        <rect
          x="15"
          y="125"
          width={width - 30}
          height="40"
          fill="url(#grid-pattern-bb)"
          opacity="0.1"
        />
      </svg>
    </div>
  );
};

export default BreadboardVisual;
