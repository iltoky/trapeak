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
