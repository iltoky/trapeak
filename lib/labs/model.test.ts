import assert from "node:assert/strict";
import test from "node:test";

import { LabValidationError, parseLabReportInput } from "./model.ts";

test("normalizes blood results with numeric ranges", () => {
  const report = parseLabReportInput({
    collectedAt: "2026-08-13T07:30:00+02:00",
    testType: "blood",
    title: "Liver panel",
    laboratory: "Example Lab",
    results: [{
      analyteName: "ALT", valueText: "42", valueNumeric: 42, unit: "U/L",
      referenceRange: "0–41", referenceMin: 0, referenceMax: 41, flag: "high",
    }],
  });
  assert.equal(report.testType, "blood");
  assert.equal(report.collectedAt.toISOString(), "2026-08-13T05:30:00.000Z");
  assert.equal(report.results[0]?.analyteName, "ALT");
  assert.equal(report.results[0]?.valueNumeric, 42);
  assert.equal(report.results[0]?.flag, "high");
});

test("supports qualitative urine results", () => {
  const report = parseLabReportInput({
    collectedAt: "2026-08-13T08:00:00Z", testType: "urine", title: "Urinalysis",
    results: [{ analyteName: "Protein", valueText: "Negative", valueNumeric: null,
      unit: null, referenceRange: "Negative", flag: "normal" }],
  });
  assert.equal(report.results[0]?.valueText, "Negative");
  assert.equal(report.results[0]?.valueNumeric, null);
});

test("rejects invalid lab reports and ranges", () => {
  assert.throws(() => parseLabReportInput({
    collectedAt: "not-a-date", testType: "blood", title: "Panel", results: [{}],
  }), LabValidationError);
  assert.throws(() => parseLabReportInput({
    collectedAt: "2026-08-13T08:00:00Z", testType: "blood", title: "Panel",
    results: [{ analyteName: "ALT", valueText: "42", referenceMin: 50, referenceMax: 40 }],
  }), LabValidationError);
});
