// src/components/AIOverlay.jsx
import React from "react";
import { FaMagic } from "react-icons/fa";

export default function AIOverlay({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-700 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <FaMagic
          size={42}
          className="text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.7)]"
        />
        <p className="text-gray-200 text-sm tracking-wide">
          ✨ Enhancing photo...
        </p>
      </div>
    </div>
  );
}
