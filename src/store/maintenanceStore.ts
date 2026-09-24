import { create } from "zustand";

const THRESHOLD = 3;
const WINDOW_MS = 15_000;

type MaintenanceState = {
  failures: number[];
  isMaintenance: boolean;
};

type MaintenanceActions = {
  recordFailure: () => void;
  recordSuccess: () => void;
};

export const useMaintenanceStore = create<MaintenanceState & MaintenanceActions>((set, get) => ({
  failures: [],
  isMaintenance: false,

  recordFailure: () => {
    const now = Date.now();
    const recent = get().failures.filter((t) => now - t < WINDOW_MS);
    const next = [...recent, now];
    set({ failures: next, isMaintenance: next.length >= THRESHOLD });
  },

  recordSuccess: () => {
    if (!get().isMaintenance && get().failures.length === 0) return;
    set({ failures: [], isMaintenance: false });
  },
}));
