import type { ThemePalette } from "@/constants/theme";

import { useTheme } from "@/hooks/use-theme";

type ThemeColorName = keyof ThemePalette;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName
): string {
  const { colors, resolvedAppearance } = useTheme();
  const override = props[resolvedAppearance];
  if (override !== undefined) {
    return override;
  }
  return colors[colorName];
}
