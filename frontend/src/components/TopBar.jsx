// src/components/TopBar.jsx
import { FaDownload, FaUpload } from "react-icons/fa";

export default function TopBar({ fileName, onUpload, onDownload, onExport }) {
  return (
    <header className="w-full max-w-3xl mx-auto px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-gradient-to-b from-black/80 to-black/10 backdrop-blur-md border-b border-gray-800 shadow-lg">
      
      {/* Export Button */}
      <button
        onClick={onExport}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <FaDownload size={14} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* File Name */}
      <div className="text-center text-xs sm:text-sm truncate w-36 sm:w-72 opacity-90">
        {fileName}
      </div>

      {/* Upload Button */}
      <label className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-700 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95">
        <FaUpload size={14} color="#93c5fd" />
        <span className="hidden sm:inline">Upload</span>
        <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
      </label>
    </header>
  );
}
