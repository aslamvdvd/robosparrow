import React, { useState, useRef } from "react";
import { PlacedComponent } from "../types";

interface Props {
  component: PlacedComponent;
  onMove: (id: string, x: number, y: number) => void;
  onPinClick: (compUid: string, pinId: string, x: number, y: number) => void;
  isSelected: boolean;
  selectedPin: { compUid: string; pinId: string } | null;
}

const WorkspaceComponent: React.FC<Props> = ({
  component,
  onMove,
  onPinClick,
  isSelected,
  selectedPin,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(
        component.uid,
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y,
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Determine Visual Style based on type
  // Determine Visual Style based on type
  const isArduino = component.id === "arduino-uno";
  const isEsp32 = component.id === "esp32-dev-v1";
  const isPico = component.id === "pico-w";
  const isLED = component.type === "LED";

  const getBodyStyle = () => {
    if (isArduino) return "bg-transparent border-none"; // SVG handles visual
    if (isLED) return "bg-transparent border-none";

    switch (component.type) {
      case "MICROCONTROLLER":
        return "bg-teal-900 border-teal-600 border-2";
      case "POWER":
        return "bg-yellow-900 border-yellow-600 border-2";
      case "ACTUATOR":
        return "bg-orange-900 border-orange-600 border-2";
      case "LED":
        return "bg-transparent border-none";
      case "BOARD":
        return "bg-white/90 border-gray-300 border-2 shadow-inner";

      default:
        return "bg-gray-800 border-gray-600 border-2";
    }
  };

  return (
    <div
      className={`absolute shadow-lg rounded-md select-none ${getBodyStyle()} ${!isArduino && isSelected ? "ring-2 ring-white" : ""}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        width: component.width,
        height: component.height,
        zIndex: isDragging ? 50 : 10,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Visual Layer */}
      {isArduino ? (
        <ArduinoVisual
          width={component.width}
          height={component.height}
          isSelected={isSelected}
        />
      ) : isLED ? (
        <LEDVisual
          width={component.width}
          height={component.height}
          color={component.properties?.color || "#ef4444"}
          isSelected={isSelected}
        />
      ) : (
        <div className="absolute top-0 left-0 w-full p-1 bg-black/20 text-[10px] font-mono text-center truncate text-white/80 pointer-events-none">
          {component.name}
        </div>
      )}

      {/* Pin Layer */}
      {component.pins.map((pin) => {
        const isPinSelected =
          selectedPin?.compUid === component.uid &&
          selectedPin?.pinId === pin.id;
        // Adjust click area for ICSP pins which are tighter
        const isICSP = pin.id.startsWith("ICSP");
        // Visual offset to center the click area over the drawn pin
        // For standard headers: pin.x/y is the center relative to component
        return (
          <div
            key={pin.id}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(
                component.uid,
                pin.id,
                component.position.x + pin.x,
                component.position.y + pin.y,
              );
            }}
            className={`absolute rounded-full border border-gray-900 hover:scale-150 transition-transform cursor-crosshair z-20 group ${
              isPinSelected
                ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : pin.type === "power"
                  ? "bg-red-500"
                  : pin.type === "ground"
                    ? "bg-black"
                    : pin.type === "analog"
                      ? "bg-yellow-400"
                      : "bg-green-400"
            }`}
            style={{
              left: pin.x - (isICSP ? 3 : 5),
              top: pin.y - (isICSP ? 3 : 5),
              width: isICSP ? 6 : 10,
              height: isICSP ? 6 : 10,
            }}
          >
            {/* Tooltip */}
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[10px] whitespace-nowrap rounded-md z-50 pointer-events-none border border-gray-700 shadow-xl">
              <div className="font-bold text-blue-300 mb-0.5">{pin.name}</div>
              {/* {pin.id} */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ArduinoVisual: React.FC<{
  width: number;
  height: number;
  isSelected: boolean;
}> = ({ width, height, isSelected }) => {
  return (
    <div
      className={`w-full h-full relative ${isSelected ? "drop-shadow-[0_0_15px_rgba(0,135,143,0.5)]" : ""}`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* PCB Body with authentic shape */}
        <path
          d={`M 25 0 L ${width - 5} 0 L ${width} 5 L ${width} ${height - 5} L ${width - 5} ${height} L 60 ${height} L 55 ${height - 5} L 55 ${height - 35} L 25 ${height - 35} L 25 0 Z`}
          fill="#00878F"
          stroke="#005f63"
          strokeWidth="2"
        />

        {/* USB-B Connector Square Part (Silver) */}
        <rect
          x="-8"
          y="25"
          width="40"
          height="40"
          rx="2"
          fill="#d1d5db"
          stroke="#9ca3af"
          strokeWidth="2"
        />
        <rect
          x="-2"
          y="30"
          width="30"
          height="30"
          rx="1"
          fill="#e5e7eb"
          opacity="0.5"
        />

        {/* DC Power Jack (Black) */}
        <rect
          x="-5"
          y={height - 50}
          width="45"
          height="40"
          rx="2"
          fill="#111827"
          stroke="#374151"
          strokeWidth="2"
        />
        <circle cx="20" cy={height - 30} r="4" fill="#374151" />

        {/* Polyfuse (Gold/Bronze near USB) */}
        <rect
          x="40"
          y="35"
          width="15"
          height="8"
          fill="#d4af37"
          stroke="#b45309"
          strokeWidth="1"
        />

        {/* ATmega16U2 (Small square chip near USB) */}
        <rect
          x="45"
          y="60"
          width="15"
          height="15"
          transform="rotate(45 52.5 67.5)"
          fill="#1f2937"
          stroke="#111827"
        />

        {/* ATmega328P Chip (DIP - Long Black) */}
        <rect
          x={width / 2 - 10}
          y={height / 2 + 30}
          width="100"
          height="30"
          rx="2"
          fill="#1f2937"
        />
        <text
          x={width / 2 + 40}
          y={height / 2 + 48}
          fill="#6b7280"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
        >
          ATMEGA328P
        </text>

        {/* Chip Legs */}
        {[...Array(14)].map((_, i) => (
          <rect
            key={`top-${i}`}
            x={width / 2 - 5 + i * 7}
            y={height / 2 + 27}
            width="3"
            height="3"
            fill="#9ca3af"
          />
        ))}
        {[...Array(14)].map((_, i) => (
          <rect
            key={`bot-${i}`}
            x={width / 2 - 5 + i * 7}
            y={height / 2 + 60}
            width="3"
            height="3"
            fill="#9ca3af"
          />
        ))}

        {/* Crystal Oscillator (Oval Silver) */}
        <ellipse
          cx="70"
          cy={height - 60}
          rx="10"
          ry="5"
          fill="#d1d5db"
          stroke="#9ca3af"
        />
        <text
          x="70"
          y={height - 60}
          fontSize="4"
          textAnchor="middle"
          fill="#666"
        >
          16.000
        </text>

        {/* Reset Button (Red/Silver) */}
        <rect
          x="40"
          y="10"
          width="14"
          height="14"
          fill="#ef4444"
          stroke="#991b1b"
          rx="2"
        />
        <circle cx="47" cy="17" r="3" fill="#b91c1c" />

        {/* Headers (Black Strips) - Aligned with pins in constants.ts */}
        {/* Top Right (Digital High) SCL(20) -> D8(128) */}
        <rect x="15" y="5" width="120" height="15" fill="#111827" />
        {/* Top Far Right (Digital Low) D7(152) -> D0(236) */}
        <rect x="147" y="5" width="95" height="15" fill="#111827" />

        {/* Bottom Power (Left) (NC(20) -> VIN(104)) */}
        <rect x="15" y={170} width="95" height="15" fill="#111827" />

        {/* Bottom Analog (Right) (A0(140) -> A5(200)) */}
        <rect x="135" y={170} width="70" height="15" fill="#111827" />

        {/* ICSP Header (2x3 Pins) - Main */}
        <rect
          x={220}
          y={80}
          width="30"
          height="20"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <rect
          x={223}
          y={83}
          width="24"
          height="14"
          fill="#111827"
          opacity="0.2"
          rx="2"
        />

        {/* Labels */}
        <text
          x={190}
          y="35"
          fill="white"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="end"
        >
          DIGITAL (PWM~)
        </text>
        <text
          x={60}
          y={165}
          fill="white"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          POWER
        </text>
        <text
          x={170}
          y={165}
          fill="white"
          fontSize="8"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          ANALOG IN
        </text>
        <text
          x={235}
          y={75}
          fill="white"
          fontSize="7"
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
        >
          ICSP
        </text>

        {/* Logo */}
        <text
          x={100}
          y="55"
          fill="white"
          fontSize="16"
          fontWeight="bold"
          fontFamily="sans-serif"
          style={{ letterSpacing: "1px" }}
        >
          ARDUINO
        </text>
        <text
          x={120}
          y="75"
          fill="white"
          fontSize="20"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          UNO
        </text>
        <circle
          cx="200"
          cy="65"
          r="9"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        />
        <text
          x="200"
          y="69"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
        >
          +
        </text>
        <text
          x="200"
          y="69"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          textAnchor="middle"
          transform="rotate(45 200 65)"
        >
          +
        </text>

        <text x={220} y="65" fill="white" fontSize="9" fontStyle="italic">
          R3
        </text>
        <text x={200} y={140} fill="white" fontSize="7" fontStyle="italic">
          Made in Italy
        </text>

        {/* RX/TX LEDs */}
        <rect x="150" y="90" width="8" height="4" fill="#374151" />
        <text x="145" y="94" fill="white" fontSize="7" textAnchor="end">
          TX
        </text>
        <rect x="150" y="100" width="8" height="4" fill="#374151" />
        <text x="145" y="104" fill="white" fontSize="7" textAnchor="end">
          RX
        </text>

        {/* Pin 13 LED (L) */}
        <circle cx="154" cy="80" r="3" fill="#fbbf24" opacity="0.5" />
        <text x="145" y="83" fill="white" fontSize="7" textAnchor="end">
          L
        </text>

        {/* ON LED */}
        <circle cx="240" cy="150" r="3" fill="#22c55e" />
        <text x="233" y="153" fill="white" fontSize="7" textAnchor="end">
          ON
        </text>
      </svg>
    </div>
  );
};

export default WorkspaceComponent;

const LEDVisual: React.FC<{
  width: number;
  height: number;
  color: string;
  isSelected: boolean;
}> = ({ width, height, color, isSelected }) => {
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
