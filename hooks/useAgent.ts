import { useState, useRef, useEffect } from "react";
import {
  generateCodeHelp,
  analyzeCircuit,
  GEMINI_MODELS,
  GeminiModelId,
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
  runSimulation: () => void;
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
        const targetMcu = newComponents.find((c) => c.uid === targetUid);
        if (targetMcu && op.code) {
          targetMcu.code = op.code;
          // Auto-select the MCU and open editor
          setActiveMcuUid(targetUid);
          setCode(op.code); // Sync editor state
          onOpenPanel("editor");
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
      const response = await generateCodeHelp(
        apiKey,
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
