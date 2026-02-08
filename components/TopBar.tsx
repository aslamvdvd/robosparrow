import React from "react";
import {
  Play,
  Square,
  RefreshCw,
  Eraser,
  Download,
  Trash2,
} from "lucide-react";
import { SimulationState } from "../types";

interface TopBarProps {
  selectedCompId: string | null;
  deleteComponent: () => void;
  simState: SimulationState;
  runSimulation: () => void;
  stopSimulation: () => void;
  handleAnalyze: () => void;
  handleClearCanvas: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  selectedCompId,
  deleteComponent,
  simState,
  runSimulation,
  stopSimulation,
  handleAnalyze,
  handleClearCanvas,
}) => {
  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-lg tracking-tight">
          Robo Sparrow{" "}
          <span className="text-blue-500 text-xs uppercase ml-1 border border-blue-900 bg-blue-900/20 px-1 rounded">
            Alpha
          </span>
        </h1>
        {selectedCompId && (
          <button
            onClick={deleteComponent}
            className="flex items-center gap-2 px-3 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50 border border-red-900/50"
          >
            <Trash2 size={12} /> Delete Selected
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!simState.isRunning ? (
          <button
            onClick={runSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium text-sm transition-all shadow-lg shadow-green-900/20"
          >
            <Play className="w-4 h-4 fill-current" /> Run Simulation
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md font-medium text-sm transition-all"
          >
            <Square className="w-4 h-4 fill-current" /> Stop
          </button>
        )}
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-md font-medium text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Analyze Circuit
        </button>
        <button
          onClick={handleClearCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 rounded-md font-medium text-sm transition-all"
        >
          <Eraser className="w-4 h-4" /> Clear
        </button>
        <button className="p-2 text-gray-400 hover:text-white">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
