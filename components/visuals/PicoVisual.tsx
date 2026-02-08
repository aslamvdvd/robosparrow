import React from "react";

interface PicoVisualProps {
  width: number;
  height: number;
  isSelected: boolean;
}

const PicoVisual: React.FC<PicoVisualProps> = ({
  width,
  height,
  isSelected,
}) => {
  return (
    <div
      className={`w-full h-full relative ${isSelected ? "drop-shadow-[0_0_15px_rgba(0,100,0,0.5)]" : ""}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* PCB Green */}
        <path
          d={`M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`}
          fill="#064e3b" // Dark Green
          stroke="#065f46"
          strokeWidth="1"
        />
        {/* Castellated Holes Simulation (Zig Zag Edges) - Simplified visualization */}
        <rect
          x="15"
          y="5"
          width={width - 30}
          height={height - 10}
          fill="none"
          stroke="#34d399"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />

        {/* Micro-USB Connector (Left Edge) */}
        <rect
          x="-5"
          y={height / 2 - 12}
          width="16"
          height="24"
          rx="2"
          fill="#d1d5db"
          stroke="#9ca3af"
        />

        {/* RP2040 Chip (Black Square) */}
        <rect
          x={width / 2 - 15}
          y={height / 2 - 15}
          width="30"
          height="30"
          rx="1"
          fill="#111827"
        />
        <text
          x={width / 2}
          y={height / 2 + 2}
          fontSize="5"
          fill="#9ca3af"
          textAnchor="middle"
          fontWeight="bold"
        >
          RP2040
        </text>

        {/* Wireless Shield (Silver/Metal) - Right Side */}
        <rect
          x={width - 55}
          y={height / 2 - 18}
          width="35"
          height="36"
          rx="2"
          fill="#d1d5db"
          stroke="#9ca3af"
        />
        <text
          x={width - 37}
          y={height / 2 + 2}
          fontSize="5"
          fill="#4b5563"
          textAnchor="middle"
          transform="rotate(-90)"
          style={{ transformOrigin: `${width - 37}px ${height / 2}px` }}
        >
          CYW43439
        </text>

        {/* BOOTSEL Button (White) */}
        <rect
          x="45"
          y={height / 2 - 8}
          width="10"
          height="16"
          rx="2"
          fill="white"
          stroke="#d1d5db"
        />
        <circle cx="50" cy={height / 2} r="3" fill="#e5e7eb" />
        <text
          x="50"
          y={height / 2 - 10}
          fontSize="5"
          fill="white"
          textAnchor="middle"
        >
          BOOTSEL
        </text>

        {/* Onboard LED (Green) */}
        <rect x="30" y="20" width="4" height="6" fill="#22c55e" />
        <text x="32" y="16" fontSize="5" fill="#22c55e" textAnchor="middle">
          LED
        </text>

        {/* 3 pins debug header (bottom middle) */}
        <rect
          x={width / 2 - 8}
          y={height - 8}
          width="16"
          height="4"
          fill="#d4af37"
        />

        {/* Logo Text */}
        <text
          x={width / 2}
          y="25"
          fontSize="10"
          fill="white"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          Raspberry Pi Pico W
        </text>
      </svg>
    </div>
  );
};

export default PicoVisual;
