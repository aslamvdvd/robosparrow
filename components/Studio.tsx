import React, { useState, useRef, useEffect } from "react";
import { COMPONENT_LIBRARY, INITIAL_CODE } from "../constants";
import {
  PlacedComponent,
  ComponentData,
  Connection,
  ConsoleLog,
  SimulationState,
  LogType,
  ComponentType, // Import ComponentType
} from "../types";
import ComponentCard from "./ComponentCard";
import WorkspaceComponent from "./WorkspaceComponent";
import SimulationViewer from "./SimulationViewer";
import {
  generateCodeHelp,
  analyzeCircuit,
  GEMINI_MODELS,
  GeminiModelId,
} from "../services/geminiService";
import {
  Play,
  Square,
  RefreshCw,
  Send,
  Terminal,
  Settings,
  Download,
  MessageSquare,
  Trash2,
  Code2,
  Key,
  X,
  Eye,
  EyeOff,
  HardDrive as HardDriveIcon,
  Eraser,
  StopCircle,
} from "lucide-react";

// Types for simulation loop
type LoopFunction = () => void;
type SetupFunction = () => void;

function Studio() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<"editor" | "library" | "chat">(
    "library",
  );
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Multi-MCU State
  const [activeMcuUid, setActiveMcuUid] = useState<string | null>(null);

  // Update code when active MCU changes
  useEffect(() => {
    if (activeMcuUid) {
      const mcu = components.find((c) => c.uid === activeMcuUid);
      if (mcu && mcu.code) {
        setCode(mcu.code);
      }
    }
  }, [activeMcuUid, components]);

  // Save code to active MCU
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeMcuUid) {
      setComponents((prev) =>
        prev.map((c) => (c.uid === activeMcuUid ? { ...c, code: newCode } : c)),
      );
    }
  };

  // Wiring State
  const [selectedPin, setSelectedPin] = useState<{
    compUid: string;
    pinId: string;
    x: number;
    y: number;
  } | null>(null);

  // Simulation State
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    time: 0,
    logs: [],
    robotPosition: { x: 300, y: 200, rotation: 0 },
    pinStates: {},
  });

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // API Key State
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] =
    useState<GeminiModelId>("gemini-1.5-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Draggable Editor State
  const [editorPos, setEditorPos] = useState({
    x: Math.max(100, window.innerWidth - 1100),
    y: 20,
  });
  const [isDraggingEditor, setIsDraggingEditor] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Refs for Simulation Loop
  const requestRef = useRef<number | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userCodeClosure = useRef<{
    setup: SetupFunction | null;
    loop: LoopFunction | null;
  }>({ setup: null, loop: null });
  const virtualPins = useRef<Record<number, number>>({}); // Simple int map for pin values

  // --- Actions ---

  const addComponent = (compData: ComponentData) => {
    const newComp: PlacedComponent = {
      ...compData,
      uid: Math.random().toString(36).substr(2, 9),
      position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 },
    };
    setComponents([...components, newComp]);
  };

  const moveComponent = (uid: string, x: number, y: number) => {
    setComponents((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, position: { x, y } } : c)),
    );
  };

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

  const deleteComponent = () => {
    if (selectedCompId) {
      setComponents((prev) => prev.filter((c) => c.uid !== selectedCompId));
      setConnections((prev) =>
        prev.filter(
          (c) =>
            c.from.compUid !== selectedCompId &&
            c.to.compUid !== selectedCompId,
        ),
      );
      setSelectedCompId(null);
    }
  };

  const deleteWire = () => {
    if (selectedWireId) {
      setConnections((prev) => prev.filter((c) => c.id !== selectedWireId));
      setSelectedWireId(null);
    }
  };

  // Handle Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedCompId) deleteComponent();
        if (selectedWireId) deleteWire();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCompId, selectedWireId]);

  const handlePinClick = (
    compUid: string,
    pinId: string,
    absX: number,
    absY: number,
  ) => {
    if (selectedPin) {
      if (selectedPin.compUid === compUid && selectedPin.pinId === pinId) {
        setSelectedPin(null); // Deselect
        return;
      }
      // Create Connection (New Structure)
      const newConnection: Connection = {
        id: Math.random().toString(36).substr(2, 9),
        from: {
          type: "pin",
          compUid: selectedPin.compUid,
          pinId: selectedPin.pinId,
        },
        to: { type: "pin", compUid: compUid, pinId: pinId },
        waypoints: [],
        color: ["#ef4444", "#22c55e", "#3b82f6", "#eab308"][
          Math.floor(Math.random() * 4)
        ],
      };
      setConnections([...connections, newConnection]);
      setSelectedPin(null);
    } else {
      setSelectedPin({ compUid, pinId, x: absX, y: absY });
    }
  };

  const logToConsole = (msg: string, type: LogType = "info") => {
    setConsoleLogs((prev) => [
      ...prev.slice(-49),
      {
        id: Math.random().toString(),
        message: msg,
        type,
        timestamp: Date.now(),
      },
    ]);
  };

  // --- Simulation Logic ---

  const stopSimulation = () => {
    setSimState((prev) => ({ ...prev, isRunning: false }));
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    virtualPins.current = {};
  };

  const runSimulation = () => {
    stopSimulation();
    setConsoleLogs([]);
    logToConsole("Compiling code...", "system");

    try {
      // 1. Prepare Sandbox Environment
      // We simulate Arduino functions
      const sandbox = {
        console: {
          log: (m: any) => logToConsole(String(m)),
          error: (m: any) => logToConsole(String(m), "error"),
        },
        pinMode: (pin: number, mode: string) => {}, // No-op for now
        digitalWrite: (pin: number, val: any) => {
          const v = val === "HIGH" || val === 1 || val === true ? 1 : 0;
          virtualPins.current[pin] = v;
        },
        analogWrite: (pin: number, val: number) => {
          virtualPins.current[pin] = val;
        },
        delay: (ms: number) => {
          /* Conceptual delay - cannot block main thread in JS */
        },
        HIGH: 1,
        LOW: 0,
        OUTPUT: "OUTPUT",
        INPUT: "INPUT",
        setup: () => {},
        loop: () => {},
      };

      // 2. Parse User Code
      const wrappedCode = `
        "use strict";
        ${code}
        return { setup: typeof setup !== 'undefined' ? setup : null, loop: typeof loop !== 'undefined' ? loop : null };
      `;

      // eslint-disable-next-line no-new-func
      const factory = new Function(
        "pinMode",
        "digitalWrite",
        "analogWrite",
        "delay",
        "console",
        "HIGH",
        "LOW",
        "OUTPUT",
        "INPUT",
        wrappedCode,
      );

      const { setup, loop } = factory(
        sandbox.pinMode,
        sandbox.digitalWrite,
        sandbox.analogWrite,
        sandbox.delay,
        sandbox.console,
        1,
        0,
        "OUTPUT",
        "INPUT",
      );

      userCodeClosure.current = { setup, loop };

      // 3. Run Setup
      if (setup) setup();
      logToConsole("Setup complete. Starting loop.", "system");

      // 4. Start Loop
      setSimState((prev) => ({ ...prev, isRunning: true }));

      simIntervalRef.current = setInterval(() => {
        if (userCodeClosure.current.loop) {
          try {
            userCodeClosure.current.loop();
          } catch (e: any) {
            logToConsole(`Runtime Error: ${e.message}`, "error");
            stopSimulation();
          }
        }
      }, 100);

      const physicsTick = () => {
        setSimState((prev) => {
          const p5 = virtualPins.current[5] || 0;
          const p6 = virtualPins.current[6] || 0;
          const p9 = virtualPins.current[9] || 0;
          const p10 = virtualPins.current[10] || 0;

          let leftSpeed = 0;
          if (p5 && !p6) leftSpeed = 2;
          if (!p5 && p6) leftSpeed = -2;

          let rightSpeed = 0;
          if (p9 && !p10) rightSpeed = 2;
          if (!p9 && p10) rightSpeed = -2;

          const { x, y, rotation } = prev.robotPosition;

          const linearVelocity = (leftSpeed + rightSpeed) / 2;
          const angularVelocity = (rightSpeed - leftSpeed) / 20;

          const newRotation = rotation + angularVelocity;
          const newX = x + Math.sin(newRotation) * linearVelocity;
          const newY = y - Math.cos(newRotation) * linearVelocity;

          const clampedX = Math.max(20, Math.min(580, newX));
          const clampedY = Math.max(20, Math.min(380, newY));

          return {
            ...prev,
            robotPosition: { x: clampedX, y: clampedY, rotation: newRotation },
          };
        });
        requestRef.current = requestAnimationFrame(physicsTick);
      };

      requestRef.current = requestAnimationFrame(physicsTick);
    } catch (err: any) {
      logToConsole(`Compilation Error: ${err.message}`, "error");
    }
  };

  // --- AI Handlers ---

  const handleChatSubmit = async (retryMsg?: string) => {
    const msg = retryMsg || chatInput;
    if (!msg.trim()) return;

    if (!retryMsg) {
      setChatInput("");
      setChatHistory((prev) => [...prev, { role: "user", text: msg }]);
    }
    setIsAiLoading(true);

    // Pass full state to AI
    const response = await generateCodeHelp(
      apiKey,
      selectedModel,
      msg,
      code,
      components,
      connections,
    );

    // Parse JSON Actions (Agentic Capabilities)
    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const actionData = JSON.parse(jsonMatch[1]);
        if (
          actionData.action === "UPDATE_CIRCUIT" &&
          Array.isArray(actionData.operations)
        ) {
          console.log("Executing Agent Actions:", actionData.operations);

          const newComponents = [...components];
          const newConnections = [...connections];
          let lastAddedUid = "";

          for (const op of actionData.operations) {
            if (op.type === "ADD_COMPONENT") {
              const libComp = COMPONENT_LIBRARY.find(
                (c) => c.id === op.componentId,
              );
              if (libComp) {
                lastAddedUid = Math.random().toString(36).substr(2, 9);
                newComponents.push({
                  ...libComp,
                  uid: lastAddedUid,
                  position: { x: op.x || 300, y: op.y || 300 },
                  // If it's an MCU, give it default code
                  code:
                    libComp.type === ComponentType.MICROCONTROLLER
                      ? INITIAL_CODE
                      : undefined,
                });
              }
            } else if (op.type === "CONNECT") {
              const fromUid =
                op.from.compUid === "LAST_ADDED"
                  ? lastAddedUid
                  : op.from.compUid;
              const toUid =
                op.to.compUid === "LAST_ADDED" ? lastAddedUid : op.to.compUid;

              if (fromUid && toUid) {
                newConnections.push({
                  id: Math.random().toString(36).substr(2, 9),
                  from: { type: "pin", compUid: fromUid, pinId: op.from.pinId },
                  to: { type: "pin", compUid: toUid, pinId: op.to.pinId },
                  waypoints: [],
                  color: op.color || "#3b82f6",
                });
              }
            } else if (op.type === "UPDATE_CODE") {
              const targetUid =
                op.targetCompUid === "LAST_ADDED"
                  ? lastAddedUid
                  : op.targetCompUid;
              const targetMcu = newComponents.find((c) => c.uid === targetUid);
              if (targetMcu) {
                targetMcu.code = op.code;
                // If we updated the currently active MCU, simplify update the editor too
                if (targetUid === activeMcuUid) {
                  setCode(op.code);
                }
              }
            } else if (op.type === "DELETE_COMPONENT") {
              const idx = newComponents.findIndex((c) => c.uid === op.uid);
              if (idx !== -1) newComponents.splice(idx, 1);
            } else if (op.type === "DELETE_CONNECTION") {
              const idx = newConnections.findIndex((c) => c.id === op.id);
              if (idx !== -1) newConnections.splice(idx, 1);
            }
          }
          setComponents(newComponents);
          setConnections(newConnections);
          logToConsole("Agent modified the circuit.", "system");
        }
      }
    } catch (e) {
      console.error("Failed to parse Agent Action", e);
    }

    setChatHistory((prev) => [...prev, { role: "ai", text: response }]);
    setIsAiLoading(false);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAiLoading(false);
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

  const handleAnalyze = async () => {
    setIsAiLoading(true);
    setActiveTab("chat");
    const response = await analyzeCircuit(
      apiKey,
      selectedModel,
      components,
      connections,
    );
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: "Analyze my circuit." },
      { role: "ai", text: response },
    ]);
    setIsAiLoading(false);
  };

  // Load API key and model from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("robolab-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    // Always enforce the first model (Gemini 3) as per task requirements
    setSelectedModel(GEMINI_MODELS[0].id);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  // Save API key to localStorage when changed
  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    localStorage.setItem("robolab-api-key", key);
  };

  // Save model to localStorage when changed

  // --- Initialization ---
  // Clean slate on load
  useEffect(() => {
    // Optional: Load from LocalStorage if persisted
  }, []);

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
      <div className="w-16 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-800 gap-4 z-20">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 mb-4">
          <Terminal className="text-white w-6 h-6" />
        </div>

        <button
          onClick={() => setActiveTab("library")}
          className={`p-3 rounded-xl transition-all ${activeTab === "library" ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          title="Component Library"
        >
          <HardDriveIcon />
        </button>
        <button
          onClick={() => setActiveTab("editor")}
          className={`p-3 rounded-xl transition-all ${activeTab === "editor" ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          title="Code Editor"
        >
          <Code2 />
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`p-3 rounded-xl transition-all ${activeTab === "chat" ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          title="AI Assistant"
        >
          <MessageSquare />
        </button>

        <div className="flex-grow" />
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-xl transition-all ${showSettings ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
          title="Settings"
        >
          <Settings />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg tracking-tight">
              RoboLab{" "}
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

        {/* Workspace + Split Pane */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Editor Panel Overlay (Draggable) */}
          {activeTab === "editor" && (
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
                    onChange={(e) => setActiveMcuUid(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white text-xs rounded px-2 py-1 outline-none focus:border-blue-500"
                  >
                    {components
                      .filter((c) => c.type === ComponentType.MICROCONTROLLER)
                      .map((mcu) => (
                        <option key={mcu.uid} value={mcu.uid}>
                          {mcu.name} ({mcu.uid.substr(0, 4)})
                        </option>
                      ))}
                    {components.filter(
                      (c) => c.type === ComponentType.MICROCONTROLLER,
                    ).length === 0 && <option value="">No MCUs found</option>}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">main.js</span>
                  <button
                    onClick={() => setActiveTab(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
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
          )}

          {/* Main Workspace (Always Visible) */}
          <div
            className="flex-1 relative bg-gray-950 grid-pattern overflow-hidden flex flex-col"
            onClick={() => {
              setSelectedCompId(null);
              setSelectedWireId(null);
              setSelectedPin(null);
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
                />
              </div>
            ))}

            {/* Draw Connections (SVG Layer) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
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
                      strokeWidth="15"
                      fill="none"
                    />
                    {/* Visible Wire */}
                    <path
                      d={pathD}
                      stroke={isSelected ? "#fff" : conn.color}
                      strokeWidth={isSelected ? "4" : "3"}
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
                      r="5"
                      fill={conn.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={x2}
                      cy={y2}
                      r="5"
                      fill={conn.color}
                      stroke="white"
                      strokeWidth="2"
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
                  <ComponentCard
                    key={c.id}
                    component={c}
                    onSelect={addComponent}
                  />
                ))}
              </div>
            )}

            {/* Settings Panel (Overlaid if active) */}
            {showSettings && (
              <div
                className="absolute top-4 left-4 w-80 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-4 z-30 animate-in fade-in slide-in-from-left-4 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Key size={16} className="text-blue-400" />
                    Settings
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wide">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => handleApiKeySave(e.target.value)}
                      placeholder="Enter your Gemini API key..."
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Get your free API key from{" "}
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>

                {apiKey && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    API key saved locally
                  </div>
                )}

                <div className="pt-2 border-t border-gray-800 text-xs text-gray-500">
                  Your API key is stored in your browser's local storage and
                  never sent to our servers.
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Code / Chat / Simulation */}
          <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
            {/* Context Switcher in Right Panel */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === "chat" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
              >
                AI Assistant
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {/* Legacy Editor Removed */}

              {/* Chat View - Always Visible */}
              <div className="h-full flex flex-col bg-gray-900">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                      <p className="mb-2">👋 Hi! I'm your Robotics AI.</p>
                      <p className="text-xs">
                        Ask me to generate code, explain circuits, or debug
                        issues.
                      </p>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => {
                    const isRetryable = msg.text.startsWith("[RETRYABLE]");
                    const displayText = isRetryable
                      ? msg.text.replace("[RETRYABLE] ", "")
                      : msg.text;

                    return (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200 border border-gray-700"}`}
                        >
                          {displayText}
                          {isRetryable && (
                            <button
                              onClick={() => {
                                // Find last user message to retry
                                const lastUserMsg = [...chatHistory]
                                  .reverse()
                                  .find((m) => m.role === "user");
                                if (lastUserMsg)
                                  handleChatSubmit(lastUserMsg.text);
                              }}
                              className="mt-2 block w-full py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs border border-blue-500/30 rounded transition-colors"
                            >
                              ↻ Retry Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <span className="animate-pulse text-gray-400 text-xs">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900">
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                      placeholder="Ask about your robot..."
                      className="w-full bg-gray-950 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        isAiLoading
                          ? handleStopGeneration()
                          : handleChatSubmit()
                      }
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${isAiLoading ? "text-red-500 hover:text-red-400" : "text-blue-500 hover:text-blue-400"}`}
                      title={isAiLoading ? "Stop Generating" : "Send Message"}
                    >
                      {isAiLoading ? (
                        <StopCircle size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Model:</span>
                    <span className="text-xs text-blue-400 font-mono border border-blue-900/50 bg-blue-900/10 px-2 py-0.5 rounded">
                      {GEMINI_MODELS[0].name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper

export default Studio;
