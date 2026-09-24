import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAttendanceAccessQuery } from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { useAttendanceFilters } from "../../../store/dataStore";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { Block, EmptyRow, Row3 } from "../../../components/Cards";
import { formatDate } from "../../../utils/dateUtils";
import { toImageUri, truncate } from "../../../utils/text";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import { colors, radius, shadow } from "../../../theme";

const defaultAvatar = require("../../../assets/img/navbar/modalAvatar.png");

function DevaccessPanel() {
  const { t } = useTranslation("pages");
  const { t: tf } = useTranslation("fields");
  const { width, height } = useWindowDimensions();
  const descriptionLimit = width > height ? 30 : 20;
  const { startDate, endDate, employees } = useAttendanceFilters();

  const {
    data: access = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendanceAccessQuery(
    undefined,
    employees,
    undefined,
    undefined,
    undefined,
    startDate,
    endDate,
    "3",
    "1",
    "10",
  );
  const { data: activeEmployees = EMPTY_ARRAY } =
    useActiveDisabledEmployeesQuery();

  const last = access[0] ?? null;
  const previous = access.slice(1);
  const photo = last
    ? toImageUri(
        activeEmployees.find(
          (e: any) => String(e.enrollNumber) === String(last.pin),
        )?.photo,
      )
    : null;

  const fields: [string, string | undefined][] = last
    ? [
        ["accesses.eventDate", formatDate(last.eventDate?.slice(0, 10))],
        ["accesses.eventTime", last.eventTime],
        ["accesses.pin", String(last.pin ?? "")],
        ["accesses.cardNo", String(last.cardNo ?? "")],
        ["accesses.deviceName", truncate(last.deviceName, descriptionLimit)],
        [
          "accesses.eventDoorName",
          truncate(last.eventDoorName, descriptionLimit),
        ],
        ["accesses.readerName", truncate(last.readerName, descriptionLimit)],
        ["accesses.eventName", truncate(last.eventName, descriptionLimit)],
      ]
    : [];

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <View style={[styles.lastCard, shadow]}>
        <Image
          source={photo ? { uri: photo } : defaultAvatar}
          style={styles.avatar}
        />
        {last ? (
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {truncate(last.nameUser, descriptionLimit)}
            </Text>
            {fields.map(([key, value]) => (
              <Text key={key} style={styles.field} numberOfLines={1}>
                <Text style={styles.label}>{tf(key)}: </Text>
                {value}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>{t("no_activity")}</Text>
        )}
      </View>
      <Block title={t("recent_accesses")}>
        {previous.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          previous.map((a, i) => (
            <Row3
              key={a.id || String(i)}
              cols={[
                formatDate(a.eventDate?.slice(0, 10)),
                a.eventTime,
                truncate(a.nameUser, descriptionLimit),
              ]}
            />
          ))
        )}
      </Block>
    </ScreenLayout>
  );
}

export default function DevaccessPanelScreen() {
  return (
    <RequirePermissions
      permissions={["Naccess.View", "Naccess.Transactions.View"]}
    >
      <DevaccessPanel />
    </RequirePermissions>
  );
}

const styles = StyleSheet.create({
  lastCard: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    marginBottom: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
    alignItems: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
  },
  info: { flex: 1, gap: 2 },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  field: { fontSize: 13, color: colors.white },
  label: { fontWeight: "700" },
  empty: { flex: 1, color: colors.white },
});
