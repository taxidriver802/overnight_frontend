import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/state/auth-store";

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");

  async function onSubmit() {
    clearError();
    await signIn(employeeId, pin);
    const token = useAuthStore.getState().accessToken;
    if (token) {
      router.replace("/(tabs)");
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View
          style={{
            flex: 1,
            padding: Spacing.xl,
            justifyContent: "center",
            gap: Spacing.md,
          }}
        >
          <ThemedText type="title">Sign in</ThemedText>
          <ThemedText style={{ color: colors.textMuted }}>
            Employee ID and PIN. Dev guard: 9003 / 4242
          </ThemedText>
          <TextField
            label="Employee ID"
            value={employeeId}
            onChangeText={setEmployeeId}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextField
            label="PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          {error ? (
            <ThemedText style={{ color: colors.error }} accessibilityLiveRegion="polite">
              {error}
            </ThemedText>
          ) : null}
          <Button variant="primary" onPress={onSubmit}>
            Sign in
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
