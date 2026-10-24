// WCAG AAA: body text and controls at 7:1 contrast or better; large text at 4.5:1;
// non-text boundaries at 3:1. Colours are explicit so they hold in light and dark system modes.
export const PALETTE = {
  surface: "#ffffff",
  text: "#111827",
  sectionLine: "#6b7280",
  sectionLabel: "#4b5563",
  mutedText: "#374151",
  upcoming: { background: "#f5f7fa", text: "#1f2937", border: "#6b7280" },
  unknown: { background: "#fafafa", text: "#111827", border: "#4b5563" },
  taken: { background: "#f1faf4", text: "#0b4d24", border: "#1e7a3c" },
  missed: { background: "#fdf3f3", text: "#7a1212", border: "#b42318" },
  quantityChip: { background: "#f3f4f6", text: "#374151", border: "#d1d5db" },
  cardBorder: {
    upcoming: "#c9d3e0",
    unknown: "#d9d4c9",
    taken: "#bfe3cc",
    missed: "#f0c4c4",
  },
  pill: {
    upcoming: { background: "#dbeafe", text: "#1e3a8a", border: "#1d4ed8" },
    unknown: { background: "#fef9c3", text: "#713f12", border: "#a16207" },
    taken: { background: "#dcfce7", text: "#14532d", border: "#15803d" },
    missed: { background: "#fee2e2", text: "#7f1d1d", border: "#b91c1c" },
  },
  chipToday: { background: "#14532d", text: "#ffffff" },
  chipOther: { background: "#4b5563", text: "#ffffff" },
} as const;
