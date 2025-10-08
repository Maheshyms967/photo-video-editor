import React, { useState } from "react";

export default function ExportModal({ visible, onClose, onExport }) {
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.9);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] p-6 rounded-2xl w-80 shadow-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">Export Options</h3>

        <label className="block text-sm text-gray-400 mb-2">Format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full bg-gray-800 rounded-lg p-2 mb-4 text-gray-100"
        >
          <option value="png">PNG (Transparent)</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
        </select>

        <label className="block text-sm text-gray-400 mb-2">
          Quality ({(quality * 100).toFixed(0)}%)
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={quality}
          onChange={(e) => setQuality(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 mb-5"
        />

        <div className="flex justify-between">
          <button
            onClick={() => onExport(format, quality)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"
          >
            Export
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
