import { View, type ViewProps } from "react-native";

import type { ThemePalette } from "@/constants/theme";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundRole?: keyof Pick<
    ThemePalette,
    "background" | "backgroundSecondary" | "surface" | "surfaceElevated"
  >;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  backgroundRole = "background",
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, backgroundRole);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
