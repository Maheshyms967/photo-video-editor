// src/filters/filters.js
export const FILTERS = [
  { name: "Original", css: "none" },
  { name: "Warm", css: "brightness(1.05) contrast(1.1) sepia(0.2) saturate(1.2)" },
  { name: "Cool", css: "contrast(1.1) brightness(1.05) hue-rotate(200deg) saturate(1.1)" },
  { name: "Vintage", css: "contrast(1.05) brightness(1.1) sepia(0.4) saturate(0.9)" },
  { name: "B&W", css: "grayscale(1) contrast(1.2)" },
  { name: "Bright Pop", css: "contrast(1.3) brightness(1.2) saturate(1.4)" },

  // 🌈 Cinematic Filters
  { name: "CineSoft", css: "contrast(1.1) brightness(1.05) saturate(1.1) hue-rotate(10deg)" },
  { name: "Golden Hour", css: "sepia(0.25) contrast(1.15) brightness(1.1) saturate(1.25)" },
  { name: "Deep Blue", css: "contrast(1.15) brightness(0.95) hue-rotate(210deg) saturate(1.3)" },
  { name: "Noir", css: "grayscale(1) contrast(1.5) brightness(0.9)" },
  { name: "Dream Glow", css: "contrast(1.05) brightness(1.15) saturate(1.1) blur(1px)" },
  { name: "Retro Fade", css: "sepia(0.3) contrast(1.1) brightness(1.05) saturate(0.85)" },
];
