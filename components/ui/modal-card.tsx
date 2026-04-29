import { Modal, Pressable, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Elevation, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ModalCardProps = ViewProps & {
  visible: boolean;
  onClose: () => void;
  /** Max width for tablet-style dialogs */
  maxWidth?: number;
};

/**
 * Centered dialog with themed backdrop. Use for in-app overlays (separate from expo-router modal screens).
 */
export function ModalCard({ visible, onClose, maxWidth = 400, style, children, ...rest }: ModalCardProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: colors.modalBackdrop,
          justifyContent: "center",
          padding: Spacing.lg,
          paddingTop: insets.top + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
        }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={[
              {
                alignSelf: "center",
                width: "100%",
                maxWidth,
                backgroundColor: colors.surfaceElevated,
                borderRadius: Radii.xl,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                padding: Spacing.xl,
                ...Elevation.lg,
              },
              style,
            ]}
            {...rest}
          >
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
