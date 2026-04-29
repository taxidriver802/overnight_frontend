import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

import {
  type AppearancePreference,
  DEFAULT_THEME_SCHEME,
  type ThemePalette,
  type ThemeSchemeId,
  getPalette,
  resolveAppearance,
} from "@/constants/theme";

const STORAGE_SCHEME = "@overnight/theme-scheme";
const STORAGE_APPEARANCE = "@overnight/appearance-preference";

export type AppThemeContextValue = {
  schemeId: ThemeSchemeId;
  setSchemeId: (id: ThemeSchemeId) => void;
  appearancePreference: AppearancePreference;
  setAppearancePreference: (pref: AppearancePreference) => void;
  /** Resolved light/dark after applying system or user override */
  resolvedAppearance: "light" | "dark";
  colors: ThemePalette;
  isReady: boolean;
};

const defaultValue: AppThemeContextValue = {
  schemeId: DEFAULT_THEME_SCHEME,
  setSchemeId: () => {},
  appearancePreference: "system",
  setAppearancePreference: () => {},
  resolvedAppearance: "light",
  colors: getPalette(DEFAULT_THEME_SCHEME, "light"),
  isReady: false,
};

export const AppThemeContext = createContext<AppThemeContextValue>(defaultValue);

type Props = { children: React.ReactNode };

export function ThemeProvider({ children }: Props) {
  const systemScheme = useRNColorScheme();
  const [schemeId, setSchemeIdState] = useState<ThemeSchemeId>(DEFAULT_THEME_SCHEME);
  const [appearancePreference, setAppearancePreferenceState] = useState<AppearancePreference>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rawScheme, rawAppearance] = await Promise.all([
          AsyncStorage.getItem(STORAGE_SCHEME),
          AsyncStorage.getItem(STORAGE_APPEARANCE),
        ]);
        if (cancelled) return;
        if (rawScheme === "slate" || rawScheme === "ocean" || rawScheme === "warm" || rawScheme === "graphite") {
          setSchemeIdState(rawScheme);
        }
        if (rawAppearance === "system" || rawAppearance === "light" || rawAppearance === "dark") {
          setAppearancePreferenceState(rawAppearance);
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSchemeId = useCallback((id: ThemeSchemeId) => {
    setSchemeIdState(id);
    void AsyncStorage.setItem(STORAGE_SCHEME, id);
  }, []);

  const setAppearancePreference = useCallback((pref: AppearancePreference) => {
    setAppearancePreferenceState(pref);
    void AsyncStorage.setItem(STORAGE_APPEARANCE, pref);
  }, []);

  const resolvedAppearance = useMemo(
    () => resolveAppearance(appearancePreference, systemScheme),
    [appearancePreference, systemScheme]
  );

  const colors = useMemo(
    () => getPalette(schemeId, resolvedAppearance),
    [schemeId, resolvedAppearance]
  );

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      schemeId,
      setSchemeId,
      appearancePreference,
      setAppearancePreference,
      resolvedAppearance,
      colors,
      isReady,
    }),
    [
      schemeId,
      setSchemeId,
      appearancePreference,
      setAppearancePreference,
      resolvedAppearance,
      colors,
      isReady,
    ]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}
