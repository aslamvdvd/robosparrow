import React, { useRef, useEffect } from "react";
import { StopCircle, Send } from "lucide-react";
import { GEMINI_MODELS } from "../services/geminiService";

interface ChatPanelProps {
  activeTab: string | null;
  setActiveTab: (tab: any) => void;
  chatHistory: { role: "user" | "ai"; text: string }[];
  isAiLoading: boolean;
  chatInput: string;
  setChatInput: (input: string) => void;
  handleChatSubmit: (retryMsg?: string) => void;
  handleStopGeneration: () => void;
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
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  return (
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
        {/* Chat View - Always Visible */}
        <div className="h-full flex flex-col bg-gray-900">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p className="mb-2">👋 Hi! I'm Robo Sparrow AI.</p>
                <p className="text-xs">
                  Ask me to generate code, explain circuits, or debug issues.
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
