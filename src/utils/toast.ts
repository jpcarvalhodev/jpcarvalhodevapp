import { create } from "zustand";

export type ToastType = "success" | "error" | "warn" | "info";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  autoClose: number | false;
};

type ToastOptions = {
  toastId?: string;
  autoClose?: number | false;
};

type ToastState = {
  toasts: ToastItem[];
  dismiss: (id?: string) => void;
};

const DEFAULT_AUTO_CLOSE = 3000;
const MAX_VISIBLE = 3;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  dismiss: (id) => {
    if (id == null) {
      timers.forEach(clearTimeout);
      timers.clear();
      set({ toasts: [] });
      return;
    }
    const timer = timers.get(id);
    if (timer) clearTimeout(timer);
    timers.delete(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

const show = (type: ToastType, message: unknown, opts: ToastOptions = {}) => {
  const text = typeof message === "string" ? message : String(message ?? "");
  if (!text.trim()) return;

  const id = opts.toastId ?? `toast-${++seq}`;
  const autoClose = opts.autoClose ?? DEFAULT_AUTO_CLOSE;
  const { dismiss } = useToastStore.getState();

  const existing = timers.get(id);
  if (existing) clearTimeout(existing);

  useToastStore.setState((s) => {
    const others = s.toasts.filter((t) => t.id !== id);
    return {
      toasts: [...others, { id, type, message: text, autoClose }].slice(-MAX_VISIBLE),
    };
  });

  if (autoClose !== false) {
    timers.set(id, setTimeout(() => dismiss(id), autoClose));
  }
};

export const toast = {
  success: (m: unknown, o?: ToastOptions) => show("success", m, o),
  error: (m: unknown, o?: ToastOptions) => show("error", m, o),
  warn: (m: unknown, o?: ToastOptions) => show("warn", m, o),
  info: (m: unknown, o?: ToastOptions) => show("info", m, o),
  dismiss: (id?: string) => useToastStore.getState().dismiss(id),
};
