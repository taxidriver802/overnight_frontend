import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Elevation, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { colors } = useTheme();

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.surface }}>
        <View
          style={[
            {
              borderBottomWidth: 1,
              borderBottomColor: colors.borderSubtle,
              backgroundColor: colors.surface,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
            },
            Elevation.sm,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: Radii.sm,
                  backgroundColor: colors.tint,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.onPrimary} />
              </View>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 15 }}>
                ShiftGuard
              </ThemedText>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Spacing.xs,
                paddingHorizontal: Spacing.sm,
                paddingVertical: 6,
                borderRadius: Radii.full,
                backgroundColor: colors.successBackground,
                borderWidth: 1,
                borderColor: colors.success,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: colors.success,
                }}
              />
              <ThemedText
                style={{
                  color: colors.success,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                On Duty
              </ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>{children}</View>
    </ThemedView>
  );
}
