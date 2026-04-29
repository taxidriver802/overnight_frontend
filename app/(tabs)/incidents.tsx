import { ScrollView } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function IncidentsScreen() {
  const { colors } = useTheme();
  

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
        
      </ScrollView>
    </ThemedView>
  );
}
