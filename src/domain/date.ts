const pad = (value: number) => String(value).padStart(2, "0");

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDate(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function slotMoment(iso: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = parseIsoDate(iso);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const longDateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortWeekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });

export function formatLongDate(iso: string): string {
  return longDateFormat.format(parseIsoDate(iso));
}

export function formatShortWeekday(iso: string): string {
  return shortWeekdayFormat.format(parseIsoDate(iso));
}

export function dayOfMonth(iso: string): number {
  return parseIsoDate(iso).getDate();
}

export type DayLabel = "Today" | "Yesterday" | "Tomorrow" | "Past Record" | "Future Schedule";

export function dayLabel(selected: string, today: string): DayLabel {
  if (selected === today) {
    return "Today";
  }
  if (selected === shiftDate(today, -1)) {
    return "Yesterday";
  }
  if (selected === shiftDate(today, 1)) {
    return "Tomorrow";
  }
  return selected < today ? "Past Record" : "Future Schedule";
}
