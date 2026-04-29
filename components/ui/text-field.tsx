import { useState } from "react";
import {
  type StyleProp,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "@/components/themed-text";

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  error,
  style,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.tint : colors.inputBorder;

  const inputStyles: TextStyle = {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: colors.text,
    minHeight: 44,
  };

  return (
    <View style={[{ marginBottom: Spacing.md }, containerStyle]}>
      {label ? (
        <ThemedText type="defaultSemiBold" style={{ marginBottom: Spacing.xs }}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.placeholder}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[inputStyles, style]}
        {...rest}
      />
      {error ? (
        <ThemedText style={{ color: colors.error, marginTop: Spacing.xs, fontSize: 13 }}>{error}</ThemedText>
      ) : null}
    </View>
  );
}
