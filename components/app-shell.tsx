import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Elevation, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, usePathname } from "expo-router";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { colors } = useTheme();
  const pathname = usePathname();
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

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
            <Link href="/" asChild>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go to Overview"
                hitSlop={10}
              >
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
            </Pressable>
            </Link>


            <Link href="/settings" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open settings"
                hitSlop={10}
                style={({ pressed }) => ({
                  padding: 6,
                  borderRadius: 999,
                  backgroundColor: pressed || settingsActive ? colors.controlMuted : "transparent",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={settingsActive ? colors.tabIconSelected : colors.tabIconDefault}
                />
              </Pressable>
            </Link>

          </View>
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>{children}</View>
    </ThemedView>
  );
}
