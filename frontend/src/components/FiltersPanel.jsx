import React, { useState, useRef } from "react";
import { FILTERS } from "../filters/filters";
import {
  FaSun,
  FaBalanceScale,
  FaTint,
  FaStar,
  FaUndoAlt,
  FaCameraRetro,
  FaMagic,
  FaPalette,
  FaMoon,
} from "react-icons/fa";

export default function FiltersPanel({
  imgObj,
  canvasRef,
  baseImageUrl,
  applyFilter,
  filterIntensity,
  setFilterIntensity,
  brightness,
  contrast,
  saturation,
  setBrightness,
  setContrast,
  setSaturation,
  serverApplyAdjustments,
  aiPortraitBoost,
  aiSkyMood,
  aiDetailEnhance,
}) {
  const [activeAdjust, setActiveAdjust] = useState(null);
  const [aiWorking, setAiWorking] = useState(false);
  const debounceRef = useRef(null);

  // ✅ Safe async handler for AI tools
  const runAI = async (fn, ...args) => {
    if (aiWorking) return;
    setAiWorking(true);
    try {
      await fn(...args);
    } catch (err) {
      console.error("AI Filter failed:", err);
    } finally {
      setAiWorking(false);
    }
  };

  // ✅ Debounced backend updates
  const scheduleServerUpdate = (latest = {}) => {
    if (!serverApplyAdjustments) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      serverApplyAdjustments(latest);
    }, 400);
  };

  // 🎚️ Adjustments list
  const adjustList = [
    { key: "brightness", icon: <FaSun size={20} color="#facc15" />, label: "Brightness" },
    { key: "contrast", icon: <FaBalanceScale size={20} color="#60a5fa" />, label: "Contrast" },
    { key: "saturation", icon: <FaTint size={20} color="#34d399" />, label: "Saturation" },
    { key: "sharpness", icon: <FaStar size={20} color="#a78bfa" />, label: "Sharpness" },
    { key: "vibrance", icon: <FaPalette size={20} color="#ec4899" />, label: "Vibrance" },
    { key: "temperature", icon: <FaSun size={20} color="#fb923c" />, label: "Temperature" },
    { key: "tint", icon: <FaTint size={20} color="#8b5cf6" />, label: "Tint" },
    { key: "highlights", icon: <FaSun size={20} color="#fde68a" />, label: "Highlights" },
    { key: "shadows", icon: <FaMoon size={20} color="#60a5fa" />, label: "Shadows" },
    { key: "clarity", icon: <FaMagic size={20} color="#f472b6" />, label: "Clarity" },
  ];

  const creativeEffects = [
    { name: "Bokeh Blur", css: "blur(3px) brightness(1.1)" },
    { name: "Depth Focus", css: "blur(2px) contrast(1.2) saturate(1.05)" },
    { name: "HDR Mix", css: "contrast(1.3) brightness(1.1) saturate(1.3)" },
    { name: "Dreamy Glow", css: "brightness(1.2) blur(1px) saturate(1.2)" },
  ];

  // 🎛️ Adjustment Logic
  const handleAdjustChange = (key, val) => {
    const mapped = 1 + val / 100;
    switch (key) {
      case "brightness":
        setBrightness(mapped);
        break;
      case "contrast":
        setContrast(mapped);
        break;
      case "saturation":
        setSaturation(mapped);
        break;
      case "vibrance":
        applyFilter(`saturate(${mapped * 1.1}) contrast(${mapped})`);
        break;
      case "temperature":
        applyFilter(`brightness(1.05) sepia(${val / 200})`);
        break;
      case "tint":
        applyFilter(`hue-rotate(${val * 1.5}deg)`);
        break;
      case "highlights":
        applyFilter(`brightness(${mapped + 0.1})`);
        break;
      case "shadows":
        applyFilter(`contrast(${mapped}) brightness(${1 + val / 200})`);
        break;
      case "clarity":
        applyFilter(`contrast(${mapped * 1.3}) saturate(${mapped})`);
        break;
      default:
        break;
    }
    scheduleServerUpdate({ [key]: mapped });
  };

  const handleResetAll = () => {
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setFilterIntensity(1);
    setActiveAdjust(null);
    applyFilter("none");
    if (serverApplyAdjustments)
      scheduleServerUpdate({ brightness: 1, contrast: 1, saturation: 1 });
  };

  return (
    <div className="mt-5 bg-[#111] p-5 rounded-lg shadow-sm w-full max-w-3xl mx-auto relative animate-slideUpPanel">

      {/* 🧭 Adjustments Section */}
      <h4 className="text-xs text-gray-400 mb-3 text-center">Adjustments</h4>
      <div className="grid grid-cols-5 gap-3 justify-center mb-4">
        {adjustList.map((a) => (
          <button
            key={a.key}
            onClick={() => setActiveAdjust(activeAdjust === a.key ? null : a.key)}
            className={`flex flex-col items-center text-xs transition-all duration-300 ${
              activeAdjust === a.key
                ? "text-indigo-400 scale-110"
                : "text-gray-400 hover:text-gray-300 hover:scale-105"
            }`}
          >
            {a.icon}
            <span className="text-[10px] mt-1">{a.label}</span>
          </button>
        ))}
      </div>

      {activeAdjust && (
        <div className="w-full flex flex-col items-center animate-slideUp mt-2">
          <label className="text-xs text-gray-300 mb-1 capitalize">{activeAdjust}</label>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            defaultValue="0"
            onChange={(e) =>
              handleAdjustChange(activeAdjust, parseInt(e.target.value, 10))
            }
            onMouseUp={() => applyFilter("none")}
            onTouchEnd={() => applyFilter("none")}
            className="w-4/5 accent-indigo-500 transition-all duration-200"
          />
        </div>
      )}

      <div className="flex justify-center mt-4 mb-5">
        <button
          onClick={handleResetAll}
          className="flex items-center gap-2 text-sm text-gray-200 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <FaUndoAlt size={14} /> Reset All
        </button>
      </div>

      {/* 🎨 Filters */}
      <h4 className="text-xs text-gray-400 mb-2">Basic Filters</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.slice(0, 6).map((f) => (
          <button
            key={f.name}
            onClick={() => applyFilter(f.name === "Original" ? "none" : f.css)}
            className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={baseImageUrl || canvasRef.current?.toDataURL("image/jpeg")}
                alt={f.name}
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: f.css }}
              />
            </div>
            <span className="text-[11px] mt-1 text-gray-300">{f.name}</span>
          </button>
        ))}
      </div>

      {/* 🌌 Creative Effects */}
      <h4 className="text-xs text-gray-400 mt-5 mb-2">Creative Effects</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {creativeEffects.map((f) => (
          <button
            key={f.name}
            onClick={() => applyFilter(f.css)}
            className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
              <FaCameraRetro color="#818cf8" size={20} />
            </div>
            <span className="text-[11px] mt-1 text-gray-300">{f.name}</span>
          </button>
        ))}
      </div>

      {/* 🎞️ Cinematic Filters */}
      <h4 className="text-xs text-gray-400 mt-5 mb-2">Cinematic Filters</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.slice(6).map((f) => (
          <button
            key={f.name}
            onClick={() => applyFilter(f.css)}
            className="flex flex-col items-center hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={baseImageUrl || canvasRef.current?.toDataURL("image/jpeg")}
                alt={f.name}
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: f.css }}
              />
            </div>
            <span className="text-[11px] mt-1 text-gray-300">{f.name}</span>
          </button>
        ))}
      </div>

      {/* 🧠 AI Tools */}
      <h4 className="text-xs text-gray-400 mt-5 mb-2">AI Powered Filters</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        <button
          disabled={aiWorking}
          onClick={() => runAI(aiPortraitBoost)}
          className={`flex flex-col items-center p-3 rounded-lg border border-white/10 transition-all ${
            aiWorking ? "opacity-50 cursor-wait" : "hover:scale-105"
          } bg-gradient-to-br from-purple-500/30 to-indigo-400/20`}
        >
          <FaMagic size={22} color="#a78bfa" />
          <span className="text-[11px] text-gray-300 mt-1">Portrait Boost</span>
        </button>

        <button
          disabled={aiWorking}
          onClick={() => runAI(aiSkyMood, "sunset")}
          className={`flex flex-col items-center p-3 rounded-lg border border-white/10 transition-all ${
            aiWorking ? "opacity-50 cursor-wait" : "hover:scale-105"
          } bg-gradient-to-br from-orange-400/30 to-pink-400/20`}
        >
          <FaSun size={22} color="#facc15" />
          <span className="text-[11px] text-gray-300 mt-1">Sky Mood</span>
        </button>

        <button
          disabled={aiWorking}
          onClick={() => runAI(aiDetailEnhance)}
          className={`flex flex-col items-center p-3 rounded-lg border border-white/10 transition-all ${
            aiWorking ? "opacity-50 cursor-wait" : "hover:scale-105"
          } bg-gradient-to-br from-blue-400/30 to-cyan-400/20`}
        >
          <FaStar size={22} color="#60a5fa" />
          <span className="text-[11px] text-gray-300 mt-1">Detail Enhance</span>
        </button>
      </div>

      {/* 🎚️ Filter Intensity */}
      <div className="mt-5 flex flex-col items-center">
        <label className="text-xs text-gray-400 mb-1">
          Filter Intensity ({filterIntensity.toFixed(1)}x)
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={filterIntensity}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setFilterIntensity(v);
            scheduleServerUpdate({});
          }}
          className="w-2/3 accent-indigo-500 transition-all duration-300"
        />
      </div>
    </div>
  );
}
