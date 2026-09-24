import * as apiService from "../api/apiService";
import type { ExternalEntity, Register } from "../types/Types";
import { toRowsData, useStoreMutation, useStoreQuery } from "./queryHooks";

export const personsKeys = {
  all: ["persons"] as const,
  disabledEmployees: (pageNo?: string, pageSize?: string, type?: string) =>
    [
      "persons",
      "disabledEmployees",
      pageNo ?? "",
      pageSize ?? "",
      type ?? "",
    ] as const,
  registeredUsers: (hasEmployee?: boolean) =>
    ["persons", "registeredUsers", { hasEmployee }] as const,
  externalEntities: ["persons", "externalEntities"] as const,
};

const toDisabledEmployeesRows = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return toRowsData(payload);

  const record = payload as Record<string, unknown>;
  const active = Array.isArray(record.activeEmployees)
    ? record.activeEmployees
    : [];
  const inactive = Array.isArray(record.inactiveEmployees)
    ? record.inactiveEmployees
    : [];
  const merged = [...active, ...inactive];

  return merged.length > 0 ? merged : toRowsData(payload);
};

const toActiveDisabledEmployeesRows = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return toRowsData(payload);

  const record = payload as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, "activeEmployees")) {
    return Array.isArray(record.activeEmployees) ? record.activeEmployees : [];
  }

  return toRowsData(payload);
};

export const useDisabledEmployeesQuery = (
  pageNo?: string,
  pageSize?: string,
  type?: string,
  enabled = true,
) =>
  useStoreQuery({
    queryKey: personsKeys.disabledEmployees(pageNo, pageSize, type),
    queryFn: () => apiService.fetchAllEmployees(pageNo, pageSize, type),
    select: (response) => toDisabledEmployeesRows(response),
    enabled,
  });

export const useActiveDisabledEmployeesQuery = (
  pageNo?: string,
  pageSize?: string,
  type?: string,
  enabled = true,
) =>
  useStoreQuery({
    queryKey: personsKeys.disabledEmployees(pageNo, pageSize, type),
    queryFn: () => apiService.fetchAllEmployees(pageNo, pageSize, type),
    select: (response) => toActiveDisabledEmployeesRows(response),
    enabled,
  });

export const useRegisteredUsersQuery = (hasEmployee?: boolean) =>
  useStoreQuery({
    queryKey: personsKeys.registeredUsers(hasEmployee),
    queryFn: () => apiService.fetchAllRegisteredUsers(hasEmployee),
    select: (response) =>
      Array.isArray((response as { data?: unknown[] } | undefined)?.data)
        ? ((response as { data: Register[] }).data ?? [])
        : [],
  });

export const useExternalEntitiesQuery = () =>
  useStoreQuery({
    queryKey: personsKeys.externalEntities,
    queryFn: apiService.fetchAllExternalEntities,
    select: (response) =>
      Array.isArray(response) ? (response as ExternalEntity[]) : [],
  });

const usePersonsMutation = <
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

export const useAddEmployeeMutation = () =>
  usePersonsMutation({
    mutationFn: apiService.addEmployee,
    defaultInvalidateKeys: [personsKeys.disabledEmployees()],
    successMessageKey: "stores:employee_added",
  });

export const useUpdateRegisteredUserMutation = () =>
  usePersonsMutation({
    mutationFn: apiService.updateRegisteredUser,
    defaultInvalidateKeys: [personsKeys.all],
    successMessageKey: "stores:registered_user_updated",
  });
