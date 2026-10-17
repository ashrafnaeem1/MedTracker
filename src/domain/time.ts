const TIME_PATTERN = /(\d{2}):(\d{2})/;

const displayFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatTime(time: string): string {
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    return time;
  }
  return displayFormat.format(new Date(2000, 0, 1, Number(match[1]), Number(match[2])));
}

export function toClockTime(datetimeValue: string): string | null {
  const match = TIME_PATTERN.exec(datetimeValue);
  return match ? `${match[1]}:${match[2]}` : null;
}

const instantFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatInstant(iso: string): string {
  return instantFormat.format(new Date(iso));
}
