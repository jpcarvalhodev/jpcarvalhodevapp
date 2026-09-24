const pad2 = (n: number) => String(n).padStart(2, "0");

export const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const parseApiDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
};

type RangedRecord = { dataInicio?: unknown; dataFim?: unknown; data?: unknown };

export const getRecordRange = (a: RangedRecord): { start: Date; end: Date } | null => {
  const start = parseApiDate(a.dataInicio) ?? parseApiDate(a.data);
  const end = parseApiDate(a.dataFim) ?? parseApiDate(a.data);
  if (!start || !end) return null;
  return start.getTime() <= end.getTime() ? { start, end } : { start: end, end: start };
};

export const buildMonthGrid = (visibleMonth: Date): Date[] => {
  const first = startOfMonth(visibleMonth);
  const mondayIndex = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - mondayIndex);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

export const intersectsMonth = (a: RangedRecord, visibleMonth: Date) => {
  const r = getRecordRange(a);
  if (!r) return false;
  return (
    r.start.getTime() <= endOfMonth(visibleMonth).getTime() &&
    r.end.getTime() >= startOfMonth(visibleMonth).getTime()
  );
};

export const coversDay = (a: RangedRecord, day: Date) => {
  const r = getRecordRange(a);
  if (!r) return false;
  const d0 = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const d1 = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return r.start.getTime() <= d1.getTime() && r.end.getTime() >= d0.getTime();
};

export const indexRecordsByDay = <T extends RangedRecord>(records: T[], visibleMonth: Date) => {
  const grid = buildMonthGrid(visibleMonth);
  const map = new Map<string, T[]>();
  for (const d of grid) map.set(dateKey(d), []);
  for (const a of records) {
    if (!intersectsMonth(a, visibleMonth)) continue;
    for (const d of grid) {
      if (coversDay(a, d)) map.get(dateKey(d))?.push(a);
    }
  }
  return map;
};
