// Shared light-theme styles for all pages

export const PAGE_BG = "linear-gradient(135deg, #EDECEA 0%, #E9EAE6 45%, #EBE9ED 100%)";

export const CARD = {
  background: "#FFFFFF",
  border: "1px solid #DDD9D3",
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
};

export const CARD_HOVER = {
  ...CARD,
  boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
};

export const MODAL_BG = "#FFFFFF";
export const MODAL_BORDER = "1px solid #DDD9D3";

// Pill / badge label
export const PILL = {
  background: "#F1F5FF",
  border: "1px solid rgba(77,124,254,0.2)",
  color: "#4D7CFE",
};

// Primary button
export const BTN_PRIMARY = { background: "#4D7CFE", color: "#fff" };
// Secondary button
export const BTN_SECONDARY = { background: "#fff", border: "1px solid #DDD9D3", color: "#1F1F1F" };
// Tertiary / IA button
export const BTN_TERTIARY = { background: "#F3F0FF", color: "#6B5BD2" };

export const TEXT = {
  heading: "#1F1F1F",
  body: "#6E6E73",
  muted: "#A0A0A6",
};

export const COLORS = {
  blue: "#4D7CFE",
  green: "#8CBF9F",
  orange: "#F28C52",
  purple: "#A78BFA",
  yellow: "#F4D96C",
};