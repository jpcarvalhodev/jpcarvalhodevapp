import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "../theme";

type Props = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "outline" | "solid" | "danger";
  style?: StyleProp<ViewStyle>;
};

export const Button = ({ title, onPress, disabled, loading, variant = "outline", style }: Props) => {
  const isDisabled = disabled || loading;
  const solid = variant === "solid";
  const danger = variant === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        solid && styles.solid,
        danger && styles.danger,
        pressed && (solid ? styles.solidPressed : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={solid ? colors.white : colors.dark} />
      ) : (
        <Text style={[styles.text, solid && styles.solidText, danger && styles.dangerText]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  pressed: { backgroundColor: colors.dark },
  solid: { backgroundColor: colors.blue, borderColor: colors.blue },
  solidPressed: { opacity: 0.85 },
  danger: { borderColor: colors.red },
  disabled: { opacity: 0.45 },
  text: { color: colors.dark, fontSize: 15, fontWeight: "600" },
  solidText: { color: colors.white },
  dangerText: { color: colors.red },
});
