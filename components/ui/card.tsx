import { type ViewProps, View } from "react-native";

import { Elevation, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type CardProps = ViewProps & {
  /** Use elevated surface and stronger shadow */
  elevated?: boolean;
  padded?: boolean;
};

export function Card({ style, elevated, padded = true, children, ...rest }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: Radii.lg,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          padding: padded ? Spacing.lg : 0,
          ...(elevated ? Elevation.md : Elevation.sm),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
