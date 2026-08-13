import { createHash, timingSafeEqual } from "node:crypto";

import type { ProviderActivity } from "../provider";
import { normalizeWahooWorkout } from "./adapter.ts";

export class WahooWebhookAuthenticationError extends Error {
  constructor() {
    super("Invalid Wahoo webhook token");
    this.name = "WahooWebhookAuthenticationError";
  }
}

export class WahooWebhookPayloadError extends Error {
  constructor(message = "Invalid Wahoo webhook payload") {
    super(message);
    this.name = "WahooWebhookPayloadError";
  }
}

export type WahooWorkoutSummaryWebhook = Readonly<{
  providerUserId: string;
  activity: ProviderActivity;
}>;

function requireObject(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new WahooWebhookPayloadError();
  }

  return value as Readonly<Record<string, unknown>>;
}

function tokensMatch(actual: unknown, expected: string): boolean {
  if (typeof actual !== "string" || actual.length === 0) {
    return false;
  }

  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

export function parseWahooWebhook(
  value: unknown,
  expectedToken: string,
): WahooWorkoutSummaryWebhook | null {
  const payload = requireObject(value);
  if (!tokensMatch(payload.webhook_token, expectedToken)) {
    throw new WahooWebhookAuthenticationError();
  }

  if (payload.event_type !== "workout_summary") {
    return null;
  }

  const user = requireObject(payload.user);
  const summary = requireObject(payload.workout_summary);
  const workout = requireObject(summary.workout);
  const providerUserId = String(user.id ?? "");
  if (!providerUserId) {
    throw new WahooWebhookPayloadError("Missing Wahoo webhook user id");
  }

  const activity = normalizeWahooWorkout({
    ...workout,
    workout_summary: summary,
  });
  if (!activity) {
    throw new WahooWebhookPayloadError("Missing Wahoo workout summary");
  }

  return { providerUserId, activity };
}
