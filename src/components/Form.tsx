import { useState, type ReactNode } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";

const showpass = require("../assets/img/login/showpass.png");
const hidepass = require("../assets/img/login/hidepass.png");

type FieldProps = {
  label?: string;
  required?: boolean;
  error?: boolean;
  children: ReactNode;
};

export const Field = ({ label, required, children }: FieldProps) => (
  <View style={styles.field}>
    {label ? (
      <Text style={styles.label} numberOfLines={1}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
    ) : null}
    {children}
  </View>
);

type TextFieldProps = TextInputProps & {
  label?: string;
  required?: boolean;
  error?: boolean;
};

export const TextField = ({ label, required, error, style, ...rest }: TextFieldProps) => (
  <Field label={label} required={required}>
    <TextInput
      placeholderTextColor={colors.muted2}
      style={[styles.input, rest.multiline && styles.multiline, error && styles.inputError, style]}
      {...rest}
    />
  </Field>
);

export const PasswordField = ({ label, required, error, style, ...rest }: TextFieldProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} required={required}>
      <View style={[styles.input, styles.passwordRow, error && styles.inputError]}>
        <TextInput
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.passwordInput, style]}
          placeholderTextColor={colors.muted2}
          {...rest}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Esconder password" : "Mostrar password"}
        >
          <Image source={visible ? hidepass : showpass} style={styles.eye} />
        </Pressable>
      </View>
    </Field>
  );
};

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => (
  <Pressable
    onPress={() => onChange(!checked)}
    style={styles.checkRow}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    hitSlop={6}
  >
    <Ionicons name={checked ? "checkbox" : "square-outline"} size={22} color={checked ? colors.blue : colors.muted} />
    <Text style={styles.checkLabel}>{label}</Text>
  </Pressable>
);

type RadioOption<V> = { value: V; label: string; color?: string };

type RadioGroupProps<V> = {
  value: V | undefined;
  options: RadioOption<V>[];
  onChange: (value: V) => void;
};

export const RadioGroup = <V extends string | number>({ value, options, onChange }: RadioGroupProps<V>) => (
  <View style={styles.radioGroup}>
    {options.map((o) => {
      const selected = o.value === value;
      return (
        <Pressable
          key={String(o.value)}
          onPress={() => onChange(o.value)}
          style={styles.checkRow}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          hitSlop={4}
        >
          <Ionicons
            name={selected ? "radio-button-on" : "radio-button-off"}
            size={22}
            color={selected ? colors.blue : colors.muted}
          />
          {o.color ? <Ionicons name="bookmark" size={16} color={o.color} /> : null}
          <Text style={styles.checkLabel}>{o.label}</Text>
        </Pressable>
      );
    })}
  </View>
);

type SwitchRowProps = { label: string; value: boolean; onChange: (v: boolean) => void };

export const SwitchRow = ({ label, value, onChange }: SwitchRowProps) => (
  <View style={styles.switchRow}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.blue }} />
  </View>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionHeader}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export const formStyles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  inputError: { borderColor: colors.red },
  inputText: { fontSize: 16, color: colors.navy },
  placeholder: { fontSize: 16, color: colors.muted2 },
});

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontWeight: "500", color: "#666666", fontSize: 14, marginBottom: 6 },
  required: { color: colors.red },
  input: { ...formStyles.input, fontSize: 16, color: colors.navy },
  multiline: { minHeight: 120, paddingTop: 10, textAlignVertical: "top" },
  inputError: formStyles.inputError,
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, fontSize: 16, color: colors.navy, paddingVertical: 10 },
  eye: { width: 20, height: 20, opacity: 0.6 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  checkLabel: { fontSize: 15, color: colors.navy, flexShrink: 1 },
  radioGroup: { gap: 2 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: "hidden",
    marginTop: 10,
  },
  sectionHeader: {
    backgroundColor: "#cccccc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: "600",
    color: colors.navy,
  },
  sectionBody: { padding: 10, backgroundColor: colors.white },
});
