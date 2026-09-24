import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./authStore";
import { storage } from "../utils/storage";

export type GeoLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
};

type AttendanceFilterState = {
  startDate: string;
  endDate: string;
  employees?: string[];
};

type DataState = {
  geoLocation: GeoLocation | null;
} & AttendanceFilterState;

const EMPLOYEES_STORAGE_KEY = "enrollNumber";

const toLocalISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDateToStartOfDay = (date: Date): string => `${toLocalISODate(date)}T00:00`;

export const formatDateToEndOfDay = (date: Date): string => `${toLocalISODate(date)}T23:59`;

const getDefaultDateRange = () => {
  const currentDate = new Date();
  const pastDate = new Date();
  pastDate.setDate(currentDate.getDate() - 30);
  return {
    startDate: formatDateToStartOfDay(pastDate),
    endDate: formatDateToEndOfDay(currentDate),
  };
};

const getEmployeesFromStorage = (): string[] | undefined => {
  try {
    const raw = storage.getItem(EMPLOYEES_STORAGE_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "number" || typeof parsed === "string") return [String(parsed)];
    return undefined;
  } catch {
    const raw = storage.getItem(EMPLOYEES_STORAGE_KEY);
    return raw ? [raw] : undefined;
  }
};

const setEmployeesInStorage = (employees?: string[]) => {
  if (!employees || employees.length === 0) {
    storage.removeItem(EMPLOYEES_STORAGE_KEY);
    return;
  }
  storage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees.map(String)));
};

type DataActions = {
  setGeoLocation: (geo: GeoLocation | null) => void;
  clearGeoLocation: () => void;
  setEmployees: (employees?: string[]) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  resetDateRange: () => void;
};

export type DataStore = DataState & DataActions;

export const useDataStore = create<DataStore>((set) => {
  const defaults = getDefaultDateRange();

  return {
    geoLocation: null,
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    employees: getEmployeesFromStorage(),
    setGeoLocation: (geo) => set({ geoLocation: geo }),
    clearGeoLocation: () => set({ geoLocation: null }),
    setEmployees: (employees) => {
      setEmployeesInStorage(employees);
      set({ employees });
    },
    setDateRange: (startDate, endDate) => set({ startDate, endDate }),
    resetDateRange: () => set(getDefaultDateRange()),
  };
});

export const useGeoLocation = () => useDataStore((s) => s.geoLocation);
export const useGeoActions = () =>
  useDataStore(
    useShallow((s) => ({
      setGeoLocation: s.setGeoLocation,
      clearGeoLocation: s.clearGeoLocation,
    })),
  );

export const useAttendanceFilters = () => {
  const role = useAuthStore((s) => s.role);
  return useDataStore(
    useShallow((s) => ({
      startDate: s.startDate,
      endDate: s.endDate,
      employees: role === "Admin" ? undefined : s.employees,
    })),
  );
};
