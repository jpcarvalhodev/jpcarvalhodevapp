import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { MonthCalendar, type DateRange } from "./MonthCalendar";
import { startOfDay } from "../utils/calendar";
import { colors } from "../theme";

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export const DateRangeSelector = ({ value, onChange }: Props) => {
  const { t } = useTranslation("mobile");
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.end.getFullYear(), value.end.getMonth(), 1),
  );
  const [awaitingEnd, setAwaitingEnd] = useState(false);

  const handleDayPress = (day: Date) => {
    const d = startOfDay(day);
    if (!awaitingEnd) {
      onChange({ start: d, end: d });
      setAwaitingEnd(true);
      return;
    }
    onChange(d < value.start ? { start: d, end: value.start } : { start: value.start, end: d });
    setAwaitingEnd(false);
  };

  return (
    <>
      <MonthCalendar
        visibleMonth={visibleMonth}
        onChangeMonth={setVisibleMonth}
        onDayPress={handleDayPress}
        range={value}
      />
      <Text style={styles.hint}>{t("date_range_hint")}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  hint: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: -4 },
});
