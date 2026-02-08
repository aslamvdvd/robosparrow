import React from "react";

interface Esp32VisualProps {
  width: number;
  height: number;
  isSelected: boolean;
}

const Esp32Visual: React.FC<Esp32VisualProps> = ({
  width,
  height,
  isSelected,
}) => {
  return (
    <div
      className={`w-full h-full relative ${isSelected ? "drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" : ""}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* PCB Board (Black) */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx="4"
          fill="#1f2937"
          stroke="#000"
          strokeWidth="1"
        />
        {/* ESP-WROOM-32 Shield (Silver/Metal) - Left Side */}
        <rect
          x="40"
          y="30"
          width="50"
          height="60"
          rx="2"
          fill="#d1d5db"
          stroke="#9ca3af"
          strokeWidth="1"
        />
        <rect
          x="75"
          y="30"
          width="15"
          height="60"
          rx="1"
          fill="#9ca3af"
          opacity="0.3"
        />{" "}
        {/* Antenna area distinction */}
        <text
          x="65"
          y="60"
          fontSize="8"
          fill="#4b5563"
          fontWeight="bold"
          transform="rotate(-90 65,60)"
          textAnchor="middle"
        >
          ESP-WROOM-32
        </text>
        {/* USB Micro-B Connector (Silver) - Left Edge */}
        <rect
          x="-6"
          y={height / 2 - 10}
          width="12"
          height="20"
          rx="2"
          fill="#d1d5db"
          stroke="#6b7280"
        />
        {/* Buttons (Tactile) */}
        {/* EN (Top Left) */}
        <rect
          x="45"
          y="10"
          width="10"
          height="10"
          rx="1"
          fill="#e5e7eb"
          stroke="#9ca3af"
        />
        <circle cx="50" cy="15" r="2" fill="#111827" />
        <text x="50" y="8" fontSize="6" fill="#9ca3af" textAnchor="middle">
          EN
        </text>
        {/* BOOT (Bottom Left) */}
        <rect
          x="45"
          y={height - 20}
          width="10"
          height="10"
          rx="1"
          fill="#e5e7eb"
          stroke="#9ca3af"
        />
        <circle cx="50" cy={height - 15} r="2" fill="#111827" />
        <text
          x="50"
          y={height - 5}
          fontSize="6"
          fill="#9ca3af"
          textAnchor="middle"
        >
          BOOT
        </text>
        {/* CP2102 Chip (Small Square) */}
        <rect
          x="15"
          y={height / 2 - 12}
          width="12"
          height="12"
          rx="1"
          fill="#111827"
        />
        {/* Power LED (Red) */}
        <circle cx="25" cy="25" r="2" fill="#ef4444" />
        <text x="32" y="27" fontSize="5" fill="#ef4444">
          PWR
        </text>
        {/* Blue LED (GPIO 2) */}
        <circle cx="25" cy={height - 25} r="2" fill="#3b82f6" opacity="0.8" />
        <text x="32" y={height - 23} fontSize="5" fill="#3b82f6">
          D2
        </text>
      </svg>
    </div>
  );
};

export default Esp32Visual;
