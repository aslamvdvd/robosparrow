import React, { useState, useRef } from "react";
import { PlacedComponent } from "../types";
import ArduinoVisual from "./visuals/ArduinoVisual";
import Esp32Visual from "./visuals/Esp32Visual";
import PicoVisual from "./visuals/PicoVisual";
import LEDVisual from "./visuals/LEDVisual";
import BreadboardVisual from "./visuals/BreadboardVisual";

interface Props {
  component: PlacedComponent;
  onMove: (id: string, x: number, y: number) => void;
  onPinClick: (compUid: string, pinId: string, x: number, y: number) => void;
  isSelected: boolean;
  selectedPin: { compUid: string; pinId: string } | null;
  scale: number; // New prop for zoom scale
}

const WorkspaceComponent: React.FC<Props> = ({
  component,
  onMove,
  onPinClick,
  isSelected,
  selectedPin,
  scale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    // Calculate offset in CANVAS coordinates (divide by scale)
    dragOffset.current = {
      x: e.clientX / scale - component.position.x,
      y: e.clientY / scale - component.position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(
        component.uid,
        e.clientX / scale - dragOffset.current.x,
        e.clientY / scale - dragOffset.current.y,
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
  const isBreadboard = component.id === "breadboard-full";

  const getBodyStyle = () => {
    if (isArduino) return "bg-transparent border-none"; // SVG handles visual
    if (isLED || isBreadboard) return "bg-transparent border-none";

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
      ) : isEsp32 ? (
        <Esp32Visual
          width={component.width}
          height={component.height}
          isSelected={isSelected}
        />
      ) : isPico ? (
        <PicoVisual
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
      ) : isBreadboard ? (
        <BreadboardVisual
          width={component.width}
          height={component.height}
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

export default WorkspaceComponent;
