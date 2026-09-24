import { useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useAttendanceAccessQuery } from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { formatDateToEndOfDay, formatDateToStartOfDay } from "../../../store/dataStore";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { Block, EmptyRow, Row3 } from "../../../components/Cards";
import { truncate } from "../../../utils/text";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import type { Accesses } from "../../../types/Types";
import { colors, radius, shadow } from "../../../theme";

const VALID_EVENTS = new Set(["Abertura efetuada", "Movimento manual"]);

function DevaccessPresence() {
  const { t } = useTranslation("pages");
  const { width, height } = useWindowDimensions();
  const descriptionLimit = width > height ? 18 : 9;
  const today = useMemo(() => new Date(), []);

  const { data: employees = EMPTY_ARRAY } = useActiveDisabledEmployeesQuery();
  const {
    data: access = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendanceAccessQuery(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    formatDateToStartOfDay(today),
    formatDateToEndOfDay(today),
    "3",
  );

  const presence = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const timestamp = (a: Accesses) => new Date(`${a.eventDate}T${a.eventTime}`).getTime();

    const latestByPin = new Map<string, Accesses>();
    for (const acc of access) {
      if (acc.eventDate?.slice(0, 10) !== todayStr || !VALID_EVENTS.has(acc.eventName)) continue;
      const pin = String(acc.pin);
      const existing = latestByPin.get(pin);
      if (!existing || timestamp(acc) > timestamp(existing)) latestByPin.set(pin, acc);
    }

    const present = Array.from(latestByPin.values()).map((a) => ({
      key: `p-${a.pin}`,
      name: a.nameUser,
      time: a.eventTime,
      isPresent: true,
    }));

    const absent = employees
      .filter((emp: any) => emp.status && !latestByPin.has(String(emp.enrollNumber).trim()))
      .map((emp: any) => ({ key: `a-${emp.employeeID}`, name: emp.name as string, time: "", isPresent: false }));

    return [...present, ...absent].filter((i) => i.name !== "Sem Nome");
  }, [access, employees]);

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
            <Row3 key={p.key} cols={[p.isPresent ? t("present") : t("absent"), truncate(p.name, descriptionLimit), p.time]} />
          ))
        )}
      </Block>
    </ScreenLayout>
  );
}

export default function DevaccessPresenceScreen() {
  return (
    <RequirePermissions permissions={["Naccess.View", "Naccess.Presence.View"]}>
      <DevaccessPresence />
    </RequirePermissions>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: 12, marginBottom: 14 },
  miniCard: { flex: 1, borderRadius: radius.lg, padding: 16, alignItems: "center" },
  miniValue: { fontSize: 28, fontWeight: "900", color: colors.white },
  miniLabel: { fontSize: 14, fontWeight: "700", color: colors.white, marginTop: 4 },
});
