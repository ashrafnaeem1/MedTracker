export type ThemeMode = "system" | "light" | "dark";

const DARK_CLASS = "ion-palette-dark";
const LIGHT_CLASS = "ion-palette-light";

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement.classList;
  root.toggle(DARK_CLASS, mode === "dark");
  root.toggle(LIGHT_CLASS, mode === "light");
}
