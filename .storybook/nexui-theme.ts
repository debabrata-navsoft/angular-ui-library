/**
 * Light/dark mode and theme colors for the whole Storybook. They are Storybook globals (`theme`, `palette`):
 * the toolbar (manager.ts) and the landing pages' top bar change them, preview.ts applies them to the page as
 * `data-theme` plus the primary/accent CSS variables, and manager.ts remembers them in localStorage.
 */

/** Theme colors offered in the palette menu; indigo is the Aurora default in theme.css */
export const PALETTES: Record<
  string,
  { label: string; primary: string; hover: string; accent: string }
> = {
  indigo: { label: 'Indigo', primary: '#6366f1', hover: '#4f46e5', accent: '#a855f7' },
  violet: { label: 'Violet', primary: '#8b5cf6', hover: '#7c3aed', accent: '#ec4899' },
  blue: { label: 'Blue', primary: '#3b82f6', hover: '#2563eb', accent: '#06b6d4' },
  teal: { label: 'Teal', primary: '#14b8a6', hover: '#0d9488', accent: '#0ea5e9' },
  emerald: { label: 'Emerald', primary: '#10b981', hover: '#059669', accent: '#84cc16' },
  amber: { label: 'Amber', primary: '#f59e0b', hover: '#d97706', accent: '#ef4444' },
  rose: { label: 'Rose', primary: '#f43f5e', hover: '#e11d48', accent: '#f97316' },
};

export const DEFAULT_GLOBALS = { theme: 'light', palette: 'indigo' };

/** localStorage key holding the last choice, e.g. {"theme":"dark","palette":"teal"} */
export const STORAGE_KEY = 'nexui-theme';

/** A palette's colors; unknown keys fall back to the default */
export function paletteColors(key: string | undefined) {
  return PALETTES[key ?? ''] ?? PALETTES[DEFAULT_GLOBALS.palette];
}

/** Mode and palette from Storybook globals, with defaults */
export function themeOf(globals: Record<string, string | undefined>) {
  return {
    theme: globals['theme'] ?? DEFAULT_GLOBALS.theme,
    palette: globals['palette'] ?? DEFAULT_GLOBALS.palette,
  };
}

/**
 * Puts a mode and palette on a document (the preview iframe, or the manager). Storybook sends globals on every
 * story render, so an unchanged theme returns false without touching the page
 */
export function applyTheme(doc: Document, theme: string | undefined, palette: string | undefined) {
  const root = doc.documentElement;
  const mode = theme === 'dark' ? 'dark' : 'light';
  const key = `${mode}|${palette}`;
  if (root.dataset['nexuiTheme'] === key) return false;
  root.dataset['nexuiTheme'] = key;
  root.dataset['theme'] = mode;
  const colors = paletteColors(palette);
  root.style.setProperty('--ui-primary', colors.primary);
  root.style.setProperty('--ui-primary-hover', colors.hover);
  root.style.setProperty('--ui-accent', colors.accent);
  return true;
}
