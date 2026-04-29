import * as Haptics from "expo-haptics";
import { type ReactNode } from "react";
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show disabled visual state (also respects disabled prop) */
  loading?: boolean;
};

const sizeStyles: Record<
  ButtonSize,
  { paddingV: number; paddingH: number; fontSize: number; minHeight: number }
> = {
  sm: { paddingV: Spacing.sm, paddingH: Spacing.md, fontSize: 14, minHeight: 36 },
  md: { paddingV: Spacing.md - 2, paddingH: Spacing.lg, fontSize: 16, minHeight: 44 },
  lg: { paddingV: Spacing.md, paddingH: Spacing.xl, fontSize: 17, minHeight: 48 },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  const press = (e: Parameters<NonNullable<PressableProps["onPress"]>>[0]) => {
    if (isDisabled) return;
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  const container: StyleProp<ViewStyle> = [
    {
      borderRadius: Radii.md,
      minHeight: s.minHeight,
      paddingVertical: s.paddingV,
      paddingHorizontal: s.paddingH,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      opacity: isDisabled ? 0.55 : 1,
    },
    variant === "primary" && {
      backgroundColor: colors.tint,
    },
    variant === "secondary" && {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    variant === "outline" && {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.tint,
    },
    variant === "ghost" && {
      backgroundColor: "transparent",
    },
    variant === "danger" && {
      backgroundColor: colors.error,
    },
  ];

  const labelColor =
    variant === "primary"
      ? colors.onPrimary
      : variant === "danger"
        ? "#FFFFFF"
        : variant === "outline"
          ? colors.tint
          : variant === "secondary"
            ? colors.text
            : colors.tint;

  const labelStyle: TextStyle = {
    fontSize: s.fontSize,
    fontWeight: "600",
    color: labelColor,
    textAlign: "center",
  };

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={press}
      style={(state) => {
        const user = typeof style === "function" ? style(state) : style;
        return [
          container,
          state.pressed && !isDisabled ? { opacity: 0.88 } : null,
          user,
        ];
      }}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text style={labelStyle}>{loading ? "…" : children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
