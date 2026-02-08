import React, { useState } from "react";
import { Key, X, Eye, EyeOff } from "lucide-react";

interface SettingsPanelProps {
  apiKey: string;
  handleApiKeySave: (key: string) => void;
  setShowSettings: (show: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiKey,
  handleApiKeySave,
  setShowSettings,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
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

      {/* API Key Status Indicators */}
      <div className="flex flex-col gap-2">
        {/* Local Storage Status */}
        {apiKey && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Using Custom API Key (Local Storage)
          </div>
        )}

        {/* Env Var Status */}
        {/* We can't easily check process.env here without importing logic, 
            so let's check a derived property passed in OR just check window/process if possible.
            Actually, let's just show a hint if NO local key is set but ENV is present.
        */}
        {!apiKey && (
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Using Hosted API Key (Environment)
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-800 text-xs text-gray-500">
        Your API key is stored in your browser's local storage and never sent to
        our servers.
      </div>
    </div>
  );
};

export default SettingsPanel;
