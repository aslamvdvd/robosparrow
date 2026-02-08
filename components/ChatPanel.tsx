import React, { useRef, useEffect } from "react";
import { StopCircle, Send } from "lucide-react";
import { GEMINI_MODELS } from "../services/geminiService";

import { AgentAction } from "../types";

interface ChatPanelProps {
  activeTab: string | null;
  setActiveTab: (tab: any) => void;
  chatHistory: { role: "user" | "ai"; text: string }[];
  isAiLoading: boolean;
  chatInput: string;
  setChatInput: (input: string) => void;
  handleChatSubmit: (retryMsg?: string) => void;
  handleStopGeneration: () => void;
  // New props for Control
  agentMode: "auto" | "manual";
  setAgentMode: (mode: "auto" | "manual") => void;
  pendingActions: AgentAction[] | null;
  handleApprove: () => void;
  handleReject: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  activeTab,
  setActiveTab,
  chatHistory,
  isAiLoading,
  chatInput,
  setChatInput,
  handleChatSubmit,
  handleStopGeneration,
  agentMode,
  setAgentMode,
  pendingActions,
  handleApprove,
  handleReject,
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading, pendingActions]);

  return (
    <div className="w-[450px] bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
      {/* Context Switcher & Mode Toggle */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 bg-gray-900/50 backdrop-blur">
        <button
          onClick={() => setActiveTab("chat")}
          className={`py-3 text-xs font-bold uppercase tracking-wide border-b-2 ${activeTab === "chat" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          RoboBuddy AI
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Auto-Apply
          </span>
          <button
            onClick={() =>
              setAgentMode(agentMode === "auto" ? "manual" : "auto")
            }
            className={`w-8 h-4 rounded-full transition-colors relative ${agentMode === "auto" ? "bg-blue-600" : "bg-gray-700"}`}
            title={
              agentMode === "auto"
                ? "Changes apply immediately"
                : "Ask for approval before changes"
            }
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${agentMode === "auto" ? "left-4.5 translate-x-3.5" : "left-0.5"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Chat View - Always Visible */}
        <div className="h-full flex flex-col bg-gray-900">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p className="mb-2">👋 Hi! I'm RoboBuddy.</p>
                <p className="text-xs">
                  Ask me to generate code, explain circuits, or debug issues.
                </p>
                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg text-xs text-blue-300 border border-blue-900/50">
                  Tip: Switch "Auto-Apply" ON to let me control the studio
                  directly!
                </div>
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
                          if (lastUserMsg) handleChatSubmit(lastUserMsg.text);
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

            {/* Pending Actions Card */}
            {pendingActions && pendingActions.length > 0 && (
              <div className="mx-4 my-2 bg-gray-800 border-l-4 border-yellow-500 rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
                <h4 className="text-sm font-bold text-yellow-500 mb-2 flex items-center gap-2">
                  ⚠️ Approval Required
                </h4>
                <p className="text-xs text-gray-300 mb-3">
                  RoboBuddy wants to perform {pendingActions.length} actions:
                </p>
                <ul className="text-xs text-gray-400 list-disc list-inside mb-4 space-y-1 bg-gray-900/50 p-2 rounded">
                  {pendingActions
                    .map((action, i) => (
                      <li key={i}>
                        {action.type}
                        {action.type === "ADD_COMPONENT" &&
                          ` (${action.componentId})`}
                        {action.type === "UPDATE_CODE" &&
                          ` (Target: ${action.targetCompUid?.substr(0, 4)})`}
                      </li>
                    ))
                    .slice(0, 5)}
                  {pendingActions.length > 5 && (
                    <li>...and {pendingActions.length - 5} more</li>
                  )}
                </ul>
                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 py-2 bg-red-900/50 hover:bg-red-900 text-red-300 text-xs font-bold rounded transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

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
                placeholder={
                  agentMode === "auto"
                    ? "Command RoboBuddy..."
                    : "Ask RoboBuddy..."
                }
                className={`w-full bg-gray-950 border ${agentMode === "auto" ? "border-blue-500/50" : "border-gray-700"} rounded-full py-2 pl-4 pr-10 text-sm text-white focus:border-blue-500 focus:outline-none transition-colors`}
              />
              <button
                onClick={() =>
                  isAiLoading ? handleStopGeneration() : handleChatSubmit()
                }
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 ${isAiLoading ? "text-red-500 hover:text-red-400" : "text-blue-500 hover:text-blue-400"}`}
                title={isAiLoading ? "Stop Generating" : "Send Message"}
              >
                {isAiLoading ? <StopCircle size={16} /> : <Send size={16} />}
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
  );
};

export default ChatPanel;
