import { useState, useRef, useEffect } from "react";
import {
  generateCodeHelp,
  analyzeCircuit,
  GEMINI_MODELS,
  GeminiModelId,
  getGeminiApiKey,
} from "../services/geminiService";
import { PlacedComponent, Connection, LogType, ComponentType, AgentAction } from "../types";
import { COMPONENT_LIBRARY, INITIAL_CODE } from "../constants";

interface UseAgentProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: GeminiModelId;
  setSelectedModel: (model: GeminiModelId) => void;
  code: string;
  setCode: (code: string) => void;
  components: PlacedComponent[];
  setComponents: (comps: PlacedComponent[]) => void;
  connections: Connection[];
  setConnections: (conns: Connection[]) => void;
  logToConsole: (msg: string, type?: LogType) => void;
  activeMcuUid: string | null;
  // New props for Control
  runSimulation: () => void | Promise<void>;
  stopSimulation: () => void;
  setConsoleLogs: (logs: any[]) => void;
  setActiveMcuUid: (uid: string) => void;
  onOpenPanel: (panel: "editor" | "library" | "chat") => void;
}

export const useAgent = ({
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
  onOpenPanel,
}: UseAgentProps) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Agent Control State
  const [agentMode, setAgentMode] = useState<"auto" | "manual">("manual");
  const [pendingActions, setPendingActions] = useState<AgentAction[] | null>(
    null,
  );

  // Load API key and model from localStorage on mount
  useEffect(() => {
    // We don't need to manually load from localStorage here because
    // the UI components or services will use getGeminiApiKey() directly
    // EXCEPT that we want to populate the Settings input if it's in localStorage.
    
    // However, for the agent itself, we should trust the service to get the right key.
    // BUT useAgent holds `apiKey` state which is passed to generateCodeHelp.
    // So we should initialize it.
    
    const savedKey = localStorage.getItem("robo-sparrow-api-key");
    if (savedKey) {
      setApiKey(savedKey);
    }
    // Always enforce the first model (Gemini 3) as per task requirements
    setSelectedModel(GEMINI_MODELS[0].id);
  }, []);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAiLoading(false);
  };

  // Execute Actions
  const executeActions = (actions: AgentAction[]) => {
    console.log("Executing Agent Actions:", actions);

    const newComponents = [...components];
    const newConnections = [...connections];
    const tempIdMap: Record<string, string> = {}; // Map tempId -> realUid
    let lastAddedUid = "";

    for (const op of actions) {
      if (op.type === "ADD_COMPONENT") {
        const libComp = COMPONENT_LIBRARY.find((c) => c.id === op.componentId);
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
          
          if (op.tempId) {
             tempIdMap[op.tempId] = lastAddedUid;
          }
        }
      } else if (op.type === "CONNECT") {
        const resolveUid = (ref?: { compUid?: string; tempId?: string }) => {
            if (!ref) return undefined;
            if (ref.tempId && tempIdMap[ref.tempId]) return tempIdMap[ref.tempId];
            if (ref.compUid === "LAST_ADDED") return lastAddedUid;
            return ref.compUid;
        };

        const fromUid = resolveUid(op.from);
        const toUid = resolveUid(op.to);

        if (fromUid && toUid && op.from?.pinId && op.to?.pinId) {
          newConnections.push({
            id: Math.random().toString(36).substr(2, 9),
            from: { type: "pin", compUid: fromUid, pinId: op.from.pinId },
            to: { type: "pin", compUid: toUid, pinId: op.to.pinId },
            waypoints: [],
            color: op.color || "#3b82f6",
          });
        }
      } else if (op.type === "UPDATE_CODE") {
        let targetUid = op.targetCompUid;
        if (op.targetTempId && tempIdMap[op.targetTempId]) {
            targetUid = tempIdMap[op.targetTempId];
        } else if (targetUid === "LAST_ADDED") {
            targetUid = lastAddedUid;
        }
        
        // Robust Fallback Logic for Code Injection
        let targetMcu = newComponents.find((c) => c.uid === targetUid);
        if (!targetMcu) {
            // Fallback 1: Try to find by Component ID (e.g. agent said generic "arduino-uno")
            targetMcu = newComponents.find((c) => c.id === targetUid && c.type === ComponentType.MICROCONTROLLER);
            
            // Fallback 2: If there's only one MCU in the entire workspace, assume that's the one
            if (!targetMcu) {
               const allMcus = newComponents.filter(c => c.type === ComponentType.MICROCONTROLLER);
               if (allMcus.length === 1) {
                   targetMcu = allMcus[0];
                   console.log("Agent: Target UID not found, defaulting to single available MCU:", targetMcu.uid);
               }
            }
        }

        if (targetMcu && op.code) {
          targetMcu.code = op.code;
          // Auto-select the MCU and open editor
          setActiveMcuUid(targetMcu.uid);
          setCode(op.code); // Sync editor state
          onOpenPanel("editor");
        } else {
           console.warn("Agent: Could not find target MCU for code update:", targetUid);
           logToConsole(`Agent failed to inject code: Controller '${targetUid}' not found.`, "error");
        }
      } else if (op.type === "DELETE_COMPONENT") {
        const idx = newComponents.findIndex((c) => c.uid === op.uid);
        if (idx !== -1) newComponents.splice(idx, 1);
      } else if (op.type === "DELETE_CONNECTION") {
        const idx = newConnections.findIndex((c) => c.id === op.id);
        if (idx !== -1) newConnections.splice(idx, 1);
      } else if (op.type === "START_SIMULATION") {
        runSimulation();
        logToConsole("Agent started simulation", "system");
      } else if (op.type === "STOP_SIMULATION") {
        stopSimulation();
        logToConsole("Agent stopped simulation", "system");
      } else if (op.type === "CLEAR_CONSOLE") {
        setConsoleLogs([]);
      } else if (op.type === "OPEN_PANEL") {
         if (op.panel) onOpenPanel(op.panel);
      }
    }
    setComponents(newComponents);
    setConnections(newConnections);
    if (
      actions.some(
        (a) =>
          a.type !== "START_SIMULATION" &&
          a.type !== "STOP_SIMULATION" &&
          a.type !== "CLEAR_CONSOLE",
      )
    ) {
      logToConsole("Agent modified the circuit.", "system");
    }
  };

  const handleApprove = () => {
    if (pendingActions) {
      executeActions(pendingActions);
      setPendingActions(null);
    }
  };

  const handleReject = () => {
    setPendingActions(null);
    logToConsole("User rejected agent actions.", "system");
  };

  const handleChatSubmit = async (retryMsg?: string) => {
    const msg = retryMsg || chatInput;
    if (!msg.trim()) return;

    if (!retryMsg) {
      setChatInput("");
      setChatHistory((prev) => [...prev, { role: "user", text: msg }]);
    }
    setIsAiLoading(true);

        // Pass full state to AI
    try {
      // Use the helper to get the effective key (env or local)
      const effectiveKey = getGeminiApiKey();
      
      const response = await generateCodeHelp(
        effectiveKey || apiKey, // Fallback to state if helper returns null (unlikely if env is set)
        selectedModel,
        msg,
        code,
        components,
        connections,
        agentMode
      );

      // Parse JSON Actions (Agentic Capabilities)

      let displayText = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const actionData = JSON.parse(jsonMatch[1]);
        if (
          actionData.action === "UPDATE_CIRCUIT" &&
          Array.isArray(actionData.operations)
        ) {
          if (agentMode === "auto") {
            executeActions(actionData.operations);
          } else {
            setPendingActions(actionData.operations);
          }
        }
        // Hide the JSON block from the chat UI
        displayText = response.replace(jsonMatch[0], "").trim();

        // If we performed an UPDATE_CODE action, also hide the code block from chat to avoid clutter
        if (actionData.operations.some((op: any) => op.type === "UPDATE_CODE")) {
           displayText = displayText.replace(/```(cpp|c\+\+|c|arduino|javascript|js|typescript|ts)\s*([\s\S]*?)```/gi, "(Code injected into Editor)").trim();
        }
      }

      setChatHistory((prev) => [...prev, { role: "ai", text: displayText }]);
    } catch (e) {
      console.error("Agent Error", e);
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: "Error generating response." },
      ]);
    }

    setIsAiLoading(false);
  };

  const handleAnalyze = async (switchToChat: () => void) => {
    setIsAiLoading(true);
    switchToChat();
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

  return {
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
  };
};
