import React, { useState, useEffect } from "react";
import TopBar from "./TopBar";
import Toolbar from "./Toolbar";
import FiltersPanel from "./FiltersPanel";
import useCanvasTools from "../hooks/useCanvasTools";
import CropOverlay from "./CropOverlay";
import ToastContainer from "./ToastContainer";
import AIOverlay from "./AIOverlay";
import ExportModal from "./ExportModal";
import AIPanel from "./AIPanel";
import { FaUndoAlt, FaRedoAlt, FaEye } from "react-icons/fa";

export default function ImageEditor() {
  const tools = useCanvasTools();
  const [toasts, setToasts] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // 👁️ Compare (Before/After) state
  const [showOriginal, setShowOriginal] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

  // ✅ Capture the TRUE original image once — when uploaded
useEffect(() => {
  if (tools.originalImg && !originalImageUrl) {
    requestAnimationFrame(() => {
      try {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = tools.originalImg.naturalWidth || tools.originalImg.width;
        tmpCanvas.height = tools.originalImg.naturalHeight || tools.originalImg.height;
        const ctx = tmpCanvas.getContext("2d");
        ctx.drawImage(tools.originalImg, 0, 0);
        setOriginalImageUrl(tmpCanvas.toDataURL("image/png"));
      } catch (err) {
        console.warn("Could not store original image:", err);
      }
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Run once only


  // 🧾 Toast helpers
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, onRemove: removeToast }]);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // 🔄 Undo / Redo / Flip / Rotate / Cancel
  const handleUndo = () => {
    tools.undo();
    showToast("Undo applied", "undo");
  };
  const handleRedo = () => {
    tools.redo();
    showToast("Redo applied", "redo");
  };
  const handleFlip = () => {
    tools.commitFlip();
    showToast("Image flipped", "rotate");
  };
  const handleRotate = () => {
    tools.commitRotate();
    showToast("Image rotated 90°", "rotate");
  };
  const handleCancel = () => {
    tools.cancelEdit();
    showToast("Edit canceled", "delete");
  };

  // 🪄 AI Auto Enhance
  const handleAutoEnhance = async () => {
    try {
      setAiLoading(true);
      const result = await tools.autoEnhance();
      if (result) showToast("AI Auto Enhance applied ✨", "reset");
    } catch {
      showToast("Enhance failed. Try again.", "delete");
    } finally {
      setTimeout(() => setAiLoading(false), 600);
    }
  };

  const handleExport = (format, quality) => {
    const canvas = tools.canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `edited.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, quality);
    link.click();
    setShowExport(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-gray-100 flex flex-col items-center overflow-hidden">
      {/* ===== Top Navigation ===== */}
      <TopBar
        fileName={tools.fileName}
        onUpload={tools.handleFile}
        onDownload={tools.download}
        onExport={() => setShowExport(true)}
      />

      {/* ===== Fixed Canvas + Scrollable Panels ===== */}
      <main className="relative w-full max-w-3xl flex flex-col h-[100vh] overflow-hidden">
        
        {/* ===== Fixed Canvas Section ===== */}
<div className="flex-grow flex items-center justify-center bg-black p-4 rounded-xl shadow-lg sticky top-0 z-20 relative">
  {tools.imgObj ? (
    <>
      {/* 🖼️ Canvas with GPU live preview filter */}
      <canvas
        ref={tools.canvasRef}
        className={`canvas-responsive rounded-md transition-all duration-150 ease-linear ${
          showOriginal ? "opacity-0" : "opacity-100"
        }`}
        style={{
          maxHeight: "70vh",
          position: "relative",
          zIndex: 10,
          // 💨 GPU filters — instant live adjustment preview
          filter: `
            brightness(${tools.brightness})
            contrast(${tools.contrast})
            saturate(${tools.saturation})
            hue-rotate(${tools.tint}deg)
            sepia(${tools.temperature / 200})
            contrast(${tools.clarity})
          `,
        }}
      />

      {/* 👁️ Original overlay */}
      {originalImageUrl && (
        <img
          src={originalImageUrl}
          alt="Original"
          className={`absolute inset-0 rounded-md object-contain mx-auto transition-opacity duration-300 ${
            showOriginal ? "opacity-100 z-20" : "opacity-0 z-0"
          }`}
          style={{ maxHeight: "70vh" }}
        />
      )}

      {/* ✅ Crop Overlay */}
      {tools.cropMode && (
        <CropOverlay
          canvasRef={tools.canvasRef}
          setCropMode={tools.setCropMode}
          pushUndo={tools.pushUndo}
          setImgObj={tools.setImgObj}
          draw={tools.draw}
        />
      )}
    </>
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-14 h-14 mb-3 opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5V6a2 2 0 012-2h14a2 2 0 012 2v10.5m-4-4.5l-4 4-4-4m0 0l-4 4-4-4"
        />
      </svg>
      <p className="text-sm opacity-70">Upload an image to start editing</p>
    </div>
  )}

  {/* 👁️ Press & Hold to Compare */}
  {tools.imgObj && (
    <div className="absolute top-4 right-6 z-30">
      <button
        onMouseDown={() => setShowOriginal(true)}
        onMouseUp={() => setShowOriginal(false)}
        onTouchStart={() => setShowOriginal(true)}
        onTouchEnd={() => setShowOriginal(false)}
        className={`p-3 rounded-full border border-white/10 shadow-lg transition-all duration-300 ${
          showOriginal
            ? "bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-400/40"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
        title="Press & Hold to View Original"
      >
        <FaEye size={18} color="#fff" />
      </button>
    </div>
  )}
</div>

        {/* ===== Scrollable Controls ===== */}
        <div className="overflow-y-auto mt-5 pb-40 px-3 no-scrollbar">
          <div className="mt-3 flex justify-center gap-6 sticky top-0 bg-[#0f0f10]/80 backdrop-blur-md py-3 rounded-lg z-10">
            <button
              onClick={handleUndo}
              className="flex items-center gap-2 px-5 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <FaUndoAlt size={16} color="#818cf8" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              onClick={handleRedo}
              className="flex items-center gap-2 px-5 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <FaRedoAlt size={16} color="#818cf8" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          </div>

          {tools.activeTool === "edit" && (
            <FiltersPanel
              imgObj={tools.imgObj}
              canvasRef={tools.canvasRef}
              applyFilter={tools.applyFilter}
              filterIntensity={tools.filterIntensity}
              setFilterIntensity={tools.setFilterIntensity}
              cancelEdit={handleCancel}
              brightness={tools.brightness}
              contrast={tools.contrast}
              saturation={tools.saturation}
              setBrightness={tools.setBrightness}
              setContrast={tools.setContrast}
              setSaturation={tools.setSaturation}
              aiPortraitBoost={tools.aiPortraitBoost}
              aiSkyMood={tools.aiSkyMood}
              aiDetailEnhance={tools.aiDetailEnhance}
            />
          )}

          {tools.activeTool === "ai" && (
            <AIPanel
              aiEnhance={handleAutoEnhance}
              aiRemoveBg={tools.aiRemoveBg}
              aiColorBoost={tools.aiColorBoost}
              aiFaceSmooth={tools.aiFaceSmooth}
              aiAutoRetouch={tools.aiAutoRetouch}
              aiHDR={tools.aiHDR}
              aiRelight={tools.aiRelight}
              aiCartoonify={tools.aiCartoonify}
              aiDepthFocus={tools.aiDepthFocus}
              aiSkyReplace={tools.aiSkyReplace}
            />
          )}
        </div>
      </main>

      {/* ===== Toolbar ===== */}
      <Toolbar
        setActiveTool={tools.setActiveTool}
        activeTool={tools.activeTool}
        setCropMode={tools.setCropMode}
        cropMode={tools.cropMode}
        commitFlip={handleFlip}
        commitRotate={handleRotate}
        autoEnhance={handleAutoEnhance}
        cancelEdit={handleCancel}
      />

      <ExportModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
      />
      <ToastContainer toasts={toasts} />
      <AIOverlay visible={aiLoading} />
    </div>
  );
}
