import React from "react";

interface LEDVisualProps {
  width: number;
  height: number;
  color: string;
  isSelected: boolean;
}

const LEDVisual: React.FC<LEDVisualProps> = ({
  width,
  height,
  color,
  isSelected,
}) => {
  return (
    <div
      className={`w-full h-full relative flex items-center justify-center ${isSelected ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : ""}`}
    >
      {/* Bulb Body */}
      <div
        className="rounded-t-full rounded-b-md shadow-inner transition-colors duration-200"
        style={{
          width: width * 0.6,
          height: height * 0.7,
          backgroundColor: color,
          boxShadow: `inset -2px -2px 6px rgba(0,0,0,0.3), inset 2px 2px 6px rgba(255,255,255,0.4), 0 0 10px ${color}80`,
          borderBottom: "4px solid rgba(0,0,0,0.2)",
        }}
      />
      {/* Legs (Visual only, pins are overlaid) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 transform translate-y-1">
        <div className="w-1 h-3 bg-gray-400 -translate-x-1"></div>
        <div className="w-1 h-3 bg-gray-400 translate-x-1"></div>
      </div>
    </div>
  );
};

export default LEDVisual;
