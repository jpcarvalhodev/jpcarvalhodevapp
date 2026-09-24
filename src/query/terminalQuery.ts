import * as apiService from "../api/apiService";
import type { AccessControl, Devices, Doors, ManualOpenDoor, PatrolDevices } from "../types/Types";
import { toRowsData, useStoreMutation, useStoreQuery } from "./queryHooks";

export const terminalKeys = {
  all: ["terminal"] as const,
  terminals: ["terminal", "terminals"] as const,
  doors: ["terminal", "doors"] as const,
  manualOpenDoor: (params: {
    startDate?: string;
    endDate?: string;
    tipo?: string;
    deviceIds?: string[];
    pageNo?: string;
    pageSize?: string;
  }) => ["terminal", "manualOpenDoor", params] as const,
  patrolTerminals: ["terminal", "patrolTerminals"] as const,
  accessPlans: ["terminal", "accessPlans"] as const,
};

export const useTerminalsQuery = () =>
  useStoreQuery({
    queryKey: terminalKeys.terminals,
    queryFn: apiService.fetchAllDevices,
    select: (response) => (Array.isArray(response) ? (response as Devices[]) : []),
  });

export const useDoorsQuery = () =>
  useStoreQuery({
    queryKey: terminalKeys.doors,
    queryFn: apiService.fetchAllDoors,
    select: (response) => (Array.isArray(response) ? (response as Doors[]) : []),
  });

export const useManualOpenDoorQuery = (
  startDate?: string,
  endDate?: string,
  tipo?: string,
  deviceIds?: string[],
  pageNo?: string,
  pageSize?: string,
) =>
  useStoreQuery({
    queryKey: terminalKeys.manualOpenDoor({ startDate, endDate, tipo, deviceIds, pageNo, pageSize }),
    queryFn: () => apiService.fetchAllManualDoorOpen(startDate, endDate, tipo, deviceIds, pageNo, pageSize),
    select: (response) => toRowsData<ManualOpenDoor>(response),
  });

export const usePatrolTerminalsQuery = () =>
  useStoreQuery({
    queryKey: terminalKeys.patrolTerminals,
    queryFn: apiService.fetchAllPatrolDevice,
    select: (response) => (Array.isArray(response) ? (response as PatrolDevices[]) : []),
  });

export const useAccessPlansQuery = () =>
  useStoreQuery({
    queryKey: terminalKeys.accessPlans,
    queryFn: apiService.fetchAllAccessControl,
    select: (response) => (Array.isArray(response) ? (response as AccessControl[]) : []),
  });

export const useAddManualOpenDoorMutation = () =>
  useStoreMutation({
    mutationFn: apiService.addManualOpenDoor,
    defaultInvalidateKeys: [terminalKeys.manualOpenDoor({})],
    showSuccessToast: false,
  });
