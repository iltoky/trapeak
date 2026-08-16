import type { AppLocale, MeasurementSystem } from "./config";

export function formatDate(
  value: string | Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatDistance(
  meters: number | null,
  locale: AppLocale,
  measurementSystem: MeasurementSystem = "metric",
): string | null {
  if (meters === null) return null;
  if (measurementSystem === "imperial") {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(meters / 1609.344)} mi`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(meters / 1000)} km`;
}

export function formatWeight(
  kilograms: number,
  locale: AppLocale,
  measurementSystem: MeasurementSystem = "metric",
): string {
  if (measurementSystem === "imperial") {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kilograms * 2.2046226218)} lb`;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kilograms)} kg`;
}
