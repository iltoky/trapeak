import assert from "node:assert/strict";
import test from "node:test";

import {
  getIsoUtcOffsetMinutes,
  toUtcDayStart,
  toUtcNextDayStart,
} from "./dates.ts";

test("date filters use inclusive UTC days", () => {
  assert.equal(toUtcDayStart("2026-08-13"), "2026-08-13T00:00:00.000Z");
  assert.equal(
    toUtcNextDayStart("2026-08-13"),
    "2026-08-14T00:00:00.000Z",
  );
});

test("empty date filters remain unset", () => {
  assert.equal(toUtcDayStart(undefined), null);
  assert.equal(toUtcNextDayStart(undefined), null);
});

test("invalid date filters are rejected", () => {
  assert.throws(() => toUtcDayStart("13-08-2026"));
});

test("reads positive and negative offsets from ISO timestamps", () => {
  assert.equal(getIsoUtcOffsetMinutes("2026-08-14T10:00:00+02:00"), 120);
  assert.equal(getIsoUtcOffsetMinutes("2026-08-14T10:00:00-05:30"), -330);
  assert.equal(getIsoUtcOffsetMinutes("2026-08-14T08:00:00Z"), 0);
});
