import { format } from "date-fns";
import { colors } from "../theme";

const pad = (n: number) => String(n).padStart(2, "0");

export const hhmmToDate = (value?: string): Date | null => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export const dateToHHmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const isHHmm = (s: string) => /^\d{2}:\d{2}$/.test(s);

export const dayStartIso = (d: Date) => `${format(d, "yyyy-MM-dd")}T00:00:00`;
export const dayEndIso = (d: Date) => `${format(d, "yyyy-MM-dd")}T23:59:59`;

export const validationOptions = (t: (k: string) => string) => [
  { value: 0, label: t("notAuthorized"), color: colors.red },
  { value: 1, label: t("authorized"), color: colors.green },
  { value: 2, label: t("pending"), color: colors.amber },
];
