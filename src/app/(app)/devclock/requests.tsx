import { useState } from "react";
import { useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useAddAttendanceMutation, useAttendancesQuery } from "../../../query/attendanceQuery";
import { useAttendanceFilters } from "../../../store/dataStore";
import { useAuthUser } from "../../../store/authStore";
import { getSessionValue } from "../../../hooks/useSession";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard, Block, EmptyRow, Row3 } from "../../../components/Cards";
import { CreateModalAttendanceRequests } from "../../../modals/CreateModalAttendanceRequests";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import type { EmployeeAttendanceTimes } from "../../../types/Types";

const truncate = (text?: string | null, limit = 0) => {
  if (!text) return "";
  if (limit <= 0) return text;
  return text.length > limit ? `${text.substring(0, limit)}...` : text;
};

function DevclockRequests() {
  const { t } = useTranslation("pages");
  const { width, height } = useWindowDimensions();
  const { startDate, endDate, employees } = useAttendanceFilters();
  const { permissions, flags } = useAuthUser();
  const canAddRequest = flags.isSuperAdmin || permissions.includes("Nclock.Requests.Create");
  const [dataRequest, setDataRequest] = useState<Partial<EmployeeAttendanceTimes>>({});
  const [openModal, setOpenModal] = useState(false);
  const descriptionLimit = width > height ? 20 : 11;

  const {
    data: attendanceRequests = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendancesQuery<EmployeeAttendanceTimes[]>(3, "1", "10", employees, startDate, endDate, false, {
    select: (res: any) => res?.nclockPedidos?.data ?? [],
  });
  const addAttendanceMutation = useAddAttendanceMutation();

  const handleAddRequest = () => {
    setDataRequest({
      employeeId: getSessionValue("employeeId") ?? undefined,
      enrollNumber: employees?.[0] ?? null,
      attendanceTime: new Date().toISOString(),
      inOutMode: 202,
      onlyWithBuild: false,
    } as unknown as Partial<EmployeeAttendanceTimes>);
    setOpenModal(true);
  };

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <ActionCard icon="swap-horizontal-outline" label={t("request_point")} onPress={handleAddRequest} disabled={!canAddRequest} />
      <Block title={t("recent_requests")}>
        {attendanceRequests.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          attendanceRequests.map((a) => (
            <Row3 key={a.attendanceTimeId} cols={[a.attendanceDate, a.attendanceHour, truncate(a.observation, descriptionLimit)]} />
          ))
        )}
      </Block>
      <CreateModalAttendanceRequests<EmployeeAttendanceTimes>
        title={t("addAttendanceRequest")}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={(payload) => void addAttendanceMutation.mutateAsync(payload)}
        data={dataRequest}
      />
    </ScreenLayout>
  );
}

export default function DevclockRequestsScreen() {
  return (
    <RequirePermissions permissions={["Nclock.View", "Nclock.Requests.View"]}>
      <DevclockRequests />
    </RequirePermissions>
  );
}
