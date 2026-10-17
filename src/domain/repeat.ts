import { parseIsoDate } from "./date";
import { WEEKDAYS, type Repeat, type Weekday } from "./medicine";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export function weekdayOf(iso: string): Weekday {
  return WEEKDAYS[(parseIsoDate(iso).getDay() + 6) % 7];
}

export function appliesOn(repeat: Repeat, iso: string): boolean {
  return repeat.kind === "daily" || repeat.days.includes(weekdayOf(iso));
}

export function describeRepeat(repeat: Repeat): string {
  return repeat.kind === "daily"
    ? "Every day"
    : repeat.days.map((day) => WEEKDAY_LABELS[day]).join(" · ");
}
