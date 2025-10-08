import { useEffect, useRef, useState } from "react";

export default function CompareSlider({ beforeUrl, afterCanvas, autoSlide = false }) {
  const containerRef = useRef(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Convert canvas to image
  useEffect(() => {
    if (afterCanvas && afterRef.current) {
      const url = afterCanvas.toDataURL("image/png");
      afterRef.current.src = url;
    }
  }, [afterCanvas]);

  // Auto-slide preview when enabled
  useEffect(() => {
    if (!autoSlide) return;
    let dir = 1;
    const interval = setInterval(() => {
      setSliderPos((pos) => {
        const next = pos + dir * 2;
        if (next >= 90 || next <= 10) dir *= -1;
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [autoSlide]);

  function startDrag(e) {
    setIsDragging(true);
    moveSlider(e);
  }

  function stopDrag() {
    setIsDragging(false);
  }

  function moveSlider(e) {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(newPos);
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl mx-auto mt-4 overflow-hidden rounded-xl shadow-lg select-none"
      onMouseMove={moveSlider}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={moveSlider}
      onTouchEnd={stopDrag}
    >
      <img ref={beforeRef} src={beforeUrl} alt="Before" className="w-full block object-contain" />
      <div
        className="absolute top-0 left-0 h-full overflow-hidden"
        style={{ width: `${sliderPos}%`, transition: isDragging ? "none" : "0.2s ease" }}
      >
        <img ref={afterRef} alt="After" className="w-full block object-contain" />
      </div>

      {/* Vertical Line */}
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="absolute top-0 bottom-0"
        style={{
          left: `${sliderPos}%`,
          width: "3px",
          background: "rgba(129,140,248,0.9)",
          cursor: "ew-resize",
        }}
      ></div>

      {/* Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          left: `calc(${sliderPos}% - 12px)`,
          background: "#818cf8",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "2px solid white",
          boxShadow: "0 0 10px rgba(129,140,248,0.6)",
          cursor: "ew-resize",
        }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      ></div>
    </div>
  );
}
