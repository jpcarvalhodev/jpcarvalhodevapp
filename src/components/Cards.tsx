import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "../theme";

type ActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export const ActionCard = ({ icon, label, onPress, disabled }: ActionCardProps) => (
  <View style={[styles.actionCard, shadow]}>
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.actionBtn, pressed && { transform: [{ translateY: 1 }] }, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={110} color={colors.white} />
    </Pressable>
    <Text style={styles.actionLabel}>{label}</Text>
  </View>
);

type BlockProps = { title: string; children: ReactNode; style?: object };

export const Block = ({ title, children, style }: BlockProps) => (
  <View style={[styles.block, shadow, style]}>
    <Text style={styles.blockHeader}>{title}</Text>
    <View>{children}</View>
  </View>
);

type RowProps = { cols: [ReactNode, ReactNode, ReactNode]; bold?: boolean };

export const Row3 = ({ cols }: RowProps) => (
  <View style={styles.row}>
    <Text style={[styles.col, styles.colLeft]} numberOfLines={1}>
      {cols[0]}
    </Text>
    <Text style={[styles.colMid]} numberOfLines={1}>
      {cols[1]}
    </Text>
    <Text style={[styles.col, styles.colRight]} numberOfLines={1}>
      {cols[2]}
    </Text>
  </View>
);

export const EmptyRow = ({ text }: { text: string }) => <Text style={styles.empty}>{text}</Text>;

const styles = StyleSheet.create({
  actionCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",
    gap: 12,
  },
  actionBtn: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.45 },
  actionLabel: { fontSize: 16, fontWeight: "700", color: colors.white },
  block: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.white,
    marginBottom: 14,
  },
  blockHeader: {
    color: colors.white,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontWeight: "800",
  },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 9 },
  col: { flex: 1, color: colors.navy },
  colLeft: { textAlign: "left" },
  colMid: { width: 90, textAlign: "center", fontWeight: "500", color: colors.navy },
  colRight: { textAlign: "right" },
  empty: { padding: 14, color: colors.muted },
});
