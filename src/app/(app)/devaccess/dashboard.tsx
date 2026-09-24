import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useAddAccessMutation, useAttendanceAccessQuery } from "../../../query/attendanceQuery";
import { useDoorsQuery, useTerminalsQuery } from "../../../query/terminalQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { useAttendanceFilters } from "../../../store/dataStore";
import { useAuthUser } from "../../../store/authStore";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard, Block, EmptyRow, Row3 } from "../../../components/Cards";
import { CreateModalAccess } from "../../../modals/CreateModalAccess";
import { formatDate } from "../../../utils/dateUtils";
import { truncate } from "../../../utils/text";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";

function DevaccessDashboard() {
  const { t } = useTranslation("pages");
  const { width, height } = useWindowDimensions();
  const descriptionLimit = width > height ? 20 : 11;
  const { startDate, endDate, employees } = useAttendanceFilters();
  const { permissions, flags } = useAuthUser();
  const canCreateAccess = flags.isSuperAdmin || permissions.includes("Naccess.Transactions.Create");
  const [openModal, setOpenModal] = useState(false);

  const {
    data: access = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendanceAccessQuery(undefined, employees, undefined, undefined, undefined, startDate, endDate, "3", "1", "10");
  const { data: terminals = EMPTY_ARRAY } = useTerminalsQuery();
  const { data: doors = EMPTY_ARRAY } = useDoorsQuery();
  const { data: activeEmployees = EMPTY_ARRAY } = useActiveDisabledEmployeesQuery();
  const addAccessMutation = useAddAccessMutation();

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <ActionCard icon="exit-outline" label={t("add_access")} onPress={() => setOpenModal(true)} disabled={!canCreateAccess} />
      <Block title={t("recent_accesses")}>
        {access.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          access.map((a, i) => (
            <Row3
              key={a.id || String(i)}
              cols={[formatDate(a.eventDate?.slice(0, 10)), a.eventTime, truncate(a.eventName, descriptionLimit)]}
            />
          ))
        )}
      </Block>
      <CreateModalAccess
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(payload) => void addAccessMutation.mutateAsync(payload)}
        title={t("add_access")}
        employees={employees}
        terminals={terminals}
        doors={doors}
        disabledEmployees={activeEmployees}
      />
    </ScreenLayout>
  );
}

export default function DevaccessDashboardScreen() {
  return (
    <RequirePermissions permissions={["Naccess.View", "Naccess.Transactions.View"]}>
      <DevaccessDashboard />
    </RequirePermissions>
  );
}
