import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/context/theme-provider";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function RootNavigation() {
  const { resolvedAppearance, colors } = useTheme();

  return (
    <>
      <StatusBar style={resolvedAppearance === "dark" ? "light" : "dark"} backgroundColor={colors.background} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppShell>
        <RootNavigation />
      </AppShell>
    </ThemeProvider>
  );
}
