import React from "react";
import ComponentCard from "./ComponentCard";

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
      {COMPONENT_LIBRARY.map((c) => (
        <ComponentCard key={c.id} component={c} onSelect={addComponent} />
      ))}
    </div>
  );
};

export default LibraryPanel;
