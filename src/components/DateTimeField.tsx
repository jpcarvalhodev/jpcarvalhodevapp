import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Field, formStyles } from "./Form";
import { Button } from "./Button";
import { colors, radius } from "../theme";

type Props = {
  label?: string;
  required?: boolean;
  error?: boolean;
  value: Date | null;
  onChange: (value: Date) => void;
  mode: "datetime" | "time";
};

const pad = (n: number) => String(n).padStart(2, "0");

const formatValue = (d: Date, mode: Props["mode"]) => {
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (mode === "time") return time;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${time}`;
};

export const DateTimeField = ({ label, required, error, value, onChange, mode }: Props) => {
  const { t, i18n } = useTranslation("modals");
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const open = () => {
    const current = value ?? new Date();

    if (Platform.OS === "android") {
      const openTime = (base: Date) =>
        DateTimePickerAndroid.open({
          value: base,
          mode: "time",
          is24Hour: true,
          onValueChange: (_e, time) => {
            const next = new Date(base);
            next.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(next);
          },
        });

      if (mode === "time") {
        openTime(current);
        return;
      }

      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        onValueChange: (_e, date) => {
          const next = new Date(date);
          next.setHours(current.getHours(), current.getMinutes(), 0, 0);
          openTime(next);
        },
      });
      return;
    }

    setDraft(current);
    setIosOpen(true);
  };

  return (
    <Field label={label} required={required}>
      <Pressable
        onPress={open}
        style={[formStyles.input, styles.trigger, error && formStyles.inputError]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={value ? formStyles.inputText : formStyles.placeholder}>
          {value ? formatValue(value, mode) : mode === "time" ? "--:--" : "dd/mm/aaaa --:--"}
        </Text>
        <Ionicons name={mode === "time" ? "time-outline" : "calendar-outline"} size={18} color={colors.muted} />
      </Pressable>
      {Platform.OS === "ios" && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <DateTimePicker
                value={draft}
                mode={mode}
                display={mode === "time" ? "spinner" : "inline"}
                locale={i18n.language}
                accentColor={colors.blue}
                onValueChange={(_e, d) => setDraft(d)}
              />
              <View style={styles.actions}>
                <Button title={t("close")} onPress={() => setIosOpen(false)} />
                <Button
                  title="OK"
                  variant="solid"
                  onPress={() => {
                    onChange(draft);
                    setIosOpen(false);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Field>
  );
};

const styles = StyleSheet.create({
  trigger: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backdrop: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: 16 },
  sheet: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
});
