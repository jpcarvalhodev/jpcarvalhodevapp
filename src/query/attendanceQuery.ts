import * as apiService from "../api/apiService";
import type {
  Accesses,
  AttendanceAbsences,
  AttendanceCodes,
  AttendanceVacation,
  EmployeeAttendanceTimes,
  EmployeeVisitor,
  EmployeeVisitorMotive,
} from "../types/Types";
import { toRowsData, useStoreMutation, useStoreQuery } from "./queryHooks";

export const attendanceKeys = {
  all: ["attendance"] as const,
  attendances: (params: {
    type?: number;
    pageNo?: string;
    pageSize?: string;
    enrollNumbers?: string[];
    startDate?: string;
    endDate?: string;
    onlyWithBuild?: boolean;
  }) => ["attendance", "attendances", params] as const,
  absences: (attendanceAbsence?: Partial<AttendanceAbsences>) =>
    ["attendance", "absences", attendanceAbsence ?? {}] as const,
  vacations: (params: {
    startDate?: string;
    endDate?: string;
    enrollNumbers?: string[];
    pageNo?: string;
    pageSize?: string;
  }) => ["attendance", "vacations", params] as const,
  codes: (params: { tipo?: string; pageNo?: string; pageSize?: string }) =>
    ["attendance", "codes", params] as const,
  access: (params: {
    deviceSNList?: string[];
    enrollNumbers?: string[];
    doorIds?: string[];
    readerIds?: string[];
    modules?: number[],
    startDate?: string;
    endDate?: string;
    tipo?: string;
    pageNo?: string;
    pageSize?: string;
    exportPdf?: boolean;
  }) => ["attendance", "access", params] as const,
  employeeVisitors: (params: {
    startDate?: string;
    endDate?: string;
    pageNo?: string;
    pageSize?: string;
    employeeIds?: string[];
  }) => ["attendance", "employeeVisitors", params] as const,
  employeeVisitorMotive: ["attendance", "employeeVisitorMotive"] as const,
};

export const useAttendancesQuery = <TData = unknown>(
  type?: number,
  pageNo?: string,
  pageSize?: string,
  enrollNumbers?: string[],
  startDate?: string,
  endDate?: string,
  onlyWithBuild?: boolean,
  options?: { select?: (data: unknown) => TData },
) =>
  useStoreQuery({
    queryKey: attendanceKeys.attendances({
      type,
      pageNo,
      pageSize,
      enrollNumbers,
      startDate,
      endDate,
      onlyWithBuild,
    }),
    queryFn: () =>
      apiService.fetchAllAttendances(
        type,
        pageNo,
        pageSize,
        enrollNumbers,
        startDate,
        endDate,
        onlyWithBuild,
      ),
    ...options,
  });

export const useAttendancesWithBuildQuery = (
  type?: number,
  pageNo?: string,
  pageSize?: string,
  enrollNumbers?: string[],
  startDate?: string,
  endDate?: string,
) =>
  useStoreQuery({
    queryKey: attendanceKeys.attendances({
      pageNo,
      pageSize,
      enrollNumbers,
      startDate,
      endDate,
      onlyWithBuild: true,
    }),
    queryFn: () =>
      apiService.fetchAllAttendances(
        type,
        pageNo,
        pageSize,
        enrollNumbers,
        startDate,
        endDate,
        true,
      ),
    select: (response) => {
      const withBuild = (
        response as { withBuild?: { data?: unknown } } | undefined
      )?.withBuild?.data;
      return toRowsData<EmployeeAttendanceTimes>(withBuild);
    },
  });

export const useAttendanceAbsencesQuery = (
  attendanceAbsence?: Partial<AttendanceAbsences>,
) =>
  useStoreQuery({
    queryKey: attendanceKeys.absences(attendanceAbsence),
    queryFn: () => apiService.fetchAttendanceAbsence(attendanceAbsence),
    select: (response) => toRowsData<AttendanceAbsences>(response),
  });

export const useAttendanceVacationQuery = (
  startDate?: string,
  endDate?: string,
  enrollNumbers?: string[],
  pageNo?: string,
  pageSize?: string,
) =>
  useStoreQuery({
    queryKey: attendanceKeys.vacations({
      startDate,
      endDate,
      enrollNumbers,
      pageNo,
      pageSize,
    }),
    queryFn: () =>
      apiService.fetchAttendanceVacation(
        startDate,
        endDate,
        enrollNumbers,
        pageNo,
        pageSize,
      ),
    select: (response) => toRowsData<AttendanceVacation>(response),
  });

export const useAttendanceCodesQuery = (
  tipo?: string,
  pageNo?: string,
  pageSize?: string,
) =>
  useStoreQuery({
    queryKey: attendanceKeys.codes({ tipo, pageNo, pageSize }),
    queryFn: () => apiService.fetchAttendanceCodes(tipo, pageNo, pageSize),
    select: (response) => toRowsData<AttendanceCodes>(response),
  });

export const useAttendanceAccessQuery = (
  deviceSNList?: string[],
  enrollNumbers?: string[],
  doorIds?: string[],
  readerIds?: string[],
  modules?: number[],
  startDate?: string,
  endDate?: string,
  tipo?: string,
  pageNo?: string,
  pageSize?: string,
  exportPdf?: boolean,
) =>
  useStoreQuery({
    queryKey: attendanceKeys.access({
      deviceSNList,
      enrollNumbers,
      doorIds,
      readerIds,
      modules,
      startDate,
      endDate,
      tipo,
      pageNo,
      pageSize,
      exportPdf,
    }),
    queryFn: () =>
      apiService.fetchAllAccesses(
        deviceSNList,
        enrollNumbers,
        doorIds,
        readerIds,
        modules,
        startDate,
        endDate,
        tipo,
        pageNo,
        pageSize,
        exportPdf,
      ),
    select: (response) => toRowsData<Accesses>(response),
  });

export const useEmployeeVisitorsQuery = (
  startDate?: string,
  endDate?: string,
  pageNo?: string,
  pageSize?: string,
  employeeIds?: string[],
) =>
  useStoreQuery({
    queryKey: attendanceKeys.employeeVisitors({
      startDate,
      endDate,
      pageNo,
      pageSize,
      employeeIds,
    }),
    queryFn: () =>
      apiService.fetchAllEmployeeVisitors(
        startDate,
        endDate,
        pageNo,
        pageSize,
        employeeIds,
      ),
    select: (response) => toRowsData<EmployeeVisitor>(response),
  });

export const useEmployeeVisitorMotiveQuery = () =>
  useStoreQuery({
    queryKey: attendanceKeys.employeeVisitorMotive,
    queryFn: apiService.fetchEmployeeVisitorMotive,
    select: (response) =>
      Array.isArray(response) ? (response as EmployeeVisitorMotive[]) : [],
  });

const useAttendanceMutation = <
  TData,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(
  options: Parameters<
    typeof useStoreMutation<TData, TError, TVariables, TContext>
  >[0],
) =>
  useStoreMutation<TData, TError, TVariables, TContext>({
    ...options,
    showSuccessToast: true,
  });

export const useAddAttendanceMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addAttendance,
    defaultInvalidateKeys: [attendanceKeys.attendances({})],
    successMessageKey: "stores:assiduidade_adicionada",
  });

export const useAddAttendanceAbsenceMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addAttendanceAbsence,
    defaultInvalidateKeys: [attendanceKeys.absences({})],
    successMessageKey: "stores:ausencia_adicionada",
  });

export const useAddAttendanceVacationMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addAttendanceVacation,
    defaultInvalidateKeys: [attendanceKeys.vacations({})],
    successMessageKey: "stores:ferias_adicionada",
  });

export const useAddAccessMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addAccessTransaction,
    defaultInvalidateKeys: [attendanceKeys.access({})],
    successMessageKey: "stores:acesso_adicionado",
  });

export const useAddEmployeeVisitorMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addEmployeeVisitor,
    defaultInvalidateKeys: [attendanceKeys.employeeVisitors({})],
    successMessageKey: "stores:visitante_adicionado",
  });

export const useUpdateEmployeeVisitorMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.updateEmployeeVisitor,
    defaultInvalidateKeys: [attendanceKeys.employeeVisitors({})],
  });

export const useAddEmployeeVisitorMotiveMutation = () =>
  useAttendanceMutation({
    mutationFn: apiService.addEmployeeVisitorMotive,
    defaultInvalidateKeys: [attendanceKeys.employeeVisitorMotive],
    successMessageKey: "stores:motivo_visitante_adicionado",
  });
