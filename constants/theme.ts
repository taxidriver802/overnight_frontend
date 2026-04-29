import { Platform } from "react-native";

/**
 * Spacing, radii, and elevation tokens (theme-agnostic).
 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
} as const;

export const Radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const Elevation = {
  /** Subtle card / control */
  sm: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
    android: { elevation: 1 },
    default: {},
  }),
  /** Floating bar, primary card */
  md: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
    android: { elevation: 3 },
    default: {},
  }),
  /** Modal, popover */
  lg: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

/**
 * One row of semantic colors for a single appearance (light OR dark) within a scheme.
 */
export type ThemePalette = {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  tint: string;
  tintForeground: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  link: string;
  overlay: string;
  modalBackdrop: string;
  /** iOS shadow / border on elevated surfaces */
  shadow: string;
  /** Muted control / disabled */
  controlMuted: string;
  /** Text on primary (tint) button */
  onPrimary: string;
};

export type ThemeSchemeId = "slate" | "ocean" | "warm" | "graphite";

export const THEME_SCHEME_LABELS: Record<ThemeSchemeId, string> = {
  slate: "Slate",
  ocean: "Ocean",
  warm: "Warm",
  graphite: "Graphite",
};

export const THEME_SCHEME_ORDER: ThemeSchemeId[] = ["slate", "ocean", "warm", "graphite"];

export const THEME_SCHEME_DESCRIPTIONS: Record<ThemeSchemeId, string> = {
  slate: "Default — balanced teal and slate",
  ocean: "Cool blues, crisp contrast",
  warm: "Warm neutrals, restrained accent",
  graphite: "Minimal monochrome with blue accent",
};

export const DEFAULT_THEME_SCHEME: ThemeSchemeId = "slate";

const slate: { light: ThemePalette; dark: ThemePalette } = {
  light: {
    text: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    background: "#F1F5F9",
    backgroundSecondary: "#E2E8F0",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#CBD5E1",
    borderSubtle: "#E2E8F0",
    tint: "#0E7490",
    tintForeground: "#FFFFFF",
    icon: "#64748B",
    tabIconDefault: "#64748B",
    tabIconSelected: "#0E7490",
    success: "#15803D",
    successBackground: "#DCFCE7",
    warning: "#B45309",
    warningBackground: "#FEF3C7",
    error: "#B91C1C",
    errorBackground: "#FEE2E2",
    info: "#1D4ED8",
    infoBackground: "#DBEAFE",
    inputBackground: "#FFFFFF",
    inputBorder: "#CBD5E1",
    placeholder: "#94A3B8",
    link: "#0E7490",
    overlay: "rgba(15, 23, 42, 0.45)",
    modalBackdrop: "rgba(15, 23, 42, 0.5)",
    shadow: "rgba(15, 23, 42, 0.12)",
    controlMuted: "#E2E8F0",
    onPrimary: "#FFFFFF",
  },
  dark: {
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    background: "#0F1419",
    backgroundSecondary: "#1A222C",
    surface: "#1A222C",
    surfaceElevated: "#232D3A",
    border: "#334155",
    borderSubtle: "#1E293B",
    tint: "#22D3EE",
    tintForeground: "#0F172A",
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#22D3EE",
    success: "#4ADE80",
    successBackground: "#14532D",
    warning: "#FBBF24",
    warningBackground: "#78350F",
    error: "#F87171",
    errorBackground: "#7F1D1D",
    info: "#93C5FD",
    infoBackground: "#1E3A8A",
    inputBackground: "#1A222C",
    inputBorder: "#334155",
    placeholder: "#64748B",
    link: "#67E8F9",
    overlay: "rgba(0, 0, 0, 0.55)",
    modalBackdrop: "rgba(0, 0, 0, 0.6)",
    shadow: "rgba(0, 0, 0, 0.35)",
    controlMuted: "#334155",
    onPrimary: "#0F172A",
  },
};

const ocean: { light: ThemePalette; dark: ThemePalette } = {
  light: {
    text: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    background: "#F0F7FF",
    backgroundSecondary: "#E0EFFE",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#BFDBFE",
    borderSubtle: "#DBEAFE",
    tint: "#1D4ED8",
    tintForeground: "#FFFFFF",
    icon: "#64748B",
    tabIconDefault: "#64748B",
    tabIconSelected: "#1D4ED8",
    success: "#047857",
    successBackground: "#D1FAE5",
    warning: "#B45309",
    warningBackground: "#FEF3C7",
    error: "#B91C1C",
    errorBackground: "#FEE2E2",
    info: "#1E40AF",
    infoBackground: "#DBEAFE",
    inputBackground: "#FFFFFF",
    inputBorder: "#BFDBFE",
    placeholder: "#94A3B8",
    link: "#1D4ED8",
    overlay: "rgba(15, 23, 42, 0.45)",
    modalBackdrop: "rgba(15, 23, 42, 0.5)",
    shadow: "rgba(30, 58, 138, 0.15)",
    controlMuted: "#DBEAFE",
    onPrimary: "#FFFFFF",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    background: "#0C1526",
    backgroundSecondary: "#152238",
    surface: "#152238",
    surfaceElevated: "#1C2D4A",
    border: "#1E3A5F",
    borderSubtle: "#234067",
    tint: "#60A5FA",
    tintForeground: "#0F172A",
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#60A5FA",
    success: "#34D399",
    successBackground: "#064E3B",
    warning: "#FBBF24",
    warningBackground: "#78350F",
    error: "#FCA5A5",
    errorBackground: "#7F1D1D",
    info: "#93C5FD",
    infoBackground: "#1E3A8A",
    inputBackground: "#152238",
    inputBorder: "#1E3A5F",
    placeholder: "#64748B",
    link: "#93C5FD",
    overlay: "rgba(0, 0, 0, 0.55)",
    modalBackdrop: "rgba(0, 0, 0, 0.6)",
    shadow: "rgba(0, 0, 0, 0.4)",
    controlMuted: "#1E3A5F",
    onPrimary: "#0F172A",
  },
};

const warm: { light: ThemePalette; dark: ThemePalette } = {
  light: {
    text: "#1C1917",
    textSecondary: "#44403C",
    textMuted: "#78716C",
    background: "#FAF8F5",
    backgroundSecondary: "#F5F0E8",
    surface: "#FFFCF7",
    surfaceElevated: "#FFFFFF",
    border: "#D6D3D1",
    borderSubtle: "#E7E5E4",
    tint: "#A16207",
    tintForeground: "#FFFFFF",
    icon: "#78716C",
    tabIconDefault: "#78716C",
    tabIconSelected: "#A16207",
    success: "#166534",
    successBackground: "#DCFCE7",
    warning: "#C2410C",
    warningBackground: "#FFEDD5",
    error: "#B91C1C",
    errorBackground: "#FEE2E2",
    info: "#B45309",
    infoBackground: "#FEF3C7",
    inputBackground: "#FFFCF7",
    inputBorder: "#D6D3D1",
    placeholder: "#A8A29E",
    link: "#A16207",
    overlay: "rgba(28, 25, 23, 0.45)",
    modalBackdrop: "rgba(28, 25, 23, 0.5)",
    shadow: "rgba(28, 25, 23, 0.1)",
    controlMuted: "#E7E5E4",
    onPrimary: "#FFFFFF",
  },
  dark: {
    text: "#FAFAF9",
    textSecondary: "#D6D3D1",
    textMuted: "#A8A29E",
    background: "#1C1917",
    backgroundSecondary: "#292524",
    surface: "#292524",
    surfaceElevated: "#44403C",
    border: "#57534E",
    borderSubtle: "#44403C",
    tint: "#D6B88A",
    tintForeground: "#1C1917",
    icon: "#A8A29E",
    tabIconDefault: "#A8A29E",
    tabIconSelected: "#D6B88A",
    success: "#86EFAC",
    successBackground: "#14532D",
    warning: "#FDBA74",
    warningBackground: "#7C2D12",
    error: "#FCA5A5",
    errorBackground: "#7F1D1D",
    info: "#FCD34D",
    infoBackground: "#78350F",
    inputBackground: "#292524",
    inputBorder: "#57534E",
    placeholder: "#78716C",
    link: "#E7D4B5",
    overlay: "rgba(0, 0, 0, 0.55)",
    modalBackdrop: "rgba(0, 0, 0, 0.6)",
    shadow: "rgba(0, 0, 0, 0.35)",
    controlMuted: "#44403C",
    onPrimary: "#1C1917",
  },
};

const graphite: { light: ThemePalette; dark: ThemePalette } = {
  light: {
    text: "#171717",
    textSecondary: "#404040",
    textMuted: "#737373",
    background: "#FAFAFA",
    backgroundSecondary: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E5E5E5",
    borderSubtle: "#F5F5F5",
    tint: "#2563EB",
    tintForeground: "#FFFFFF",
    icon: "#737373",
    tabIconDefault: "#737373",
    tabIconSelected: "#2563EB",
    success: "#15803D",
    successBackground: "#DCFCE7",
    warning: "#CA8A04",
    warningBackground: "#FEF9C3",
    error: "#DC2626",
    errorBackground: "#FEE2E2",
    info: "#2563EB",
    infoBackground: "#DBEAFE",
    inputBackground: "#FFFFFF",
    inputBorder: "#E5E5E5",
    placeholder: "#A3A3A3",
    link: "#2563EB",
    overlay: "rgba(23, 23, 23, 0.45)",
    modalBackdrop: "rgba(23, 23, 23, 0.5)",
    shadow: "rgba(0, 0, 0, 0.08)",
    controlMuted: "#F5F5F5",
    onPrimary: "#FFFFFF",
  },
  dark: {
    text: "#FAFAFA",
    textSecondary: "#D4D4D4",
    textMuted: "#A3A3A3",
    background: "#0A0A0A",
    backgroundSecondary: "#171717",
    surface: "#171717",
    surfaceElevated: "#262626",
    border: "#404040",
    borderSubtle: "#262626",
    tint: "#60A5FA",
    tintForeground: "#0F172A",
    icon: "#A3A3A3",
    tabIconDefault: "#A3A3A3",
    tabIconSelected: "#60A5FA",
    success: "#4ADE80",
    successBackground: "#14532D",
    warning: "#FACC15",
    warningBackground: "#713F12",
    error: "#F87171",
    errorBackground: "#7F1D1D",
    info: "#93C5FD",
    infoBackground: "#1E3A8A",
    inputBackground: "#171717",
    inputBorder: "#404040",
    placeholder: "#737373",
    link: "#93C5FD",
    overlay: "rgba(0, 0, 0, 0.65)",
    modalBackdrop: "rgba(0, 0, 0, 0.7)",
    shadow: "rgba(0, 0, 0, 0.5)",
    controlMuted: "#262626",
    onPrimary: "#0F172A",
  },
};

export const themeSchemes: Record<ThemeSchemeId, { light: ThemePalette; dark: ThemePalette }> = {
  slate,
  ocean,
  warm,
  graphite,
};

/** Legacy flat export: default scheme only (for static imports / tests). Prefer useTheme().colors. */
export const Colors = {
  light: slate.light,
  dark: slate.dark,
};

export type AppearancePreference = "system" | "light" | "dark";

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export function resolveAppearance(
  preference: AppearancePreference,
  system: "light" | "dark" | null | undefined
): "light" | "dark" {
  if (preference === "system") {
    return system === "dark" ? "dark" : "light";
  }
  return preference;
}

export function getPalette(
  schemeId: ThemeSchemeId,
  appearance: "light" | "dark"
): ThemePalette {
  return themeSchemes[schemeId][appearance];
}
