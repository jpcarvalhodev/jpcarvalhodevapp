import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MonthCalendar } from "./MonthCalendar";
import { dateKey, indexRecordsByDay } from "../utils/calendar";
import { colors, radius } from "../theme";

type CalendarRecord = {
  id?: string | number;
  idPessoa?: string;
  idCod?: number | string;
  validado?: number;
  dataInicio?: unknown;
  dataFim?: unknown;
  data?: unknown;
};

type Props<T extends CalendarRecord> = {
  records: T[];
  personMap: Map<string, string>;
  codeMap: Map<number, string>;
  markerColor?: string;
};

export const RecordsCalendar = <T extends CalendarRecord>({ records, personMap, codeMap, markerColor }: Props<T>) => {
  const { t, i18n } = useTranslation("pages");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const dayIndex = useMemo(() => indexRecordsByDay(records, visibleMonth), [records, visibleMonth]);
  const markedDays = useMemo(
    () => new Set([...dayIndex.entries()].filter(([, items]) => items.length > 0).map(([k]) => k)),
    [dayIndex],
  );
  const selectedItems = dayIndex.get(dateKey(selectedDay)) ?? [];

  const validationLabel = (validado?: number) => {
    switch (validado) {
      case 0:
        return t("modals:notAuthorized");
      case 1:
        return t("modals:authorized");
      case 2:
        return t("modals:pending");
      default:
        return "-";
    }
  };

  return (
    <View style={styles.card}>
      <MonthCalendar
        visibleMonth={visibleMonth}
        onChangeMonth={setVisibleMonth}
        onDayPress={setSelectedDay}
        selectedDay={selectedDay}
        markedDays={markedDays}
        markerColor={markerColor}
        showTodayButton
      />
      <View style={styles.dayPanel}>
        <Text style={styles.dayTitle}>
          {new Intl.DateTimeFormat(i18n.language, {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(selectedDay)}
        </Text>
        {selectedItems.length === 0 ? (
          <Text style={styles.empty}>{t("no_activity")}</Text>
        ) : (
          selectedItems.map((a, i) => (
            <View key={String(a.id ?? i)} style={styles.item}>
              <Text style={styles.itemText} numberOfLines={2}>
                {`${personMap.get(a.idPessoa ?? "") || "-"} • ${codeMap.get(Number(a.idCod)) || "-"} • ${validationLabel(a.validado)}`}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  dayPanel: { borderTopWidth: 1, borderTopColor: colors.rowBorder, padding: 12, gap: 8 },
  dayTitle: { fontWeight: "800", color: colors.navy, textTransform: "capitalize" },
  empty: { color: colors.muted, paddingVertical: 6 },
  item: { borderWidth: 1, borderColor: colors.rowBorder, borderRadius: radius.md, padding: 10 },
  itemText: { fontWeight: "700", color: colors.navy },
});
