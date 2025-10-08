import React from "react";
import { FaMagic, FaUserAlt, FaEraser, FaPalette } from "react-icons/fa";

export default function AIToolsBar({ aiEnhance, aiRemoveBg, aiColorBoost, aiFaceSmooth }) {
  const tools = [
    { key: "enhance", icon: <FaMagic size={18} color="#818cf8" />, label: "Enhance", onClick: aiEnhance },
    { key: "removebg", icon: <FaEraser size={18} color="#f472b6" />, label: "Remove BG", onClick: aiRemoveBg },
    { key: "colorboost", icon: <FaPalette size={18} color="#34d399" />, label: "Color Boost", onClick: aiColorBoost },
    { key: "facesmooth", icon: <FaUserAlt size={18} color="#facc15" />, label: "Face Smooth", onClick: aiFaceSmooth },
  ];

  return (
    <div className="fixed top-20 right-4 z-40 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col gap-3 shadow-lg w-36">
      <h3 className="text-xs text-gray-300 mb-1 text-center font-medium">AI Tools</h3>
      {tools.map((tool) => (
        <button
          key={tool.key}
          onClick={tool.onClick}
          className="flex items-center gap-2 text-xs text-gray-300 hover:text-indigo-400 hover:scale-105 transition-all duration-200 bg-gray-800/70 rounded-lg px-3 py-2"
        >
          {tool.icon} <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
