import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useAddAttendanceAbsenceMutation,
  useAttendanceAbsencesQuery,
  useAttendanceCodesQuery,
} from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { useAuthUser } from "../../../store/authStore";
import { getSessionValue } from "../../../hooks/useSession";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard } from "../../../components/Cards";
import { RecordsCalendar } from "../../../components/RecordsCalendar";
import { CreateModalAttendanceAbsenceModal } from "../../../modals/CreateModalAttendanceAbsence";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import type { AttendanceAbsences } from "../../../types/Types";
import { colors } from "../../../theme";

function DevclockAbsences() {
  const { t } = useTranslation("pages");
  const { permissions, flags } = useAuthUser();
  const canAddAbsence = flags.isSuperAdmin || permissions.includes("Nclock.Absences.Create");
  const [dataForAbsence, setDataForAbsence] = useState<Partial<AttendanceAbsences> | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: absences = EMPTY_ARRAY, refetch, isRefetching } = useAttendanceAbsencesQuery();
  const { data: attendanceCodes = EMPTY_ARRAY } = useAttendanceCodesQuery();
  const { data: employees = EMPTY_ARRAY } = useActiveDisabledEmployeesQuery();
  const addAbsenceMutation = useAddAttendanceAbsenceMutation();

  const personMap = useMemo(() => new Map<string, string>(employees.map((c: any) => [c.employeeID, c.name])), [employees]);
  const codeMap = useMemo(
    () => new Map<number, string>(attendanceCodes.map((c: any) => [Number(c.id), c.descricao])),
    [attendanceCodes],
  );

  const handleAddAbsence = () => {
    const employeeId = getSessionValue("employeeId") ?? "";
    const emp: any = employees.find((e: any) => e.employeeID === employeeId);
    setDataForAbsence({ idPessoa: employeeId, idDep: emp?.departmentId ?? "", idg: emp?.groupId ?? "" } as Partial<AttendanceAbsences>);
    setShowAddModal(true);
  };

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <ActionCard icon="medkit-outline" label={t("add_absence")} onPress={handleAddAbsence} disabled={!canAddAbsence} />
      <RecordsCalendar records={absences} personMap={personMap} codeMap={codeMap} markerColor={colors.red} />
      <CreateModalAttendanceAbsenceModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setDataForAbsence(null);
        }}
        onSave={(payload) => addAbsenceMutation.mutate(payload)}
        title={t("add_absence")}
        data={dataForAbsence}
        devpatrol={false}
        attendanceCodes={attendanceCodes}
      />
    </ScreenLayout>
  );
}

export default function DevclockAbsencesScreen() {
  return (
    <RequirePermissions permissions={["Nclock.View", "Nclock.Absences.View"]}>
      <DevclockAbsences />
    </RequirePermissions>
  );
}
