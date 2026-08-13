import assert from "node:assert/strict";
import test from "node:test";

import {
  parseWahooWebhook,
  WahooWebhookAuthenticationError,
  WahooWebhookPayloadError,
} from "./webhook.ts";

const webhookPayload = {
  event_type: "workout_summary",
  webhook_token: "expected-token",
  user: { id: 60462 },
  workout_summary: {
    id: 8297,
    distance_accum: "24909.71",
    duration_total_accum: "275.20",
    duration_active_accum: "179.00",
    duration_paused_accum: "85.00",
    heart_rate_avg: "124.23",
    cadence_avg: "52.00",
    calories_accum: "1500.00",
    speed_avg: "10.75",
    created_at: "2026-08-13T08:05:00.000Z",
    updated_at: "2026-08-13T08:06:00.000Z",
    manual: false,
    edited: true,
    workout: {
      id: 56519,
      starts: "2026-08-13T08:00:00.000Z",
      minutes: 5,
      name: "Webhook Run",
      created_at: "2026-08-13T08:00:00.000Z",
      updated_at: "2026-08-13T08:06:00.000Z",
      workout_type_id: 1,
    },
  },
};

test("authenticates and normalizes a Wahoo workout summary webhook", () => {
  const event = parseWahooWebhook(webhookPayload, "expected-token");

  assert.equal(event?.providerUserId, "60462");
  assert.equal(event?.activity.providerActivityId, "56519");
  assert.equal(event?.activity.activityTypeName, "Running");
  assert.equal(event?.activity.distanceMeters, 24909.71);
  assert.equal(event?.activity.averageHeartRateBpm, 124.23);
  assert.equal(event?.activity.isEdited, true);
  assert.equal("webhook_token" in (event?.activity.rawData ?? {}), false);
});

test("rejects a Wahoo webhook with the wrong token", () => {
  assert.throws(
    () => parseWahooWebhook(webhookPayload, "different-token"),
    WahooWebhookAuthenticationError,
  );
});

test("acknowledges authenticated unsupported Wahoo webhook events", () => {
  assert.equal(parseWahooWebhook({
    event_type: "future_event",
    webhook_token: "expected-token",
  }, "expected-token"), null);
});

test("rejects malformed workout summary webhooks", () => {
  assert.throws(
    () => parseWahooWebhook({
      event_type: "workout_summary",
      webhook_token: "expected-token",
      user: { id: 60462 },
      workout_summary: {},
    }, "expected-token"),
    WahooWebhookPayloadError,
  );
});
