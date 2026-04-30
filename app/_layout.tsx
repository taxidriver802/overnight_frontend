import * as SplashScreen from "expo-splash-screen";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/context/theme-provider";
import { useTheme } from "@/hooks/use-theme";
import { setApiBaseUrlOverride } from "@/lib/api/client/base-url";
import { isExpoTunnel } from "@/lib/api/client/expo-tunnel";
import { createQueryClient } from "@/lib/api/client/query-client";
import { useAuthStore } from "@/state/auth-store";
import { QueryClientProvider } from "@tanstack/react-query";

void SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigationInner() {
  const { resolvedAppearance, colors } = useTheme();
  const hydrated = useAuthStore((s) => s.hydrated);
  const segments = useSegments();

  useEffect(() => {
    if (isExpoTunnel()) {
      const tunnelBase = process.env.EXPO_PUBLIC_API_BASE_URL_TUNNEL?.trim();
      setApiBaseUrlOverride(tunnelBase && tunnelBase.length > 0 ? tunnelBase : null);
    } else {
      setApiBaseUrlOverride(null);
    }

    void useAuthStore.getState().hydrate().finally(() => {
      void SplashScreen.hideAsync();
    });
  }, []);

  if (!hydrated) {
    return null;
  }

  const inAuthGroup = segments[0] === "(auth)";
  const onIndex = segments[0] === "index" || segments.length === 0;

  const stack = (
    <>
      <StatusBar style={resolvedAppearance === "dark" ? "light" : "dark"} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </>
  );

  if (inAuthGroup || onIndex) {
    return stack;
  }

  return <AppShell>{stack}</AppShell>;
}

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootNavigationInner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}