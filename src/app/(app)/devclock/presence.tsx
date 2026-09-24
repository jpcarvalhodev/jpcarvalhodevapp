import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useAttendancesQuery } from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { formatDateToEndOfDay, formatDateToStartOfDay } from "../../../store/dataStore";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { Block, EmptyRow, Row3 } from "../../../components/Cards";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import { colors, radius, shadow } from "../../../theme";

const truncate = (text?: string | null, limit = 0) => {
  if (!text) return "";
  if (limit <= 0) return text;
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const toDate = (v: any): Date | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v;
  const d = new Date(typeof v === "object" && v.time ? v.time : v);
  return isNaN(d.getTime()) ? undefined : d;
};

function DevclockPresence() {
  const { t } = useTranslation("pages");
  const { width, height } = useWindowDimensions();
  const descriptionLimit = width > height ? 18 : 9;
  const today = useMemo(() => new Date(), []);

  const { data: employees = EMPTY_ARRAY } = useActiveDisabledEmployeesQuery();
  const {
    data: attendance = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendancesQuery<any[]>(
    undefined,
    undefined,
    undefined,
    undefined,
    formatDateToStartOfDay(today),
    formatDateToEndOfDay(today),
    false,
    { select: (res: any) => res?.nclockData?.data ?? [] },
  );

  const presence = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const punchesByEmp = new Map<string, Date[]>();
    for (const rec of attendance) {
      const d = toDate(rec.attendanceTime ?? rec.time ?? rec.attendanceDate);
      if (!d || d < start || d >= end) continue;
      const key = String(rec.employeeId ?? rec.employeeID ?? rec.employee?.employeeID ?? "");
      if (!key) continue;
      const list = punchesByEmp.get(key) ?? [];
      list.push(d);
      punchesByEmp.set(key, list);
    }

    return employees
      .filter((emp: any) => emp.status === true)
      .map((emp: any) => {
        const punches = (punchesByEmp.get(String(emp.employeeID)) ?? []).sort((a, b) => a.getTime() - b.getTime());
        const isPresent = punches.length % 2 !== 0;
        const last = isPresent ? punches[punches.length - 1] : undefined;
        return {
          id: String(emp.employeeID),
          name: emp.name as string,
          isPresent,
          hour: last ? `${pad2(last.getHours())}:${pad2(last.getMinutes())}` : "",
        };
      });
  }, [attendance, employees]);

  const presentCount = presence.filter((p) => p.isPresent).length;
  const absentCount = presence.length - presentCount;

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <View style={styles.summary}>
        <View style={[styles.miniCard, shadow, { backgroundColor: colors.green }]}>
          <Text style={styles.miniValue}>{presentCount}</Text>
          <Text style={styles.miniLabel}>{t("present")}</Text>
        </View>
        <View style={[styles.miniCard, shadow, { backgroundColor: colors.red }]}>
          <Text style={styles.miniValue}>{absentCount}</Text>
          <Text style={styles.miniLabel}>{t("absent")}</Text>
        </View>
      </View>
      <Block title={t("recent_presence")}>
        {presence.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          presence.map((p) => (
            <Row3
              key={p.id}
              cols={[p.isPresent ? t("present") : t("absent"), truncate(p.name, descriptionLimit), p.hour]}
            />
          ))
        )}
      </Block>
    </ScreenLayout>
  );
}

export default function DevclockPresenceScreen() {
  return (
    <RequirePermissions permissions={["Nclock.View", "Nclock.Presence.View"]}>
      <DevclockPresence />
    </RequirePermissions>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: 12, marginBottom: 14 },
  miniCard: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: "center" },
  miniValue: { fontSize: 28, fontWeight: "900", color: colors.white },
  miniLabel: { fontSize: 14, fontWeight: "700", color: colors.white, marginTop: 4 },
});
