import React, { useState } from "react";
import {
  FaMagic,
  FaEraser,
  FaPalette,
  FaUserAlt,
  FaSun,
  FaSmileBeam,
  FaCloudSun,
  FaCameraRetro,
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { motion } from "framer-motion";

export default function AIPanel({
  aiEnhance,
  aiRemoveBg,
  aiColorBoost,
  aiFaceSmooth,
  aiAutoRetouch,
  aiHDR,
  aiRelight,
  aiCartoonify,
  aiDepthFocus,
  aiSkyReplace,
}) {
  // 🌌 Sky mode selector state
  const [skyMode, setSkyMode] = useState("galaxy");

  const tools = [
    {
      key: "autoretouch",
      icon: (
        <FaWandMagicSparkles
          size={22}
          style={{
            color: "#a78bfa",
            filter: "drop-shadow(0 0 6px rgba(167,139,250,0.6))",
          }}
        />
      ),
      label: "Auto Retouch",
      onClick: aiAutoRetouch,
      gradient: "from-indigo-500/40 to-purple-500/30",
    },
    {
      key: "enhance",
      icon: <FaMagic size={22} color="#818cf8" />,
      label: "Enhance",
      onClick: aiEnhance,
      gradient: "from-indigo-500/30 to-indigo-400/20",
    },
    {
      key: "removebg",
      icon: <FaEraser size={22} color="#f472b6" />,
      label: "Remove BG",
      onClick: aiRemoveBg,
      gradient: "from-pink-500/30 to-rose-400/20",
    },
    {
      key: "colorboost",
      icon: <FaPalette size={22} color="#34d399" />,
      label: "Color Boost",
      onClick: aiColorBoost,
      gradient: "from-emerald-500/30 to-green-400/20",
    },
    {
      key: "facesmooth",
      icon: <FaUserAlt size={22} color="#facc15" />,
      label: "Face Smooth",
      onClick: aiFaceSmooth,
      gradient: "from-amber-400/30 to-yellow-400/20",
    },
    // 🌟 Smart AI 2.0 New Tools
    {
      key: "aihdr",
      icon: <FaSun size={22} color="#fcd34d" />,
      label: "AI HDR",
      onClick: aiHDR,
      gradient: "from-yellow-500/30 to-orange-400/20",
    },
    {
      key: "relight",
      icon: <FaCloudSun size={22} color="#f87171" />,
      label: "Relight",
      onClick: aiRelight,
      gradient: "from-rose-500/30 to-red-400/20",
    },
    {
      key: "cartoonify",
      icon: <FaSmileBeam size={22} color="#facc15" />,
      label: "Cartoonify",
      onClick: aiCartoonify,
      gradient: "from-yellow-400/30 to-amber-300/20",
    },
    {
      key: "depthfocus",
      icon: <FaCameraRetro size={22} color="#38bdf8" />,
      label: "Depth Focus",
      onClick: aiDepthFocus,
      gradient: "from-sky-500/30 to-blue-400/20",
    },
  ];

  return (
    <motion.div
      className="mt-6 bg-[#0e0e11]/90 border border-white/10 rounded-2xl p-5 w-full max-w-3xl mx-auto shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h3 className="text-sm font-medium text-gray-300 text-center mb-4 tracking-wide">
        🧠 Smart AI 2.0 Tools
      </h3>

      {/* 🔮 Main AI Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {tools.map((tool) => (
          <motion.button
            key={tool.key}
            onClick={tool.onClick}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className={`flex flex-col items-center gap-2 rounded-xl py-3 bg-gradient-to-br ${tool.gradient} hover:bg-opacity-70 border border-white/10 transition-all duration-300 shadow-lg hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]`}
          >
            <div className="text-white">{tool.icon}</div>
            <span className="text-[11px] font-medium text-gray-300 tracking-wide">
              {tool.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* 🌌 Sky Replace Section */}
      <div className="mt-6 p-4 bg-[#1a1a1f]/70 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FaCloudSun size={22} color="#60a5fa" />
          <span className="text-sm text-gray-300 font-medium">
            AI Sky Replace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={skyMode}
            onChange={(e) => setSkyMode(e.target.value)}
            className="bg-[#101013] border border-white/10 text-gray-300 text-xs rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">☀️ Day</option>
            <option value="stars">🌠 Stars</option>
            <option value="galaxy">🌌 Galaxy</option>
          </select>

          <button
            onClick={() => aiSkyReplace(skyMode)}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            Apply
          </button>
        </div>
      </div>
    </motion.div>
  );
}
