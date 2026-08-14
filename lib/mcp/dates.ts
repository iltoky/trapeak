const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toUtcDayStart(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error("Date must use YYYY-MM-DD");
  }

  return `${value}T00:00:00.000Z`;
}

export function toUtcNextDayStart(value: string | undefined): string | null {
  const start = toUtcDayStart(value);
  if (!start) {
    return null;
  }

  const date = new Date(start);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}

export function getIsoUtcOffsetMinutes(value: string | undefined): number {
  if (!value || value.endsWith("Z")) {
    return 0;
  }
  const match = value.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}
