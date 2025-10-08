// src/components/CropOverlay.jsx
import React, { useRef, useState, useEffect } from "react";

export default function CropOverlay({ canvasRef, setCropMode, pushUndo, setImgObj, draw }) {
  const overlayRef = useRef(null);
  const boxRef = useRef(null);
  const [box, setBox] = useState({ x: 80, y: 80, w: 220, h: 220 });
  const startRef = useRef({ x: 0, y: 0 });
  const startBox = useRef({});
  const action = useRef(null);

  // Keep crop box synced
  useEffect(() => {
    updateBoxPosition();
  }, [box]);

  const updateBoxPosition = () => {
    if (!boxRef.current) return;
    const el = boxRef.current;
    el.style.left = `${box.x}px`;
    el.style.top = `${box.y}px`;
    el.style.width = `${box.w}px`;
    el.style.height = `${box.h}px`;
  };

  const startAction = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const overlayRect = overlayRef.current.getBoundingClientRect();
    // store pointer pos relative to overlay
    startRef.current = { x: e.clientX - overlayRect.left, y: e.clientY - overlayRect.top };
    startBox.current = { ...box };
    action.current = mode;
    try {
      overlayRef.current.setPointerCapture(e.pointerId);
    } catch {}
  };

  const moveAction = (e) => {
    if (!action.current) return;
    const overlayRect = overlayRef.current.getBoundingClientRect();
    const currX = e.clientX - overlayRect.left;
    const currY = e.clientY - overlayRect.top;
    const dx = currX - startRef.current.x;
    const dy = currY - startRef.current.y;
    const b = { ...startBox.current };

    if (action.current === "move") {
      b.x = startBox.current.x + dx;
      b.y = startBox.current.y + dy;
    } else if (action.current === "resize") {
      b.w = Math.max(50, startBox.current.w + dx);
      b.h = Math.max(50, startBox.current.h + dy);
    }

    // clamp to overlay bounds (not canvas pixels)
    const maxX = overlayRect.width - b.w;
    const maxY = overlayRect.height - b.h;
    if (b.x < 0) b.x = 0;
    if (b.y < 0) b.y = 0;
    if (b.x > maxX) b.x = maxX;
    if (b.y > maxY) b.y = maxY;

    setBox(b);
  };

  const endAction = (e) => {
    action.current = null;
    try {
      overlayRef.current.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y, w, h } = box;

    // Convert DOM coords → canvas pixels
    const scaleX = canvas.width / canvas.clientWidth;
    const scaleY = canvas.height / canvas.clientHeight;

    const sx = Math.max(0, Math.round(x * scaleX));
    const sy = Math.max(0, Math.round(y * scaleY));
    const sw = Math.max(1, Math.round(w * scaleX));
    const sh = Math.max(1, Math.round(h * scaleY));

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // ensure within canvas bounds
    const adjW = Math.min(sw, canvas.width - sx);
    const adjH = Math.min(sh, canvas.height - sy);

    const croppedData = ctx.getImageData(sx, sy, adjW, adjH);

    const tmp = document.createElement("canvas");
    tmp.width = adjW;
    tmp.height = adjH;
    const tctx = tmp.getContext("2d");
    tctx.putImageData(croppedData, 0, 0);

    const cropped = new Image();
    cropped.onload = () => {
      setImgObj(cropped);
      // draw the cropped at once (it will fit container)
      draw(cropped);
      // commit history using provided pushUndo (compat)
      try {
        pushUndo();
      } catch {
        // fallback: nothing
      }
      setCropMode(false);
    };
    cropped.src = tmp.toDataURL("image/png");
  };

  const cancelCrop = () => {
    setCropMode(false);
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onPointerMove={moveAction}
      onPointerUp={endAction}
      onPointerCancel={endAction}
    >
      <div
        ref={boxRef}
        className="absolute border-2 border-indigo-500 bg-black/20 rounded-sm cursor-move"
        onPointerDown={(e) => startAction(e, "move")}
      >
        <div
          onPointerDown={(e) => startAction(e, "resize")}
          className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 cursor-nwse-resize"
        />
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={applyCrop}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition"
        >
          ✅ Apply Crop
        </button>
        <button
          onClick={cancelCrop}
          className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
