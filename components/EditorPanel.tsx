import React, { useRef } from "react";
import { Download, Upload, Copy, Maximize2, Minimize2, X } from "lucide-react";
import SimulationViewer from "./SimulationViewer";

interface EditorPanelProps {
  editorPos: { x: number; y: number };
  isDraggingEditor: boolean;
  setIsDraggingEditor: (isDragging: boolean) => void;
  dragStartRef: React.MutableRefObject<{ x: number; y: number }>;
  setEditorPos: (pos: { x: number; y: number }) => void;
  activeMcuUid: string | null;
  components: any[];
  setActiveMcuUid: (uid: string | null) => void;
  code: string;
  handleCodeChange: (code: string) => void;
  handleClose: () => void;
  consoleLogs: any[];
  setConsoleLogs: (logs: any[]) => void;
  simState: any;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  editorPos,
  isDraggingEditor,
  setIsDraggingEditor,
  dragStartRef,
  setEditorPos,
  activeMcuUid,
  components,
  setActiveMcuUid,
  code,
  handleCodeChange,
  handleClose,
  consoleLogs,
  setConsoleLogs,
  simState,
}) => {
  return (
    <div
      style={{ left: editorPos.x, top: editorPos.y }}
      className="absolute w-[600px] h-[600px] bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50 transition-shadow duration-200"
    >
      <div
        className="p-2 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between cursor-move select-none"
        onMouseDown={(e) => {
          setIsDraggingEditor(true);
          dragStartRef.current = {
            x: e.clientX - editorPos.x,
            y: e.clientY - editorPos.y,
          };
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">
            Target MCU:
          </span>
          <select
            value={activeMcuUid || ""}
            onChange={(e) => setActiveMcuUid(e.target.value || null)}
            className="bg-gray-900 border border-gray-700 text-xs rounded px-2 py-1 text-gray-300 outline-none focus:border-blue-500"
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking select
          >
            <option value="">No MCU Selected</option>
            {components
              .filter((c) => c.type === "MICROCONTROLLER")
              .map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.name} ({c.uid.substr(0, 4)})
                </option>
              ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-900/50 rounded text-gray-400 hover:text-red-400 transition-colors ml-2"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <textarea
        className="flex-1 bg-[#1e1e1e] text-gray-300 font-mono p-4 resize-none outline-none text-sm"
        value={code}
        onChange={(e) => handleCodeChange(e.target.value)}
        spellCheck={false}
        disabled={!activeMcuUid}
        placeholder={
          !activeMcuUid
            ? "Select a valid Microcontroller to write code."
            : "// Write your code here..."
        }
      />

      {/* Console & Simulation Split Pane */}
      <div className="h-1/3 border-t border-gray-800 bg-black flex flex-row rounded-b-xl overflow-hidden">
        {/* Console Section */}
        <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
          <div className="px-4 py-2 bg-gray-900/90 text-gray-400 text-xs font-bold border-b border-gray-800 flex justify-between">
            <span>CONSOLE</span>
            <button
              onClick={() => setConsoleLogs([])}
              className="hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
            {consoleLogs.length === 0 && (
              <span className="text-gray-700 italic">Ready...</span>
            )}
            {consoleLogs.map((log) => (
              <div
                key={log.id}
                className={`${log.type === "error" ? "text-red-400" : log.type === "system" ? "text-yellow-500" : "text-gray-300"}`}
              >
                <span className="opacity-50 mr-2">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                {log.message}
              </div>
            ))}
          </div>
        </div>
        {/* Simulation View Section */}
        <div className="w-[40%] bg-gray-900 relative border-l border-gray-800">
          <SimulationViewer state={simState} />
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
