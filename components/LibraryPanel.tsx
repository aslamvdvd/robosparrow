import React from "react";
import ComponentCard from "./ComponentCard";
import { ComponentType } from "../types";

interface LibraryPanelProps {
  COMPONENT_LIBRARY: any[];
  addComponent: (component: any) => void;
  setActiveTab: (tab: any) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  COMPONENT_LIBRARY,
  addComponent,
  setActiveTab,
}) => {
  return (
    <div
      className="absolute top-4 left-4 w-64 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[80%] overflow-y-auto z-30 animate-in fade-in slide-in-from-left-4 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Components
        </h2>
        <button
          onClick={() => setActiveTab(null)} // Close panel
          className="text-gray-400 hover:text-white"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-6">
        {Object.entries(
          COMPONENT_LIBRARY.reduce(
            (acc, component) => {
              const typeLabel =
                {
                  [ComponentType.MICROCONTROLLER]: "Microcontrollers",
                  [ComponentType.ACTUATOR]: "Motors & Actuators",
                  [ComponentType.SENSOR]: "Sensors",
                  [ComponentType.LED]: "LEDs & Lights",
                  [ComponentType.POWER]: "Power & Batteries",
                  [ComponentType.BOARD]: "Boards & Extras",
                }[component.type] || "Other";

              if (!acc[typeLabel]) acc[typeLabel] = [];
              acc[typeLabel].push(component);
              return acc;
            },
            {} as Record<string, typeof COMPONENT_LIBRARY>,
          ),
        ).map(([category, components]) => (
          <div key={category}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-l-2 border-blue-500 pl-2">
              {category}
            </h3>
            <div className="flex flex-col gap-3">
              {(components as typeof COMPONENT_LIBRARY).map((c) => (
                <ComponentCard
                  key={c.id}
                  component={c}
                  onSelect={addComponent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPanel;
