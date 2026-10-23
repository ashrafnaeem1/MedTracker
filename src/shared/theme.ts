export type ThemeMode = "system" | "light" | "dark";

const DARK_PALETTE_CLASS = "ion-palette-dark";
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
let currentMode: ThemeMode = "system";

function applyPalette(): void {
  const isDark = currentMode === "dark" || (currentMode === "system" && systemDark.matches);
  document.documentElement.classList.toggle(DARK_PALETTE_CLASS, isDark);
}

systemDark.addEventListener("change", () => {
  if (currentMode === "system") {
    applyPalette();
  }
});

export function applyTheme(mode: ThemeMode): void {
  currentMode = mode;
  applyPalette();
}
