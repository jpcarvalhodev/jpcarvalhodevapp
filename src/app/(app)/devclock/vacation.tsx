import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useAddAttendanceVacationMutation,
  useAttendanceCodesQuery,
  useAttendanceVacationQuery,
} from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { useAttendanceFilters } from "../../../store/dataStore";
import { useAuthUser } from "../../../store/authStore";
import { getSessionValue } from "../../../hooks/useSession";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard } from "../../../components/Cards";
import { RecordsCalendar } from "../../../components/RecordsCalendar";
import {
  CreateModalAttendanceVacationModal,
  type VacationModalData,
} from "../../../modals/CreateModalAttendanceVacation";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import { colors } from "../../../theme";

function DevclockVacation() {
  const { t } = useTranslation("pages");
  const { startDate, endDate, employees } = useAttendanceFilters();
  const { permissions, flags } = useAuthUser();
  const canAddVacation = flags.isSuperAdmin || permissions.includes("Nclock.Vacations.Create");
  const [dataForVacation, setDataForVacation] = useState<VacationModalData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    data: vacations = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendanceVacationQuery(startDate, endDate, employees, "1", "10");
  const { data: attendanceCodes = EMPTY_ARRAY } = useAttendanceCodesQuery();
  const { data: activeEmployees = EMPTY_ARRAY } = useActiveDisabledEmployeesQuery();
  const addVacationMutation = useAddAttendanceVacationMutation();

  const personMap = useMemo(
    () => new Map<string, string>(activeEmployees.map((c: any) => [c.employeeID, c.name])),
    [activeEmployees],
  );
  const codeMap = useMemo(
    () => new Map<number, string>(attendanceCodes.map((c: any) => [Number(c.id), c.descricao])),
    [attendanceCodes],
  );

  const handleAddVacation = () => {
    const employeeId = getSessionValue("employeeId") ?? "";
    const emp: any = activeEmployees.find((e: any) => e.id === employeeId || e.employeeID === employeeId);
    setDataForVacation({ idPessoa: employeeId, enrollNumbers: employees, empData: emp?.feriasResumo ?? {} });
    setShowAddModal(true);
  };

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <ActionCard icon="umbrella-outline" label={t("add_vacation")} onPress={handleAddVacation} disabled={!canAddVacation} />
      <RecordsCalendar records={vacations} personMap={personMap} codeMap={codeMap} markerColor={colors.blue} />
      <CreateModalAttendanceVacationModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setDataForVacation(null);
        }}
        onSave={(payload) => void addVacationMutation.mutateAsync(payload)}
        title={t("add_vacation")}
        data={dataForVacation}
        devpatrol={false}
        attendanceCodes={attendanceCodes}
      />
    </ScreenLayout>
  );
}

export default function DevclockVacationScreen() {
  return (
    <RequirePermissions permissions={["Nclock.View", "Nclock.Vacations.View"]}>
      <DevclockVacation />
    </RequirePermissions>
  );
}
