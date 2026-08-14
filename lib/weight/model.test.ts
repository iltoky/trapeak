import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateWeightStatus,
  getWeightReminderIntervalDays,
  parseWeightEntryInput,
  type WeightEntry,
} from "./model.ts";

function entry(measuredAt: string, weightKilograms: number): WeightEntry {
  return {
    id: crypto.randomUUID(),
    measuredAt,
    weightKilograms,
    notes: null,
    source: "ai",
  };
}

test("parses an exact dated weight measurement", () => {
  const input = parseWeightEntryInput({
    measuredAt: "2026-08-14T06:00:00.000+02:00",
    weightKilograms: 90.4,
    notes: "Morning measurement",
  });

  assert.equal(input.measuredAt.toISOString(), "2026-08-14T04:00:00.000Z");
  assert.equal(input.weightKilograms, 90.4);
  assert.equal(input.source, "ai");
});

test("calculates 7, 30, and 90 day changes from available baselines", () => {
  const status = calculateWeightStatus({
    asOf: new Date("2026-08-15T08:00:00.000Z"),
    entries: [
      entry("2026-08-14T08:00:00.000Z", 88),
      entry("2026-08-07T08:00:00.000Z", 89),
      entry("2026-07-15T08:00:00.000Z", 91),
      entry("2026-05-15T08:00:00.000Z", 94),
    ],
    goals: [{ type: "weight_loss" }],
  });

  assert.equal(status.latest?.weightKilograms, 88);
  assert.deepEqual(status.changesKilograms, { days7: -1, days30: -3, days90: -6 });
  assert.equal(status.reminderIntervalDays, 14);
  assert.equal(status.weightUpdateDue, false);
});

test("uses a 14 day default for weight loss and 30 days otherwise", () => {
  assert.equal(getWeightReminderIntervalDays({ goals: [{ type: "weight_loss" }] }), 14);
  assert.equal(getWeightReminderIntervalDays({ goals: [{ type: "health" }] }), 30);
  assert.equal(getWeightReminderIntervalDays({
    goals: [{ type: "weight_loss" }],
    configuredIntervalDays: 21,
  }), 21);
});

test("marks an overdue or missing measurement as due", () => {
  const overdue = calculateWeightStatus({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    entries: [entry("2026-07-01T08:00:00.000Z", 90)],
    goals: [{ type: "health" }],
  });
  const missing = calculateWeightStatus({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    entries: [],
  });

  assert.equal(overdue.daysSinceLastMeasurement, 44);
  assert.equal(overdue.weightUpdateDue, true);
  assert.equal(missing.weightUpdateDue, true);
  assert.equal(missing.latest, null);
});
