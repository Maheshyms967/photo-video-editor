import { useRef, useState, useEffect } from "react";
import localforage from "localforage";
import { BASE_URL } from "../utils/config.js";

export default function useCanvasTools() {
  const canvasRef = useRef(null);

  const [imgObj, setImgObj] = useState(null);
  const [originalImg, setOriginalImg] = useState(null);
  const [fileName, setFileName] = useState("No Image");

  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [vibrance, setVibrance] = useState(1);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [shadows, setShadows] = useState(1);
  const [highlights, setHighlights] = useState(1);
  const [clarity, setClarity] = useState(1);

  const [rotate, setRotate] = useState(0);
  const [flip, setFlip] = useState(false);

  const [cropMode, setCropMode] = useState(false);
  const [activeTool, setActiveTool] = useState("edit");
  const [activeFilter, setActiveFilter] = useState("none");
  const [filterIntensity, setFilterIntensity] = useState(1);
  const aiAutoRetouch = () => aiRequest("/ai_autoretouch", "ai_autoretouch.png");

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  // Animation trigger state for canvas feedback
const [effectFlash, setEffectFlash] = useState(false);
const [aiProcessing, setAiProcessing] = useState(false); // 🧠 AI glow state
const [liveCssFilter, setLiveCssFilter] = useState("none");

  // ===================================================
  // ⚡ Canvas Flash Animation
  // ===================================================
function triggerCanvasFlash() {
  setEffectFlash(true);
  setTimeout(() => setEffectFlash(false), 400);
}

useEffect(() => {
  const css = `
    brightness(${brightness})
    contrast(${contrast})
    saturate(${saturation})
    hue-rotate(${tint}deg)
    sepia(${temperature / 200})
    contrast(${clarity})
  `;
  setLiveCssFilter(css);
}, [brightness, contrast, saturation, tint, temperature, clarity]);

useEffect(() => {
  if (!canvasRef.current || !effectFlash) return;
  const canvas = canvasRef.current;
  canvas.style.transition = "filter 0.3s ease";
  canvas.style.filter = "brightness(1.5)";
  setTimeout(() => (canvas.style.filter = "brightness(1)"), 300);
}, [effectFlash]);

  // ===== Load saved image/meta =====
  useEffect(() => {
    (async () => {
      const metaRaw = localStorage.getItem("photoEditorMeta");
      if (metaRaw) {
        try {
          const data = JSON.parse(metaRaw);
          setBrightness(data.brightness ?? 1);
          setContrast(data.contrast ?? 1);
          setRotate(data.rotate ?? 0);
          setFlip(data.flip ?? false);
          setActiveFilter(data.activeFilter ?? "none");
          setFilterIntensity(data.filterIntensity ?? 1);
          setSaturation(data.saturation ?? 1);
          if (data.fileName) setFileName(data.fileName);
        } catch (e) {
          console.warn("Failed to parse meta", e);
        }
      }

      const blob = await localforage.getItem("photoEditorImage");
      if (blob) {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          setImgObj(img);
          setOriginalImg(img);
          requestAnimationFrame(() => draw(img, true));
          undoStack.current = [canvasRef.current?.toDataURL()];
          redoStack.current = [];
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Persist image/meta safely =====
  useEffect(() => {
    if (!imgObj || !canvasRef.current) return;
    const canvas = canvasRef.current;

    canvas.toBlob(async (blob) => {
      if (blob) await localforage.setItem("photoEditorImage", blob);
    }, "image/png", 0.95);

    const meta = {
      brightness,
      contrast,
      saturation,
      rotate,
      flip,
      activeFilter,
      filterIntensity,
      fileName,
    };

    try {
      localStorage.setItem("photoEditorMeta", JSON.stringify(meta));
    } catch (err) {
      console.warn("Storage quota exceeded, skipping meta save:", err);
    }
  }, [
    imgObj,
    brightness,
    contrast,
    saturation,
    rotate,
    flip,
    activeFilter,
    filterIntensity,
    fileName,
  ]);

  // ===== Redraw when core states change =====
  useEffect(() => {
    if (imgObj) requestAnimationFrame(() => draw(imgObj));
  }, [imgObj, brightness, contrast, saturation, rotate, flip, activeFilter, filterIntensity]);

  // ===== Draw (HD accurate) =====
function draw(img, forceHD = false) {
  const canvas = canvasRef.current;
  if (!canvas || !img) return;
  const ctx = canvas.getContext("2d");

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const dpr = window.devicePixelRatio || 1;

  // 🧩 Calculate new canvas size based on rotation
  const angle = (rotate * Math.PI) / 180;
  const isVertical = rotate % 180 !== 0;
  const rotatedWidth = isVertical ? height : width;
  const rotatedHeight = isVertical ? width : height;

  // 🧠 Expand canvas correctly for rotation
  canvas.width = rotatedWidth * dpr;
  canvas.height = rotatedHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.save();
  ctx.clearRect(0, 0, rotatedWidth, rotatedHeight);

  // 🪄 Center before rotation
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(angle);

  // 🔁 Flip horizontally if needed
  if (flip) ctx.scale(-1, 1);

  // 🎨 Apply filters
  const b = brightness;
  const c = contrast;
  const s = saturation;
  const af = activeFilter;
  const fi = filterIntensity;

  let baseFilter = `brightness(${b}) contrast(${c}) saturate(${s})`;
  if (af && af !== "none") {
    try {
      const applied = af.replace(/1\)/g, `${fi})`);
      baseFilter = `${applied} ${baseFilter}`;
    } catch {
      baseFilter = `${af} ${baseFilter}`;
    }
  }
  ctx.filter = baseFilter;

  // 🧩 Draw the image centered
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

  // 🪄 Flash feedback animation
useEffect(() => {
  if (!canvasRef.current || !effectFlash) return;
  const canvas = canvasRef.current;
  canvas.style.transition = "filter 0.3s ease";
  canvas.style.filter = "brightness(1.5)";
  setTimeout(() => (canvas.style.filter = "brightness(1)"), 300);
}, [effectFlash]);


// 🌈 AI Processing — Dynamic Breathing Glow Animation
// 🌈 AI Processing — Dynamic Breathing Glow Animation
useEffect(() => {
  if (!canvasRef.current) return;
  const canvas = canvasRef.current;

  let color = "purple"; // default
  let glowColor = "rgba(167,139,250,0.7)"; // default purple

  if (aiProcessing && typeof aiProcessing === "string") {
    if (aiProcessing.includes("remove")) {
      color = "pink";
      glowColor = "rgba(244,114,182,0.7)";
    } else if (aiProcessing.includes("color")) {
      color = "green";
      glowColor = "rgba(52,211,153,0.7)";
    } else if (aiProcessing.includes("face")) {
      color = "yellow";
      glowColor = "rgba(250,204,21,0.7)";
    }
  }

  if (aiProcessing) {
    canvas.style.animation = `ai-breathe-${color} 2s ease-in-out infinite`;
    canvas.style.boxShadow = `0 0 25px ${glowColor}`;
  } else {
    canvas.style.animation = "none";
    canvas.style.boxShadow = "none";
    canvas.style.filter = "none";
  }
}, [aiProcessing]);

  // ===================================================

  // ===== Full-res canvas helper =====
  function getFullResCanvasFromImage(image) {
    const tmp = document.createElement("canvas");
    tmp.width = image.naturalWidth || image.width;
    tmp.height = image.naturalHeight || image.height;
    const ctx = tmp.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return tmp;
  }

  // ===== File upload (HD-safe) =====
  function handleFile(e) {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    setFileName(f.name);

    const url = URL.createObjectURL(f);
    const img = new Image();
    if (!url.startsWith("blob:")) img.crossOrigin = "anonymous";

    img.onload = async () => {
      setImgObj(img);
      setOriginalImg(img);

      const fullCanvas = getFullResCanvasFromImage(img);
      fullCanvas.toBlob(async (blob) => {
        if (blob) await localforage.setItem("photoEditorImage", blob);
      }, "image/png", 0.95);

      try {
        localStorage.setItem(
          "photoEditorMeta",
          JSON.stringify({
            fileName: f.name,
            brightness: 1,
            contrast: 1,
            saturation: 1,
            rotate: 0,
            flip: false,
            activeFilter: "none",
            filterIntensity: 1,
          })
        );
      } catch (err) {
        console.warn("⚠️ Meta save skipped:", err);
      }

      requestAnimationFrame(() => draw(img, true));

      const canvas = canvasRef.current;
      if (canvas) {
        undoStack.current = [canvas.toDataURL("image/png")];
        redoStack.current = [];
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // ===== History =====
// ===== History (Optimized Undo/Redo using Blob URLs) =====
async function commitHistory() {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // Save current canvas as a compressed blob instead of DataURL
  canvas.toBlob(
    (blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const last = undoStack.current[undoStack.current.length - 1];

      if (!last || last.url !== url) {
        undoStack.current.push({ url, blob });
        if (undoStack.current.length > 20) {
          // keep memory safe
          const removed = undoStack.current.shift();
          URL.revokeObjectURL(removed.url);
        }
        redoStack.current = [];
      }
    },
    "image/jpeg",
    0.8 // compression to reduce memory usage
  );
}

async function loadFromBlobUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
}

async function undo() {
  if (undoStack.current.length <= 1) return;
  const current = undoStack.current.pop();
  redoStack.current.push(current);

  const prev = undoStack.current[undoStack.current.length - 1];
  const img = await loadFromBlobUrl(prev.url);
  setImgObj(img);
  draw(img, true);
}

async function redo() {
  if (!redoStack.current.length) return;
  const next = redoStack.current.pop();
  undoStack.current.push(next);

  const img = await loadFromBlobUrl(next.url);
  setImgObj(img);
  draw(img, true);
}

// ✅ Fix — define pushUndo after commitHistory exists
const pushUndo = () => {
  if (canvasRef.current) commitHistory();
};


  // ===== Filters =====
  function applyFilter(filterCSS) {
    if (!imgObj) return;
     triggerCanvasFlash();
    if (filterCSS === "none") {
      setActiveFilter("none");
      setFilterIntensity(1);
      draw(imgObj, true);
      commitHistory();
      return;
    }
    setActiveFilter(filterCSS);
    draw(imgObj, true);
    commitHistory();
  }

  // ===== Rotate & Flip =====
  function commitRotate() {
    if (!imgObj) return;
    const next = (rotate + 90) % 360;
    setRotate(next);
    requestAnimationFrame(() => {
      draw(imgObj, true);
      commitHistory();
    });
  }

  function commitFlip() {
    if (!imgObj) return;
    const next = !flip;
    setFlip(next);
    requestAnimationFrame(() => {
      draw(imgObj, true);
      commitHistory();
    });
  }

  // ===== High-quality Blob Helper =====
  function getFullResBlob(format = "image/png", quality = 0.95) {
    const base = originalImg || imgObj;
    if (!base) return null;
    const tmp = document.createElement("canvas");
    tmp.width = base.naturalWidth || base.width;
    tmp.height = base.naturalHeight || base.height;
    const ctx = tmp.getContext("2d");
    ctx.drawImage(base, 0, 0);
    return new Promise((res) => tmp.toBlob(res, format, quality));
  }

  // ===================================================
  // 🧠 AI Tools Integration (Backend Routes)
  // ===================================================
async function aiRequest(endpoint, fileName = "ai_result.png") {
  const blob = await getFullResBlob("image/png");
  if (!blob) return false;

  const fd = new FormData();
  fd.append("image", blob, fileName);

  try {
    setAiProcessing(endpoint); // 🌈 Start glow
    triggerCanvasFlash(); // ⚡ Light flash

    const resp = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: fd,
    });

    if (!resp.ok) throw new Error("AI request failed");

    const outBlob = await resp.blob();
    const safeBlob = outBlob.slice(0, outBlob.size, "image/png"); // ✅ safe copy
    const url = URL.createObjectURL(safeBlob);
    const img = new Image();

    img.onload = async () => {
      setAiProcessing(false); // 🌈 Stop glow
      setImgObj(img);
      draw(img, true);

      // 🧩 Persist in localforage
      await imgToBlobAndSave(img);

      // 🕒 Save undo state safely after draw completes
      setTimeout(() => {
        commitHistory();
      }, 200); // small delay ensures canvas is ready

      URL.revokeObjectURL(url);
    };

    img.src = url;
    return true;
  } catch (err) {
    setAiProcessing(false);
    console.error(`${endpoint} failed:`, err);
    return false;
  }
}



  const autoEnhance = () => aiRequest("/auto_enhance", "ai_enhance.png");
  const aiRemoveBg = () => aiRequest("/remove_background", "removebg.png");
  const aiColorBoost = () => aiRequest("/ai_colorboost", "color_boost.png");
  const aiFaceSmooth = () => aiRequest("/ai_facesmooth", "face_smooth.png");
  // 🔥 Smart AI 2.0 Tools
const aiHDR = () => aiRequest("/ai_hdr", "ai_hdr.png");
const aiRelight = () => aiRequest("/ai_relight", "ai_relight.png");
const aiCartoonify = () => aiRequest("/ai_cartoonify", "ai_cartoonify.png");
const aiDepthFocus = () => aiRequest("/ai_depthfocus", "ai_depthfocus.png");
const aiPortraitBoost = () => aiRequest("/ai_portraitboost", "portrait_boost.png");

async function aiSkyMood(mood = "sunset") {
  const blob = await getFullResBlob("image/png");
  if (!blob) return;
  const fd = new FormData();
  fd.append("image", blob, "skymood.png");
  fd.append("mood", mood);

  try {
    setAiProcessing(`/ai_skymood_${mood}`);
    triggerCanvasFlash();

    const resp = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: fd,
    });
    if (!resp.ok) throw new Error("AI Sky Mood failed");

    const outBlob = await resp.blob();
    const url = URL.createObjectURL(outBlob);
    const img = new Image();
    img.onload = () => {
      setImgObj(img);
      draw(img, true);
      commitHistory();
      setAiProcessing(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (err) {
    setAiProcessing(false);
    console.error(err);
  }
}

const aiDetailEnhance = () => aiRequest("/ai_detailenhance", "detail_enhance.png");

async function aiSkyReplace(mode = "galaxy") {
  const canvas = canvasRef.current;
  const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.95));
  const fd = new FormData();
  fd.append("image", blob, "skyreplace.png");
  fd.append("mode", mode); // 🌌 Send sky mode to backend

  try {
    setAiProcessing(`/ai_skyreplace_${mode}`);
    triggerCanvasFlash();

    const resp = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: fd,
    });

    if (!resp.ok) throw new Error("Sky replace failed");

    const outBlob = await resp.blob();
    const url = URL.createObjectURL(outBlob);
    const img = new Image();
    img.onload = () => {
      setImgObj(img);
      draw(img, true);
      commitHistory();
      setAiProcessing(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (err) {
    setAiProcessing(false);
    console.error("Sky replace failed:", err);
  }
}

  async function imgToBlobAndSave(image) {
  const tmp = document.createElement("canvas");
  tmp.width = image.naturalWidth || image.width;
  tmp.height = image.naturalHeight || image.height;
  const ctx = tmp.getContext("2d");
  ctx.drawImage(image, 0, 0);
  tmp.toBlob(async (blob) => {
    if (blob) await localforage.setItem("photoEditorImage", blob);
  }, "image/png", 0.95);
}

  // ===== Cancel Edit =====
  function cancelEdit() {
    localStorage.removeItem("photoEditorMeta");
    localforage.removeItem("photoEditorImage");
    setImgObj(null);
    setFileName("No Image");
    setBrightness(1);
    setContrast(1);
    setSaturation(1);
    setRotate(0);
    setFlip(false);
    setActiveFilter("none");
    setFilterIntensity(1);
    undoStack.current = [];
    redoStack.current = [];
  }

  // ===== Return Hook API =====
  return {
    canvasRef,
    imgObj,
    liveCssFilter,
    originalImg,
    fileName,
    brightness,
    contrast,
    saturation,
    vibrance,
    temperature,
    tint,
    shadows,
    highlights,
    clarity,

    rotate,
    flip,
    cropMode,
    activeTool,
    activeFilter,
    filterIntensity,

    aiHDR,
    aiRelight,
    aiCartoonify,
    aiDepthFocus,
    aiSkyReplace,
    aiAutoRetouch,
    aiPortraitBoost,
    aiSkyMood,
    aiDetailEnhance,
    setBrightness,
    setContrast,
    setSaturation,
    setVibrance,
    setTemperature,
    setTint,
    setShadows,
    setHighlights,
    setClarity,
    setCropMode,
    setActiveTool,
    setImgObj,
    setFilterIntensity,

    draw,
    handleFile,
    undo,
    redo,
    commitFlip,
    commitRotate,
    applyFilter,
    commitHistory,
    pushUndo,

    // AI tools
    autoEnhance,
    aiRemoveBg,
    aiColorBoost,
    aiFaceSmooth,
    triggerCanvasFlash,

    cancelEdit,
  };
}
