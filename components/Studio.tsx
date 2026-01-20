import React, { useState, useRef, useEffect } from 'react';
import { COMPONENT_LIBRARY, INITIAL_CODE } from '../constants';
import { PlacedComponent, ComponentData, Connection, ConsoleLog, SimulationState, LogType } from '../types';
import ComponentCard from './ComponentCard';
import WorkspaceComponent from './WorkspaceComponent';
import SimulationViewer from './SimulationViewer';
import { generateCodeHelp, analyzeCircuit } from '../services/geminiService';
import { Play, Square, RefreshCw, Send, Terminal, Settings, Download, MessageSquare, Trash2, Code2 } from 'lucide-react';

// Types for simulation loop
type LoopFunction = () => void;
type SetupFunction = () => void;

function Studio() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'chat'>('library');
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  
  // Wiring State
  const [selectedPin, setSelectedPin] = useState<{ compUid: string; pinId: string; x: number; y: number } | null>(null);

  // Simulation State
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    time: 0,
    logs: [],
    robotPosition: { x: 300, y: 200, rotation: 0 },
    pinStates: {}
  });

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Refs for Simulation Loop
  const requestRef = useRef<number | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userCodeClosure = useRef<{ setup: SetupFunction | null; loop: LoopFunction | null }>({ setup: null, loop: null });
  const virtualPins = useRef<Record<number, number>>({}); // Simple int map for pin values

  // --- Actions ---

  const addComponent = (compData: ComponentData) => {
    const newComp: PlacedComponent = {
      ...compData,
      uid: Math.random().toString(36).substr(2, 9),
      position: { x: 50 + Math.random() * 50, y: 50 + Math.random() * 50 }
    };
    setComponents([...components, newComp]);
  };

  const moveComponent = (uid: string, x: number, y: number) => {
    setComponents(prev => prev.map(c => c.uid === uid ? { ...c, position: { x, y } } : c));
  };

  const deleteComponent = () => {
    if(!selectedCompId) return;
    setComponents(prev => prev.filter(c => c.uid !== selectedCompId));
    setConnections(prev => prev.filter(c => c.fromCompUid !== selectedCompId && c.toCompUid !== selectedCompId));
    setSelectedCompId(null);
  }

  const handlePinClick = (compUid: string, pinId: string, absX: number, absY: number) => {
    if (selectedPin) {
      if (selectedPin.compUid === compUid && selectedPin.pinId === pinId) {
        setSelectedPin(null); // Deselect
        return;
      }
      // Create Connection
      const newConnection: Connection = {
        id: Math.random().toString(36).substr(2, 9),
        fromCompUid: selectedPin.compUid,
        fromPinId: selectedPin.pinId,
        toCompUid: compUid,
        toPinId: pinId,
        color: ['#ef4444', '#22c55e', '#3b82f6', '#eab308'][Math.floor(Math.random() * 4)]
      };
      setConnections([...connections, newConnection]);
      setSelectedPin(null);
    } else {
      setSelectedPin({ compUid, pinId, x: absX, y: absY });
    }
  };

  const logToConsole = (msg: string, type: LogType = 'info') => {
    setConsoleLogs(prev => [...prev.slice(-49), { id: Math.random().toString(), message: msg, type, timestamp: Date.now() }]);
  };

  // --- Simulation Logic ---

  const stopSimulation = () => {
    setSimState(prev => ({ ...prev, isRunning: false }));
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    virtualPins.current = {};
  };

  const runSimulation = () => {
    stopSimulation();
    setConsoleLogs([]);
    logToConsole("Compiling code...", 'system');

    try {
      // 1. Prepare Sandbox Environment
      // We simulate Arduino functions
      const sandbox = {
        console: { 
          log: (m: any) => logToConsole(String(m)),
          error: (m: any) => logToConsole(String(m), 'error')
        },
        pinMode: (pin: number, mode: string) => {}, // No-op for now
        digitalWrite: (pin: number, val: any) => {
          const v = (val === 'HIGH' || val === 1 || val === true) ? 1 : 0;
          virtualPins.current[pin] = v;
        },
        analogWrite: (pin: number, val: number) => {
          virtualPins.current[pin] = val;
        },
        delay: (ms: number) => { /* Conceptual delay - cannot block main thread in JS */ },
        HIGH: 1,
        LOW: 0,
        OUTPUT: 'OUTPUT',
        INPUT: 'INPUT',
        setup: () => {},
        loop: () => {}
      };

      // 2. Parse User Code
      const wrappedCode = `
        "use strict";
        ${code}
        return { setup: typeof setup !== 'undefined' ? setup : null, loop: typeof loop !== 'undefined' ? loop : null };
      `;

      // eslint-disable-next-line no-new-func
      const factory = new Function('pinMode', 'digitalWrite', 'analogWrite', 'delay', 'console', 'HIGH', 'LOW', 'OUTPUT', 'INPUT', wrappedCode);
      
      const { setup, loop } = factory(
        sandbox.pinMode, 
        sandbox.digitalWrite, 
        sandbox.analogWrite, 
        sandbox.delay, 
        sandbox.console, 
        1, 0, 'OUTPUT', 'INPUT'
      );

      userCodeClosure.current = { setup, loop };

      // 3. Run Setup
      if (setup) setup();
      logToConsole("Setup complete. Starting loop.", 'system');

      // 4. Start Loop
      setSimState(prev => ({ ...prev, isRunning: true }));
      
      simIntervalRef.current = setInterval(() => {
        if (userCodeClosure.current.loop) {
          try {
            userCodeClosure.current.loop();
          } catch (e: any) {
            logToConsole(`Runtime Error: ${e.message}`, 'error');
            stopSimulation();
          }
        }
      }, 100);

      const physicsTick = () => {
        setSimState(prev => {
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
            robotPosition: { x: clampedX, y: clampedY, rotation: newRotation }
          };
        });
        requestRef.current = requestAnimationFrame(physicsTick);
      };
      
      requestRef.current = requestAnimationFrame(physicsTick);

    } catch (err: any) {
      logToConsole(`Compilation Error: ${err.message}`, 'error');
    }
  };

  // --- AI Handlers ---

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsAiLoading(true);

    const response = await generateCodeHelp(msg, code);
    
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setIsAiLoading(false);
  };

  const handleAnalyze = async () => {
    setIsAiLoading(true);
    setActiveTab('chat');
    const response = await analyzeCircuit(components, connections);
    setChatHistory(prev => [...prev, { role: 'user', text: "Analyze my circuit." }, { role: 'ai', text: response }]);
    setIsAiLoading(false);
  }

  // --- Initialization ---
  useEffect(() => {
    if (components.length === 0) {
      const arduino = { ...COMPONENT_LIBRARY[0], uid: 'arduino-1', position: { x: 50, y: 50 } };
      const driver = { ...COMPONENT_LIBRARY[1], uid: 'driver-1', position: { x: 300, y: 50 } };
      const mLeft = { ...COMPONENT_LIBRARY[2], uid: 'motor-l', position: { x: 50, y: 300 }, properties: { position: 'left' } };
      const mRight = { ...COMPONENT_LIBRARY[2], uid: 'motor-r', position: { x: 250, y: 300 }, properties: { position: 'right' } };
      
      setComponents([arduino, driver, mLeft, mRight]);
      
      setConnections([
        { id: 'w1', fromCompUid: 'arduino-1', fromPinId: 'D5', toCompUid: 'driver-1', toPinId: 'IN1', color: '#22c55e' },
        { id: 'w2', fromCompUid: 'arduino-1', fromPinId: 'D6', toCompUid: 'driver-1', toPinId: 'IN2', color: '#ef4444' },
        { id: 'w3', fromCompUid: 'arduino-1', fromPinId: 'D9', toCompUid: 'driver-1', toPinId: 'IN3', color: '#3b82f6' },
        { id: 'w4', fromCompUid: 'arduino-1', fromPinId: 'D10', toCompUid: 'driver-1', toPinId: 'IN4', color: '#eab308' },
      ]);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar / Tools */}
      <div className="w-16 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-800 gap-4 z-20">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 mb-4">
          <Terminal className="text-white w-6 h-6" />
        </div>
        
        <button 
          onClick={() => setActiveTab('library')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'library' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title="Component Library"
        >
          <HardDriveIcon />
        </button>
        <button 
          onClick={() => setActiveTab('editor')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'editor' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title="Code Editor"
        >
          <Code2 />
        </button>
         <button 
          onClick={() => setActiveTab('chat')}
          className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title="AI Assistant"
        >
          <MessageSquare />
        </button>
        
        <div className="flex-grow" />
        <button className="p-3 text-gray-500 hover:text-gray-300"><Settings /></button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Top Bar */}
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg tracking-tight">RoboLab <span className="text-blue-500 text-xs uppercase ml-1 border border-blue-900 bg-blue-900/20 px-1 rounded">Beta</span></h1>
            {selectedCompId && (
               <button onClick={deleteComponent} className="flex items-center gap-2 px-3 py-1 bg-red-900/30 text-red-400 text-xs rounded hover:bg-red-900/50 border border-red-900/50">
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
             <button className="p-2 text-gray-400 hover:text-white"><Download className="w-4 h-4"/></button>
          </div>
        </header>

        {/* Workspace + Split Pane */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left/Main Panel: Workspace or Component Library */}
          <div className="flex-1 relative bg-gray-950 grid-pattern overflow-hidden">
            
            {/* Draw Connections (SVG Layer) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
               {connections.map(conn => {
                 const fromComp = components.find(c => c.uid === conn.fromCompUid);
                 const toComp = components.find(c => c.uid === conn.toCompUid);
                 if (!fromComp || !toComp) return null;
                 const fromPin = fromComp.pins.find(p => p.id === conn.fromPinId);
                 const toPin = toComp.pins.find(p => p.id === conn.toPinId);
                 if (!fromPin || !toPin) return null;

                 const x1 = fromComp.position.x + fromPin.x;
                 const y1 = fromComp.position.y + fromPin.y;
                 const x2 = toComp.position.x + toPin.x;
                 const y2 = toComp.position.y + toPin.y;

                 return (
                   <g key={conn.id}>
                     <path 
                       d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                       stroke={conn.color}
                       strokeWidth="3"
                       fill="none"
                       opacity="0.8"
                     />
                     <circle cx={x1} cy={y1} r="3" fill={conn.color} />
                     <circle cx={x2} cy={y2} r="3" fill={conn.color} />
                   </g>
                 )
               })}
               {/* Drawing line for currently selected pin */}
               {selectedPin && (
                 <line x1={selectedPin.x} y1={selectedPin.y} x2={selectedPin.x} y2={selectedPin.y} stroke="white" strokeDasharray="4" className="animate-pulse" />
               )}
            </svg>

            {/* Components Layer */}
            {components.map(comp => (
              <div key={comp.uid} onClick={() => setSelectedCompId(comp.uid)}>
                <WorkspaceComponent 
                  component={comp}
                  onMove={moveComponent}
                  onPinClick={handlePinClick}
                  isSelected={selectedCompId === comp.uid}
                  selectedPin={selectedPin}
                />
              </div>
            ))}

            {/* Hint Overlay */}
            <div className="absolute bottom-4 left-4 pointer-events-none text-gray-500 text-xs">
              {selectedPin ? "Select destination pin to connect..." : "Drag components to move. Click pins to wire."}
            </div>

            {/* Library Drawer (Overlaid if active) */}
            {activeTab === 'library' && (
              <div className="absolute top-4 left-4 w-64 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl shadow-2xl p-4 flex flex-col gap-3 max-h-[80%] overflow-y-auto z-30 animate-in fade-in slide-in-from-left-4 duration-200">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-sm font-bold text-white uppercase tracking-wider">Components</h2>
                   <button onClick={() => setActiveTab('editor')} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                {COMPONENT_LIBRARY.map(c => (
                  <ComponentCard key={c.id} component={c} onSelect={addComponent} />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Code / Chat / Simulation */}
          <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
            
            {/* Context Switcher in Right Panel */}
            <div className="flex border-b border-gray-800">
              <button 
                 onClick={() => setActiveTab('editor')}
                 className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === 'editor' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                Code
              </button>
              <button 
                 onClick={() => setActiveTab('chat')}
                 className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === 'chat' ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                AI Assistant
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {activeTab === 'editor' && (
                <div className="h-full flex flex-col">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-gray-950 text-blue-300 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                  {/* Console Output */}
                  <div className="h-1/3 border-t border-gray-800 bg-black flex flex-col">
                    <div className="px-4 py-2 bg-gray-900 text-gray-400 text-xs font-bold border-b border-gray-800 flex justify-between">
                      <span>CONSOLE</span>
                      <button onClick={() => setConsoleLogs([])} className="hover:text-white">Clear</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                      {consoleLogs.length === 0 && <span className="text-gray-700 italic">Ready...</span>}
                      {consoleLogs.map((log) => (
                        <div key={log.id} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'system' ? 'text-yellow-500' : 'text-gray-300'}`}>
                          <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          {log.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                 <div className="h-full flex flex-col bg-gray-900">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {chatHistory.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                          <p className="mb-2">👋 Hi! I'm your Robotics AI.</p>
                          <p className="text-xs">Ask me to generate code, explain circuits, or debug issues.</p>
                        </div>
                      )}
                      {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isAiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                            <span className="animate-pulse text-gray-400 text-xs">Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-800 bg-gray-900">
                      <div className="relative">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                          placeholder="Ask about your robot..."
                          className="w-full bg-gray-950 border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                        <button onClick={handleChatSubmit} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 p-1">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                 </div>
              )}
            </div>

            <div className="h-64 border-t border-gray-700 bg-gray-900 p-2">
               <SimulationViewer state={simState} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper
function HardDriveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
  )
}

export default Studio;