import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  useAddAttendanceMutation,
  useAttendancesQuery,
} from "../../../query/attendanceQuery";
import { useActiveDisabledEmployeesQuery } from "../../../query/personsQuery";
import { useAttendanceFilters, useDataStore } from "../../../store/dataStore";
import { useAuthUser } from "../../../store/authStore";
import { getEnrollNumber, getSessionValue } from "../../../hooks/useSession";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { RequirePermissions } from "../../../components/RequirePermissions";
import { ActionCard, Block, EmptyRow, Row3 } from "../../../components/Cards";
import { LeafletMap } from "../../../components/LeafletMap";
import { AppModal } from "../../../components/AppModal";
import { Button } from "../../../components/Button";
import { Checkbox } from "../../../components/Form";
import {
  SignaturePad,
  type SignaturePadHandle,
} from "../../../components/SignaturePad";
import { CreateModalSignatureAttendance } from "../../../modals/CreateModalSignatureAttendance";
import {
  formatTime,
  requestGeolocationWithCache,
  toLocalIsoWithOffset,
} from "../../../utils/dashboardUtils";
import { formatDate } from "../../../utils/dateUtils";
import { EMPTY_ARRAY } from "../../../utils/emptyArray";
import { toast } from "../../../utils/toast";
import type { EmployeeAttendanceTimes } from "../../../types/Types";
import { colors, radius, shadow } from "../../../theme";

type Selectable = { id: string; name: string; enrollNumber?: string | number };

const Clock = memo(() => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <View style={[styles.timeCard, shadow]} accessibilityLabel="Hora atual">
      <Text style={styles.timeBig}>{formatTime(now)}</Text>
      <Text style={styles.timeSmall}>{formatDate(now)}</Text>
    </View>
  );
});
Clock.displayName = "Clock";

const formatEmployeeLabel = (name?: string, enroll?: string | number) => {
  if (enroll == null || enroll === "") return name ?? "";
  return name ? `${enroll} - ${name}` : String(enroll);
};

const employeeKey = (emp: any) =>
  String(emp?.employeeID ?? emp?.id ?? emp?.employeeId ?? "");

const normalizeSubordinateId = (entry: any): string | null => {
  if (entry == null) return null;
  if (typeof entry === "string" || typeof entry === "number")
    return String(entry);
  if (typeof entry === "object")
    return entry.employeeId ?? entry.employeeID ?? entry.id ?? null;
  return null;
};

function DevclockDashboard() {
  const { t } = useTranslation("pages");
  const geoLocation = useDataStore((s) => s.geoLocation);
  const { startDate, endDate, employees } = useAttendanceFilters();
  const { permissions, flags } = useAuthUser();
  const canRegisterAttendance =
    flags.isSuperAdmin || permissions.includes("Nclock.AttendanceTimes.Create");

  const [showSubordinatesModal, setShowSubordinatesModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [subordinatesSignatureEnabled, setSubordinatesSignatureEnabled] =
    useState(false);
  const [signing, setSigning] = useState(false);
  const subordinatesSigRef = useRef<SignaturePadHandle>(null);
  const [pendingPayload, setPendingPayload] =
    useState<EmployeeAttendanceTimes | null>(null);
  const [selectableEmployees, setSelectableEmployees] = useState<Selectable[]>(
    [],
  );
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: activeEmployees = EMPTY_ARRAY } =
    useActiveDisabledEmployeesQuery();
  const {
    data: attendance = EMPTY_ARRAY,
    refetch,
    isRefetching,
  } = useAttendancesQuery<EmployeeAttendanceTimes[]>(
    undefined,
    "1",
    "10",
    employees,
    startDate,
    endDate,
    false,
    {
      select: (res: any) => res?.nclockData?.data ?? [],
    },
  );
  const addAttendanceMutation = useAddAttendanceMutation();

  const handleAddAttendance = async (payload: EmployeeAttendanceTimes) => {
    await addAttendanceMutation.mutateAsync(payload);
  };

  useEffect(() => {
    void requestGeolocationWithCache(t("geo_permission_denied"));
  }, [t]);

  const inOutMap = useMemo(
    () =>
      new Map<number, string>([
        [255, t("register")],
        [0, t("in")],
        [1, t("out")],
        [2, t("pauseIn")],
        [3, t("pauseOut")],
        [4, t("overtimeIn")],
        [5, t("overtimeOut")],
      ]),
    [t],
  );

  const buildBasePayload = (
    employeeIds: string[],
    enrollNumber?: string,
  ): EmployeeAttendanceTimes => {
    const geoLat = geoLocation?.latitude;
    const geoLng = geoLocation?.longitude;
    if (geoLat == null || geoLng == null) {
      toast.warn(t("geo_not_available"), { toastId: "geo-not-available" });
    }
    return {
      employeeIds,
      enrollNumber,
      attendanceTime: toLocalIsoWithOffset(),
      verifyMode: 202,
      workCode: 0,
      inOutMode: 255,
      onlyWithBuild: false,
      ...(geoLat != null && { geoLat }),
      ...(geoLng != null && { geoLng }),
    } as unknown as EmployeeAttendanceTimes;
  };

  const openSubordinatesModal = (
    payload: EmployeeAttendanceTimes,
    items: Selectable[],
    preselect: string[],
    signature: boolean,
  ) => {
    setPendingPayload(payload);
    setSelectableEmployees(items);
    setSelectedEmployeeIds(preselect);
    setSearchTerm("");
    setSubordinatesSignatureEnabled(signature);
    setShowSubordinatesModal(true);
  };

  const handleAddMovement = async () => {
    const employeeId = getSessionValue("employeeId") ?? undefined;

    if (!employeeId) {
      const all = activeEmployees.map((emp: any) => ({
        id: employeeKey(emp),
        name: formatEmployeeLabel(emp.name ?? emp.shortName, emp.enrollNumber),
        enrollNumber: emp.enrollNumber,
      }));
      openSubordinatesModal(buildBasePayload([]), all, [], false);
      return;
    }

    const enrollNumberLocal = getEnrollNumber() ?? undefined;
    const payload = buildBasePayload([employeeId], enrollNumberLocal);

    const currentEmployee: any = activeEmployees.find(
      (emp: any) =>
        employeeKey(emp) === String(employeeId) ||
        (enrollNumberLocal != null &&
          String(emp.enrollNumber) === String(enrollNumberLocal)),
    );

    if (!currentEmployee) {
      await handleAddAttendance(payload);
      return;
    }

    const resolveEmployeeName = (id: string, fallback?: string) => {
      const found: any = activeEmployees.find(
        (emp: any) => employeeKey(emp) === id,
      );
      return formatEmployeeLabel(
        found?.name || found?.shortName || fallback || id,
        found?.enrollNumber,
      );
    };

    const rawSubordinates = [
      ...(Array.isArray(currentEmployee.subordinadoIds)
        ? currentEmployee.subordinadoIds
        : []),
      ...(Array.isArray(currentEmployee.subordinados)
        ? currentEmployee.subordinados
        : []),
    ];
    const subordinateIds = [
      ...new Set(
        rawSubordinates.map(normalizeSubordinateId).filter(Boolean).map(String),
      ),
    ].filter((id) => id !== String(employeeId));

    if (subordinateIds.length === 0) {
      if (currentEmployee.signature) {
        setPendingPayload(payload);
        setShowSignatureModal(true);
      } else {
        await handleAddAttendance(payload);
      }
      return;
    }

    const items = new Map<string, Selectable>();
    items.set(String(employeeId), {
      id: String(employeeId),
      name: resolveEmployeeName(
        String(employeeId),
        currentEmployee.name ?? currentEmployee.shortName,
      ),
      enrollNumber: currentEmployee.enrollNumber,
    });
    if (Array.isArray(currentEmployee.subordinados)) {
      currentEmployee.subordinados.forEach((s: any) => {
        const id = normalizeSubordinateId(s);
        if (!id) return;
        const isObj = typeof s === "object";
        items.set(String(id), {
          id: String(id),
          name: isObj
            ? formatEmployeeLabel(
                s?.name ?? s?.shortName,
                s?.enrollNumber ?? s?.enroll,
              )
            : resolveEmployeeName(String(id)),
          enrollNumber: isObj ? (s?.enrollNumber ?? s?.enroll) : undefined,
        });
      });
    }
    subordinateIds.forEach((id) => {
      if (!items.has(id)) {
        const found: any = activeEmployees.find(
          (emp: any) => employeeKey(emp) === id,
        );
        items.set(id, {
          id,
          name: resolveEmployeeName(id),
          enrollNumber: found?.enrollNumber,
        });
      }
    });

    openSubordinatesModal(
      payload,
      Array.from(items.values()),
      Array.from(items.keys()),
      !!currentEmployee.signature,
    );
  };

  const handleCloseSubordinatesModal = useCallback(() => {
    setShowSubordinatesModal(false);
    setPendingPayload(null);
    setSelectableEmployees([]);
    setSelectedEmployeeIds([]);
    setSearchTerm("");
    setSubordinatesSignatureEnabled(false);
  }, []);

  const toggleEmployee = useCallback((id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const filteredSelectable = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return selectableEmployees;
    return selectableEmployees.filter((emp) =>
      [emp.name, emp.id, emp.enrollNumber].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [selectableEmployees, searchTerm]);

  const handleConfirmSubordinates = async () => {
    if (!pendingPayload) {
      handleCloseSubordinatesModal();
      return;
    }

    const signatureBase64 = subordinatesSignatureEnabled
      ? await subordinatesSigRef.current?.read()
      : null;

    await handleAddAttendance({
      ...pendingPayload,
      employeeIds: selectedEmployeeIds,
      inOutMode: 255,
      ...(signatureBase64 ? { signatureBase64 } : {}),
    } as EmployeeAttendanceTimes);
    handleCloseSubordinatesModal();
  };

  const pos = geoLocation
    ? { lat: geoLocation.latitude, lng: geoLocation.longitude }
    : { lat: 0, lng: 0 };

  return (
    <ScreenLayout onRefresh={() => void refetch()} refreshing={isRefetching}>
      <Clock />
      <ActionCard
        icon="time-outline"
        label={t("register_point")}
        onPress={handleAddMovement}
        disabled={!canRegisterAttendance || addAttendanceMutation.isPending}
      />
      <Block title={t("recent_activity")}>
        {attendance.length === 0 ? (
          <EmptyRow text={t("no_activity")} />
        ) : (
          attendance.map((a) => (
            <Row3
              key={a.attendanceTimeId}
              cols={[
                a.attendanceDate,
                a.attendanceHour,
                inOutMap.get(Number(a.inOutMode)) ?? String(a.inOutMode),
              ]}
            />
          ))
        )}
      </Block>
      <Block title={t("location")}>
        <LeafletMap lat={pos.lat} lng={pos.lng} />
      </Block>
      <AppModal
        open={showSubordinatesModal}
        title={t("select_attendance_title")}
        onClose={handleCloseSubordinatesModal}
        scrollEnabled={!signing}
        footer={
          <>
            <Button
              title={t("select_attendance_cancel")}
              onPress={handleCloseSubordinatesModal}
            />
            <Button
              title={t("select_attendance_confirm")}
              onPress={handleConfirmSubordinates}
              loading={addAttendanceMutation.isPending}
              disabled={selectedEmployeeIds.length === 0}
            />
          </>
        }
      >
        {selectableEmployees.length > 0 ? (
          <>
            <Text style={styles.modalText}>
              {t("select_attendance_message")}
            </Text>
            <View style={styles.selectControls}>
              <Button
                title={t("all")}
                onPress={() =>
                  setSelectedEmployeeIds(filteredSelectable.map((e) => e.id))
                }
              />
              <Button
                title={t("remove")}
                onPress={() => setSelectedEmployeeIds([])}
              />
              <TextInput
                style={styles.search}
                placeholderTextColor={colors.muted2}
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoCorrect={false}
              />
            </View>
            <View style={styles.list}>
              {filteredSelectable.length > 0 ? (
                filteredSelectable.map((emp) => (
                  <Checkbox
                    key={emp.id}
                    label={emp.name}
                    checked={selectedEmployeeIds.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                  />
                ))
              ) : (
                <Text style={styles.muted}>{t("select_attendance_empty")}</Text>
              )}
            </View>
          </>
        ) : null}
        {subordinatesSignatureEnabled ? (
          <View style={styles.signature}>
            <Text style={styles.modalText}>
              {t("select_attendance_signature_label")}
            </Text>
            <SignaturePad
              ref={subordinatesSigRef}
              height={150}
              onBegin={() => setSigning(true)}
              onEnd={() => setSigning(false)}
            />
            <Button
              title={t("select_attendance_signature_clear")}
              onPress={() => subordinatesSigRef.current?.clear()}
              style={styles.clearBtn}
            />
          </View>
        ) : null}
      </AppModal>
      <CreateModalSignatureAttendance<EmployeeAttendanceTimes>
        open={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false);
          setPendingPayload(null);
        }}
        onSave={handleAddAttendance}
        entity={pendingPayload}
      />
    </ScreenLayout>
  );
}

export default function DevclockDashboardScreen() {
  return (
    <RequirePermissions
      permissions={["Nclock.View", "Nclock.AttendanceTimes.View"]}
    >
      <DevclockDashboard />
    </RequirePermissions>
  );
}

const styles = StyleSheet.create({
  timeCard: {
    borderRadius: radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.muted,
    marginBottom: 14,
    alignItems: "center",
  },
  timeBig: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.white,
    fontVariant: ["tabular-nums"],
  },
  timeSmall: { marginTop: 6, fontSize: 14, color: colors.white, opacity: 0.95 },
  modalText: { marginBottom: 8, color: colors.muted, fontSize: 15 },
  selectControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  search: {
    flex: 1,
    minWidth: 80,
    height: 44,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    color: colors.muted,
  },
  list: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 8,
  },
  muted: { color: colors.muted },
  signature: { marginTop: 14 },
  clearBtn: { alignSelf: "flex-start", marginTop: 8 },
});
