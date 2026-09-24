import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { buildMonthGrid, dateKey, isSameDay, startOfDay } from "../utils/calendar";
import { colors, radius } from "../theme";

export type DateRange = { start: Date; end: Date };

type Props = {
  visibleMonth: Date;
  onChangeMonth: (month: Date) => void;
  onDayPress: (day: Date) => void;
  selectedDay?: Date;
  range?: DateRange;
  markedDays?: Set<string>;
  markerColor?: string;
  showTodayButton?: boolean;
};

export const MonthCalendar = ({
  visibleMonth,
  onChangeMonth,
  onDayPress,
  selectedDay,
  range,
  markedDays,
  markerColor = colors.red,
  showTodayButton,
}: Props) => {
  const { t, i18n } = useTranslation("pages");
  const grid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const today = new Date();

  const headerLabel = useMemo(() => {
    const month = new Intl.DateTimeFormat(i18n.language, { month: "long" }).format(visibleMonth);
    return `${month} ${visibleMonth.getFullYear()}`;
  }, [visibleMonth, i18n.language]);

  const weekDayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(i18n.language, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  }, [i18n.language]);

  const rangeStart = range ? startOfDay(range.start).getTime() : 0;
  const rangeEnd = range ? startOfDay(range.end).getTime() : 0;

  const shiftMonth = (delta: number) =>
    onChangeMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1));

  return (
    <View>
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={() => shiftMonth(-1)} accessibilityLabel="Mês anterior" hitSlop={4}>
          <Ionicons name="chevron-back" size={18} color={colors.dark} />
        </Pressable>
        <Text style={styles.title} accessibilityLiveRegion="polite">
          {headerLabel}
        </Text>
        <Pressable style={styles.navBtn} onPress={() => shiftMonth(1)} accessibilityLabel="Próximo mês" hitSlop={4}>
          <Ionicons name="chevron-forward" size={18} color={colors.dark} />
        </Pressable>
        {showTodayButton ? (
          <Pressable
            style={styles.todayBtn}
            onPress={() => {
              onChangeMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              onDayPress(today);
            }}
          >
            <Text style={styles.todayText}>{t("today")}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.row}>
        {weekDayLabels.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {grid.map((d) => {
          const k = dateKey(d);
          const inMonth = d.getMonth() === visibleMonth.getMonth();
          const time = startOfDay(d).getTime();
          const inRange = !!range && time >= rangeStart && time <= rangeEnd;
          const isEdge = !!range && (time === rangeStart || time === rangeEnd);
          const isSelected = !!selectedDay && isSameDay(d, selectedDay);

          return (
            <View key={k} style={styles.cellWrap}>
              <Pressable
                onPress={() => onDayPress(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected || isEdge }}
                style={[
                  styles.cell,
                  !inMonth && styles.outMonth,
                  isSameDay(d, today) && styles.today,
                  isSelected && styles.selected,
                  inRange && styles.inRange,
                  isEdge && styles.rangeEdge,
                ]}
              >
                <Text style={[styles.dayNum, isEdge && styles.dayNumEdge]}>{d.getDate()}</Text>
                {markedDays?.has(k) ? <View style={[styles.dot, { backgroundColor: markerColor }]} /> : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rowBorder,
  },
  title: { flex: 1, textAlign: "center", fontWeight: "700", color: colors.navy, textTransform: "capitalize" },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.rowBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.rowBorder,
    justifyContent: "center",
  },
  todayText: { fontWeight: "700", color: colors.dark },
  row: { flexDirection: "row", paddingHorizontal: 9, paddingTop: 10, paddingBottom: 6 },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "capitalize",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 9, paddingBottom: 12 },
  cellWrap: { width: `${100 / 7}%`, padding: 3 },
  cell: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.rowBorder,
    backgroundColor: colors.white,
    padding: 6,
    justifyContent: "space-between",
  },
  outMonth: { opacity: 0.45 },
  today: { borderColor: colors.blue },
  selected: { borderColor: colors.dark, borderWidth: 2 },
  inRange: { backgroundColor: "#dbe7f7" },
  rangeEdge: { backgroundColor: colors.blue, borderColor: colors.blue },
  dayNum: { fontWeight: "800", color: colors.navy, fontSize: 14 },
  dayNumEdge: { color: colors.white },
  dot: { width: 9, height: 9, borderRadius: 5 },
});
