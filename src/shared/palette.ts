// Colour roles for the whole app. Values are CSS variables from src/theme/tokens.css,
// so every role switches with the Ionic palette (light, dark, or system).
export const PALETTE = {
  surface: "var(--app-surface)",
  text: "var(--app-text)",
  mutedText: "var(--app-muted)",
  sectionLine: "var(--app-line-strong)",
  sectionLabel: "var(--app-subtle)",
  upcoming: {
    background: "var(--app-upcoming-bg)",
    text: "var(--app-upcoming-text)",
    border: "var(--app-upcoming-border)",
  },
  unknown: {
    background: "var(--app-unknown-bg)",
    text: "var(--app-unknown-text)",
    border: "var(--app-unknown-border)",
  },
  taken: {
    background: "var(--app-taken-bg)",
    text: "var(--app-taken-text)",
    border: "var(--app-taken-border)",
  },
  missed: {
    background: "var(--app-missed-bg)",
    text: "var(--app-missed-text)",
    border: "var(--app-missed-border)",
  },
  cardBorder: {
    upcoming: "var(--app-upcoming-card)",
    unknown: "var(--app-unknown-card)",
    taken: "var(--app-taken-card)",
    missed: "var(--app-missed-card)",
  },
  pill: {
    upcoming: {
      background: "var(--app-pill-upcoming-bg)",
      text: "var(--app-pill-upcoming-text)",
      border: "var(--app-pill-upcoming-border)",
    },
    unknown: {
      background: "var(--app-pill-unknown-bg)",
      text: "var(--app-pill-unknown-text)",
      border: "var(--app-pill-unknown-border)",
    },
    taken: {
      background: "var(--app-pill-taken-bg)",
      text: "var(--app-pill-taken-text)",
      border: "var(--app-pill-taken-border)",
    },
    missed: {
      background: "var(--app-pill-missed-bg)",
      text: "var(--app-pill-missed-text)",
      border: "var(--app-pill-missed-border)",
    },
  },
  quantityChip: {
    background: "var(--app-chip-bg)",
    text: "var(--app-muted)",
    border: "var(--app-border-strong)",
  },
  chipToday: {
    background: "var(--app-chip-today-bg)",
    text: "var(--app-chip-today-text)",
  },
  chipOther: {
    background: "var(--app-chip-other-bg)",
    text: "var(--app-chip-other-text)",
  },
} as const;
