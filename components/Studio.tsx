import React, { useState, useRef, useEffect } from "react";
import { COMPONENT_LIBRARY } from "../constants";
import { GeminiModelId } from "../services/geminiService";
import { Trash2, X, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useSimulation } from "../hooks/useSimulation";
import { useCanvas } from "../hooks/useCanvas";
import { useCircuit } from "../hooks/useCircuit";
import { useAgent } from "../hooks/useAgent";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import EditorPanel from "./EditorPanel";
import LibraryPanel from "./LibraryPanel";
import SettingsPanel from "./SettingsPanel";
import ChatPanel from "./ChatPanel";
import Minimap from "./Minimap";
import WorkspaceComponent from "./WorkspaceComponent";
// import { GEMINI_MODELS } from "../services/geminiService";

// // Types for simulation loop
// type LoopFunction = () => void;
// type SetupFunction = () => void;

function Studio() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<
    "editor" | "library" | "chat" | null
  >("chat");
  // Circuit State handled by hook
  const {
    components,
    setComponents,
    connections,
    setConnections,
    code,
    setCode,
    activeMcuUid,
    setActiveMcuUid,
    handleCodeChange,
    selectedCompId,
    setSelectedCompId,
    selectedWireId,
    setSelectedWireId,
    selectedPin,
    setSelectedPin,
    addComponent,
    moveComponent,
    deleteComponent,
    deleteWire,
    handlePinClick,
  } = useCircuit();

  // Simulation State handled by hook
  const {
    simState,
    setSimState,
    consoleLogs,
    setConsoleLogs,
    runSimulation,
    stopSimulation,
    logToConsole,
  } = useSimulation({ code, components });

  // API Key State
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] =
    useState<GeminiModelId>("gemini-1.5-flash");
  const [showSettings, setShowSettings] = useState(false);

  // Agent State handled by hook
  const {
    chatInput,
    setChatInput,
    chatHistory,
    setChatHistory,
    isAiLoading,
    handleChatSubmit,
    handleStopGeneration,
    handleAnalyze,
    agentMode,
    setAgentMode,
    pendingActions,
    handleApprove,
    handleReject,
  } = useAgent({
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    code,
    setCode,
    components,
    setComponents,
    connections,
    setConnections,
    logToConsole,
    activeMcuUid,
    runSimulation,
    stopSimulation,
    setConsoleLogs,
    setActiveMcuUid,
    onOpenPanel: setActiveTab, // Map onOpenPanel to setActiveTab
  });

  // Save API key to localStorage when changed
  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    localStorage.setItem("robo-sparrow-api-key", key);
  };

  // Draggable Editor State
  const [editorPos, setEditorPos] = useState({
    x: Math.max(100, window.innerWidth - 1100),
    y: 20,
  });
  const [isDraggingEditor, setIsDraggingEditor] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Infinite Canvas State handled by hook
  const {
    transform,
    setTransform,
    viewportSize,
    canvasRef,
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    zoomIn,
    zoomOut,
    resetView,
  } = useCanvas();

  // Refs for Simulation Loop handled by hook

  // --- Actions ---

  // Helper: Orthogonal Routing (Manhattan)
  const getOrthogonalPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    seed: string = "",
  ) => {
    let jitter = 0;
    if (seed) {
      // Simple hash to create consistent offset based on ID
      const hash = seed
        .split("")
        .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
      jitter = ((Math.abs(hash) % 9) - 4) * 8; // Spread wires by +/- 32px
    }

    // Ensure midX doesn't drift too wildly, but defaults to center
    const midX = (x1 + x2) / 2 + jitter;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  };

  const handleClearCanvas = () => {
    if (
      confirm(
        "Are you sure you want to clear the canvas? This cannot be undone.",
      )
    ) {
      setComponents([]);
      setConnections([]);
      setConsoleLogs([]);
      stopSimulation();
    }
  };

  // Save model to localStorage when changed

  // --- Initialization ---
  // Clean slate on load
  useEffect(() => {
    // Optional: Load from LocalStorage if persisted
  }, []);

  // Initialization
  // Window resize handled by useCanvas hook

  // Handle Editor Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingEditor) {
        setEditorPos({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingEditor(false);
    };

    if (isDraggingEditor) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingEditor]);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar / Tools */}
      {/* Sidebar / Tools */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <TopBar
          selectedCompId={selectedCompId}
          deleteComponent={deleteComponent}
          simState={simState}
          runSimulation={runSimulation}
          stopSimulation={stopSimulation}
          handleAnalyze={() => handleAnalyze(() => setActiveTab("chat"))}
          handleClearCanvas={handleClearCanvas}
        />

        {/* Workspace + Split Pane */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Editor Panel Overlay (Draggable) */}
          {activeTab === "editor" && (
            <EditorPanel
              editorPos={editorPos}
              isDraggingEditor={isDraggingEditor}
              setIsDraggingEditor={setIsDraggingEditor}
              dragStartRef={dragStartRef}
              setEditorPos={setEditorPos}
              activeMcuUid={activeMcuUid}
              components={components}
              setActiveMcuUid={setActiveMcuUid}
              code={code}
              handleCodeChange={handleCodeChange}
              handleClose={() => setActiveTab(null)}
              consoleLogs={consoleLogs}
              setConsoleLogs={setConsoleLogs}
              simState={simState}
            />
          )}
          {/* Main Workspace (Always Visible) */}
          <div
            className="flex-1 relative bg-gray-950 grid-pattern overflow-hidden flex flex-col"
            onClick={() => {
              setSelectedCompId(null);
              setSelectedWireId(null);
              setSelectedPin(null);
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
            ref={canvasRef}
          >
            {/* Transform Container */}
            <div
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: "0 0",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Components Layer */}
              {components.map((comp) => (
                <div
                  key={comp.uid}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCompId(comp.uid);
                    setSelectedWireId(null);
                  }}
                >
                  <WorkspaceComponent
                    component={comp}
                    onMove={moveComponent}
                    onPinClick={handlePinClick}
                    isSelected={selectedCompId === comp.uid}
                    selectedPin={selectedPin}
                    scale={transform.scale}
                  />
                </div>
              ))}

              {/* Draw Connections (SVG Layer) */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
                {connections.map((conn) => {
                  const fromComp = components.find(
                    (c) => c.uid === conn.from.compUid,
                  );
                  const toComp = components.find(
                    (c) => c.uid === conn.to.compUid,
                  );

                  let x1 = 0,
                    y1 = 0,
                    x2 = 0,
                    y2 = 0;

                  // Resolve Start Point
                  if (conn.from.type === "pin" && fromComp) {
                    const pin = fromComp.pins.find(
                      (p) => p.id === conn.from.pinId,
                    );
                    if (pin) {
                      x1 = fromComp.position.x + pin.x;
                      y1 = fromComp.position.y + pin.y;
                    }
                  } else if (
                    conn.from.type === "point" &&
                    conn.from.x !== undefined
                  ) {
                    x1 = conn.from.x;
                    y1 = conn.from.y || 0;
                  }

                  // Resolve End Point
                  if (conn.to.type === "pin" && toComp) {
                    const pin = toComp.pins.find((p) => p.id === conn.to.pinId);
                    if (pin) {
                      x2 = toComp.position.x + pin.x;
                      y2 = toComp.position.y + pin.y;
                    }
                  } else if (
                    conn.to.type === "point" &&
                    conn.to.x !== undefined
                  ) {
                    x2 = conn.to.x;
                    y2 = conn.to.y || 0;
                  }

                  if (x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0) return null;

                  const isSelected = selectedWireId === conn.id;
                  const pathD = getOrthogonalPath(x1, y1, x2, y2, conn.id);

                  return (
                    <g
                      key={conn.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWireId(conn.id);
                        setSelectedCompId(null); // Deselect component
                      }}
                      className="cursor-pointer group pointer-events-auto"
                    >
                      {/* Invisible Hit Area (Thicker) */}
                      <path
                        d={pathD}
                        stroke="transparent"
                        strokeWidth={15 / transform.scale} // Scale stroke width inverse to zoom
                        fill="none"
                      />
                      {/* Visible Wire */}
                      <path
                        d={pathD}
                        stroke={isSelected ? "#fff" : conn.color}
                        strokeWidth={(isSelected ? 4 : 3) / transform.scale}
                        fill="none"
                        className="transition-all"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          filter: isSelected
                            ? "drop-shadow(0 0 5px rgba(255,255,255,0.5))"
                            : "drop-shadow(0 1px 2px rgba(0,0,0,0.5))", // Subtle shadow for depth
                        }}
                      />
                      <circle
                        cx={x1}
                        cy={y1}
                        r={5 / transform.scale}
                        fill={conn.color}
                        stroke="white"
                        strokeWidth={2 / transform.scale}
                      />
                      <circle
                        cx={x2}
                        cy={y2}
                        r={5 / transform.scale}
                        fill={conn.color}
                        stroke="white"
                        strokeWidth={2 / transform.scale}
                      />
                    </g>
                  );
                })}
                {/* Drawing line for currently selected pin */}
                {selectedPin && (
                  <line
                    x1={selectedPin.x}
                    y1={selectedPin.y}
                    x2={selectedPin.x}
                    y2={selectedPin.y}
                    stroke="white"
                    strokeDasharray="4"
                    className="animate-pulse pointer-events-none"
                  />
                )}
              </svg>
            </div>{" "}
            {/* End Transform Container */}
            {/* Canvas Controls */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 z-40 bg-gray-900/80 backdrop-blur p-2 rounded-lg border border-gray-700 shadow-lg">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono text-gray-400 w-12 text-center">
                {Math.round(transform.scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-4 bg-gray-700 mx-1" />
              <button
                onClick={resetView}
                className="p-2 hover:bg-gray-800 rounded text-gray-300 hover:text-white"
                title="Reset View"
              >
                <Maximize size={16} />
              </button>
            </div>
            {/* Minimap */}
            <Minimap
              components={components}
              transform={transform}
              viewportSize={viewportSize}
              onNavigate={(x, y) => setTransform((prev) => ({ ...prev, x, y }))}
            />
            {/* Hint Overlay */}
            <div className="absolute bottom-4 left-4 pointer-events-none text-gray-500 text-xs">
              {selectedPin
                ? "Select destination pin to connect..."
                : "Drag components to move. Click pins to wire. Click wires to edit."}
            </div>
            {/* Wire Properties Panel */}
            {selectedWireId && (
              <div
                className="absolute top-4 right-4 w-64 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-3 z-30 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Wire Properties
                  </h3>
                  <button
                    onClick={() => setSelectedWireId(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {(() => {
                  const wire = connections.find((c) => c.id === selectedWireId);
                  if (!wire) return null;
                  return (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase">
                          Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={wire.color}
                            onChange={(e) => {
                              setConnections((prev) =>
                                prev.map((c) =>
                                  c.id === wire.id
                                    ? { ...c, color: e.target.value }
                                    : c,
                                ),
                              );
                            }}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                          />
                          <input
                            type="text"
                            value={wire.color}
                            onChange={(e) => {
                              setConnections((prev) =>
                                prev.map((c) =>
                                  c.id === wire.id
                                    ? { ...c, color: e.target.value }
                                    : c,
                                ),
                              );
                            }}
                            className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                      <button
                        onClick={deleteWire}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors border border-red-900/50 text-xs font-bold uppercase"
                      >
                        <Trash2 size={14} /> Delete Wire
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
            {/* Library Drawer (Overlaid if active) */}
            {activeTab === "library" && (
              <LibraryPanel
                COMPONENT_LIBRARY={COMPONENT_LIBRARY}
                addComponent={addComponent}
                setActiveTab={setActiveTab}
              />
            )}
            {/* Settings Panel (Overlaid if active) */}
            {showSettings && (
              <SettingsPanel
                apiKey={apiKey}
                handleApiKeySave={handleApiKeySave}
                setShowSettings={setShowSettings}
              />
            )}
          </div>

          {/* Right Panel: Code / Chat / Simulation */}
          <ChatPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            chatHistory={chatHistory}
            isAiLoading={isAiLoading}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleChatSubmit={handleChatSubmit}
            handleStopGeneration={handleStopGeneration}
            agentMode={agentMode}
            setAgentMode={setAgentMode}
            pendingActions={pendingActions}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        </div>
      </div>
    </div>
  );
}

// Icon helper

export default Studio;
