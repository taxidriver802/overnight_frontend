import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModalCard } from "@/components/ui/modal-card";
import { TextField } from "@/components/ui/text-field";
import {
  Spacing,
  THEME_SCHEME_DESCRIPTIONS,
  THEME_SCHEME_LABELS,
  THEME_SCHEME_ORDER,
  type AppearancePreference,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/state/auth-store";

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const {
    schemeId,
    setSchemeId,
    appearancePreference,
    setAppearancePreference,
    colors,
  } = useTheme();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [sampleField, setSampleField] = useState("");

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing["3xl"],
          gap: Spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="title" style={{ marginBottom: Spacing.xs }}>
          Appearance
        </ThemedText>
        <ThemedText style={{ color: colors.textMuted, marginBottom: Spacing.sm }}>
          Workplace-friendly palettes. Choice is saved on this device.
        </ThemedText>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Session
          </ThemedText>
          <ThemedText style={{ color: colors.textMuted, marginBottom: Spacing.md }}>
            Sign out clears tokens stored on this device.
          </ThemedText>
          <Button
            variant="outline"
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/login");
            }}
          >
            Sign out
          </Button>
        </Card>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Color scheme
          </ThemedText>
          <View style={{ gap: Spacing.sm }}>
            {THEME_SCHEME_ORDER.map((id) => {
              const selected = schemeId === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setSchemeId(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={{
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: selected ? colors.tint : colors.borderSubtle,
                    backgroundColor: selected ? colors.controlMuted : "transparent",
                  }}
                >
                  <ThemedText type="defaultSemiBold">{THEME_SCHEME_LABELS[id]}</ThemedText>
                  <ThemedText style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                    {THEME_SCHEME_DESCRIPTIONS[id]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Light / dark
          </ThemedText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }}>
            {(
              [
                ["system", "System"],
                ["light", "Light"],
                ["dark", "Dark"],
              ] as const
            ).map(([value, label]) => {
              const selected = appearancePreference === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setAppearancePreference(value as AppearancePreference)}
                  style={{
                    paddingVertical: Spacing.sm,
                    paddingHorizontal: Spacing.lg,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? colors.tint : colors.border,
                    backgroundColor: selected ? colors.tint : "transparent",
                  }}
                >
                  <ThemedText
                    style={{
                      fontWeight: "600",
                      color: selected ? colors.onPrimary : colors.text,
                    }}
                  >
                    {label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <ThemedText type="title" style={{ marginTop: Spacing.md }}>
          UI kit preview
        </ThemedText>

        <Card elevated>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Buttons
          </ThemedText>
          <View style={{ gap: Spacing.sm }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </View>
        </Card>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Form
          </ThemedText>
          <TextField
            label="Sample field"
            placeholder="Placeholder text"
            value={sampleField}
            onChangeText={setSampleField}
          />
          <TextField label="With error" error="This is an error message" value="" onChangeText={() => {}} />
        </Card>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.md }}>
            Modal layer
          </ThemedText>
          <Button variant="secondary" onPress={() => setDemoModalOpen(true)}>
            Open sample modal
          </Button>
        </Card>

        <Card>
          <ThemedText type="subtitle" style={{ marginBottom: Spacing.sm }}>
            Semantic colors
          </ThemedText>
          <View style={{ gap: Spacing.xs }}>
            <ThemedText style={{ color: colors.success }}>Success · {colors.success}</ThemedText>
            <ThemedText style={{ color: colors.warning }}>Warning · {colors.warning}</ThemedText>
            <ThemedText style={{ color: colors.error }}>Error · {colors.error}</ThemedText>
            <ThemedText style={{ color: colors.info }}>Info · {colors.info}</ThemedText>
          </View>
        </Card>
      </ScrollView>

      <ModalCard visible={demoModalOpen} onClose={() => setDemoModalOpen(false)}>
        <ThemedText type="subtitle" style={{ marginBottom: Spacing.sm }}>
          ModalCard
        </ThemedText>
        <ThemedText style={{ color: colors.textMuted, marginBottom: Spacing.lg }}>
          Themed backdrop and elevated surface. Use for dialogs separate from stack modals.
        </ThemedText>
        <Button variant="primary" onPress={() => setDemoModalOpen(false)}>
          Close
        </Button>
      </ModalCard>
    </ThemedView>
  );
}
