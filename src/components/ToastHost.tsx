import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore, type ToastType } from "../utils/toast";
import { colors, radius } from "../theme";

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "close-circle",
  warn: "warning",
  info: "information-circle",
};

const ACCENT: Record<ToastType, string> = {
  success: colors.green,
  error: colors.red,
  warn: colors.amber,
  info: colors.blue,
};

export const ToastHost = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
      {toasts.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => dismiss(t.id)}
          style={[styles.toast, { borderLeftColor: ACCENT[t.type] }]}
          accessibilityRole="alert"
        >
          <Ionicons name={ICONS[t.type]} size={22} color={ACCENT[t.type]} />
          <Text style={styles.text}>{t.message}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: { flex: 1, color: colors.navy, fontSize: 14 },
});
