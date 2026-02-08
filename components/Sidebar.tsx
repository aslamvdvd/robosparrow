import React from "react";
import {
  Terminal,
  HardDrive,
  Code2,
  MessageSquare,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: "editor" | "library" | "chat" | null;
  setActiveTab: (tab: "editor" | "library" | "chat" | null) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  showSettings,
  setShowSettings,
}) => {
  return (
    <div className="w-16 flex flex-col items-center py-4 bg-gray-900 border-r border-gray-800 gap-4 z-20">
      <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 mb-4">
        <Terminal className="text-white w-6 h-6" />
      </div>

      <button
        onClick={() => setActiveTab(activeTab === "library" ? null : "library")}
        className={`p-3 rounded-xl transition-all ${activeTab === "library" ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
        title="Component Library"
      >
        <HardDrive />
      </button>
      <button
        onClick={() => setActiveTab(activeTab === "editor" ? null : "editor")}
        className={`p-3 rounded-xl transition-all ${activeTab === "editor" ? "bg-gray-800 text-blue-400" : "text-gray-500 hover:text-gray-300"}`}
        title="Code Editor"
      >
        <Code2 />
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
  );
};

export default Sidebar;
