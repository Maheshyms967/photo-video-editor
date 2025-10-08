// src/components/ToastContainer.jsx
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaUndoAlt,
  FaSyncAlt,
  FaRedoAlt,
  FaMagic,
  FaTrashAlt,
} from "react-icons/fa";

const iconMap = {
  success: <FaCheckCircle color="#4ade80" />,
  undo: <FaUndoAlt color="#60a5fa" />,
  redo: <FaRedoAlt color="#60a5fa" />,
  rotate: <FaSyncAlt color="#facc15" />,
  reset: <FaMagic color="#a78bfa" />,
  delete: <FaTrashAlt color="#f87171" />,
};

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} />
      ))}
    </div>
  );
}

function ToastItem({ toast, index }) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setVisible(true);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const removeTimer = setTimeout(() => toast.onRemove(toast.id), 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-800 shadow-lg backdrop-blur-md text-sm text-gray-100 bg-black/90 transition-all duration-500 ${
        fadeOut
          ? "opacity-0 translate-y-3"
          : "opacity-100 translate-y-0"
      }`}
      style={{
        marginBottom: `${index * 4}px`,
        transitionTimingFunction: "ease-in-out",
      }}
    >
      {iconMap[toast.type] || iconMap.success}
      <span>{toast.message}</span>
    </div>
  );
}
