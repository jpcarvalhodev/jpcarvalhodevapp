import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Field, formStyles } from "./Form";
import { colors, radius } from "../theme";

export type SelectOption<V> = { value: V; label: string };

type Props<V> = {
  label?: string;
  required?: boolean;
  error?: boolean;
  value: V | undefined | null;
  options: SelectOption<V>[];
  onChange: (value: V | undefined) => void;
  allowEmpty?: boolean;
  placeholder?: string;
};

export const SelectField = <V extends string | number>({
  label,
  required,
  error,
  value,
  options,
  onChange,
  allowEmpty = true,
  placeholder,
}: Props<V>) => {
  const { t } = useTranslation("mobile");
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((o) => o.value === value);
  const emptyLabel = placeholder ?? t("select_placeholder");

  const pick = (v: V | undefined) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <Field label={label} required={required}>
      <Pressable
        onPress={() => setOpen(true)}
        style={[formStyles.input, styles.trigger, error && formStyles.inputError]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={selected ? formStyles.inputText : formStyles.placeholder} numberOfLines={1}>
          {selected?.label ?? emptyLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { marginBottom: insets.bottom + 16 }]}>
            {label ? <Text style={styles.title}>{label}</Text> : null}
            <FlatList
              data={allowEmpty ? [{ value: undefined, label: emptyLabel }, ...options] : options}
              keyExtractor={(item, i) => `${String(item.value)}-${i}`}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => pick(item.value as V | undefined)}
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionSelected]}>{item.label}</Text>
                    {isSelected ? <Ionicons name="checkmark" size={20} color={colors.blue} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </Field>
  );
};

const styles = StyleSheet.create({
  trigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 12 },
  sheet: { maxHeight: "70%", backgroundColor: colors.white, borderRadius: radius.lg, paddingVertical: 8 },
  title: { fontWeight: "700", fontSize: 16, color: colors.navy, paddingHorizontal: 16, paddingVertical: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  optionPressed: { backgroundColor: colors.bg },
  optionText: { fontSize: 16, color: colors.navy, flexShrink: 1 },
  optionSelected: { fontWeight: "700", color: colors.blue },
});
