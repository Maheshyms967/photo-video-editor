// src/components/Toolbar.jsx
import { useState } from "react";
import {
  FaSlidersH,
  FaCropAlt,
  FaSyncAlt,
  FaRedoAlt,
  FaMagic,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Toolbar({
  setActiveTool,
  activeTool,
  setCropMode,
  cropMode,
  commitFlip,
  commitRotate,
  autoEnhance,
  cancelEdit,
}) {
  const [flashEffect, setFlashEffect] = useState(false);

  // 🪄 Trigger flash animation when effect is applied
  const triggerFlash = (callback) => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 500);
    callback?.();
  };

  const tools = [
    {
      key: "edit",
      icon: <FaSlidersH size={22} color="#818cf8" />,
      label: "Edit",
      onClick: () => {
        setActiveTool("edit");
        setCropMode(false);
      },
    },
    {
      key: "ai",
      icon: (
        <motion.div
          animate={
            activeTool === "ai"
              ? {
                  scale: [1, 1.15, 1],
                  filter: [
                    "drop-shadow(0 0 4px rgba(167,139,250,0.6))",
                    "drop-shadow(0 0 10px rgba(167,139,250,0.8))",
                    "drop-shadow(0 0 4px rgba(167,139,250,0.6))",
                  ],
                }
              : {}
          }
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaMagic size={22} color="#a78bfa" />
        </motion.div>
      ),
      label: "AI",
      onClick: () => {
        setActiveTool("ai");
        setCropMode(false);
      },
    },
    {
      key: "auto",
      icon: (
        <FaMagic
          size={22}
          style={{
            color: "#a78bfa",
            filter: "drop-shadow(0 0 6px rgba(167,139,250,0.7))",
          }}
        />
      ),
      label: "Auto",
      onClick: () => triggerFlash(autoEnhance),
    },
    {
      key: "crop",
      icon: <FaCropAlt size={22} color="#f472b6" />,
      label: "Crop",
      onClick: () => {
        setActiveTool("crop");
        setCropMode((m) => !m);
      },
    },
    {
      key: "flip",
      icon: <FaSyncAlt size={22} color="#34d399" />,
      label: "Flip",
      onClick: () => triggerFlash(commitFlip),
    },
    {
      key: "rotate",
      icon: <FaRedoAlt size={22} color="#facc15" />,
      label: "Rotate",
      onClick: () => triggerFlash(commitRotate),
    },
    {
      key: "cancel",
      icon: <FaTimes size={20} color="#f87171" />,
      label: "Cancel",
      onClick: cancelEdit,
    },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-3xl px-4 pointer-events-auto relative">
        {/* ✨ Flash overlay when effect is applied */}
        <AnimatePresence>
          {flashEffect && (
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* 🧭 Toolbar */}
        <div
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-3 flex items-center gap-5 overflow-x-auto no-scrollbar shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all duration-300"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {tools.map((tool) => (
            <button
              key={tool.key}
              onClick={tool.onClick}
              className={`flex flex-col items-center text-xs flex-shrink-0 scroll-snap-align-start transition-all duration-300 ${
                activeTool === tool.key || (tool.key === "crop" && cropMode)
                  ? "scale-110 text-indigo-400"
                  : "text-gray-400 hover:text-gray-300 hover:scale-105"
              }`}
              style={{ minWidth: "60px" }}
            >
              {tool.icon}
              <span className="text-[10px] mt-1">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
