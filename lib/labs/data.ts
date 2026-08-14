import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { getDatabase } from "../db/client";
import { toUtcDayStart, toUtcNextDayStart } from "../mcp/dates";
import type { LabReportInput, LabResultFlag, LabTestType } from "./model";

export type LabReportSummary = Readonly<{
  id: string; collectedAt: string; testType: LabTestType; title: string;
  laboratory: string | null; notes: string | null; resultCount: number;
}>;
export type LabResult = Readonly<{
  id: string; analyteName: string; valueText: string; valueNumeric: number | null;
  unit: string | null; referenceRange: string | null; referenceMin: number | null;
  referenceMax: number | null; flag: LabResultFlag;
}>;
export type LabReport = LabReportSummary & Readonly<{ results: readonly LabResult[] }>;
export type LabResultHistoryPoint = LabResult & Readonly<{
  reportId: string; collectedAt: string; testType: LabTestType; reportTitle: string;
}>;

type LabReportRow = Readonly<{
  id: string; collected_at: string | Date; test_type: LabTestType; title: string;
  laboratory: string | null; notes: string | null; result_count: number | string;
}>;
type LabResultRow = Readonly<{
  id: string; analyte_name: string; value_text: string; value_numeric: number | string | null;
  unit: string | null; reference_range: string | null; reference_min: number | string | null;
  reference_max: number | string | null; flag: LabResultFlag;
}>;
type LabHistoryRow = LabResultRow & Readonly<{
  report_id: string; collected_at: string | Date; test_type: LabTestType; report_title: string;
}>;

function nullableNumber(value: number | string | null) {
  return value === null ? null : Number(value);
}
function toSummary(row: LabReportRow): LabReportSummary {
  return { id: row.id, collectedAt: new Date(row.collected_at).toISOString(),
    testType: row.test_type, title: row.title, laboratory: row.laboratory,
    notes: row.notes, resultCount: Number(row.result_count) };
}
function toResult(row: LabResultRow): LabResult {
  return { id: row.id, analyteName: row.analyte_name, valueText: row.value_text,
    valueNumeric: nullableNumber(row.value_numeric), unit: row.unit,
    referenceRange: row.reference_range, referenceMin: nullableNumber(row.reference_min),
    referenceMax: nullableNumber(row.reference_max), flag: row.flag };
}
function createIdempotencyKey(input: LabReportInput) {
  const results = [...input.results].sort((a, b) =>
    `${a.analyteName}\0${a.valueText}`.localeCompare(`${b.analyteName}\0${b.valueText}`));
  return createHash("sha256").update(JSON.stringify({
    collectedAt: input.collectedAt.toISOString(), testType: input.testType,
    title: input.title, laboratory: input.laboratory, notes: input.notes, results,
  })).digest("hex");
}

export async function createLabReport(userId: string, input: LabReportInput): Promise<Readonly<{
  id: string; created: boolean; resultCount: number;
}>> {
  const sql = getDatabase();
  const reportId = randomUUID();
  const idempotencyKey = createIdempotencyKey(input);
  const resultPayload = JSON.stringify(input.results.map((result) => ({
    id: randomUUID(), analyte_name: result.analyteName, value_text: result.valueText,
    value_numeric: result.valueNumeric, unit: result.unit,
    reference_range: result.referenceRange, reference_min: result.referenceMin,
    reference_max: result.referenceMax, flag: result.flag,
  })));
  const inserted = await sql`
    WITH inserted_report AS (
      INSERT INTO lab_reports (
        id, user_id, collected_at, test_type, title, laboratory, notes, source, idempotency_key
      ) VALUES (
        ${reportId}, ${userId}, ${input.collectedAt.toISOString()}, ${input.testType},
        ${input.title}, ${input.laboratory}, ${input.notes}, 'ai', ${idempotencyKey}
      )
      ON CONFLICT (user_id, idempotency_key) DO NOTHING
      RETURNING id
    ), inserted_results AS (
      INSERT INTO lab_results (
        id, report_id, analyte_name, value_text, value_numeric, unit,
        reference_range, reference_min, reference_max, flag
      )
      SELECT item.id::uuid, inserted_report.id, item.analyte_name, item.value_text,
             item.value_numeric, item.unit, item.reference_range, item.reference_min,
             item.reference_max, item.flag
        FROM inserted_report
        CROSS JOIN jsonb_to_recordset(${resultPayload}::jsonb) AS item(
          id text, analyte_name text, value_text text, value_numeric double precision,
          unit text, reference_range text, reference_min double precision,
          reference_max double precision, flag text
        )
      RETURNING id
    )
    SELECT id, (SELECT COUNT(*) FROM inserted_results)::int AS result_count
      FROM inserted_report
  ` as Array<{ id: string; result_count: number | string }>;
  if (inserted[0]) return { id: inserted[0].id, created: true, resultCount: Number(inserted[0].result_count) };
  const existing = await sql`
    SELECT id, (SELECT COUNT(*) FROM lab_results WHERE report_id = lab_reports.id)::int AS result_count
      FROM lab_reports
     WHERE user_id = ${userId} AND idempotency_key = ${idempotencyKey}
     LIMIT 1
  ` as Array<{ id: string; result_count: number | string }>;
  if (!existing[0]) throw new Error("Lab report was not created");
  return { id: existing[0].id, created: false, resultCount: Number(existing[0].result_count) };
}

export async function deleteLabReport(userId: string, id: string): Promise<boolean> {
  const sql = getDatabase();
  const deleted = await sql`
    DELETE FROM lab_reports
     WHERE user_id = ${userId}
       AND id = ${id}
    RETURNING id
  ` as Array<{ id: string }>;
  return deleted.length > 0;
}

export async function listLabReports(input: Readonly<{
  userId: string; from?: string; to?: string; testType?: LabTestType; limit: number;
}>): Promise<readonly LabReportSummary[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  const testType = input.testType ?? null;
  const rows = await sql`
    SELECT report.id, report.collected_at, report.test_type, report.title,
           report.laboratory, report.notes, COUNT(result.id)::int AS result_count
      FROM lab_reports report LEFT JOIN lab_results result ON result.report_id = report.id
     WHERE report.user_id = ${input.userId}
       AND (${from}::timestamptz IS NULL OR report.collected_at >= ${from}::timestamptz)
       AND (${toExclusive}::timestamptz IS NULL OR report.collected_at < ${toExclusive}::timestamptz)
       AND (${testType}::text IS NULL OR report.test_type = ${testType})
     GROUP BY report.id ORDER BY report.collected_at DESC LIMIT ${input.limit}
  ` as LabReportRow[];
  return rows.map(toSummary);
}

export async function getLabReport(userId: string, id: string): Promise<LabReport | null> {
  const sql = getDatabase();
  const reports = await sql`
    SELECT report.id, report.collected_at, report.test_type, report.title,
           report.laboratory, report.notes,
           (SELECT COUNT(*) FROM lab_results WHERE report_id = report.id)::int AS result_count
      FROM lab_reports report
     WHERE report.user_id = ${userId} AND report.id = ${id} LIMIT 1
  ` as LabReportRow[];
  if (!reports[0]) return null;
  const rows = await sql`
    SELECT id, analyte_name, value_text, value_numeric, unit,
           reference_range, reference_min, reference_max, flag
      FROM lab_results WHERE report_id = ${id} ORDER BY analyte_name ASC
  ` as LabResultRow[];
  return { ...toSummary(reports[0]), results: rows.map(toResult) };
}

export async function getLabResultHistory(input: Readonly<{
  userId: string; analyteName: string; from?: string; to?: string; limit: number;
}>): Promise<readonly LabResultHistoryPoint[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  const rows = await sql`
    SELECT result.id, result.analyte_name, result.value_text, result.value_numeric,
           result.unit, result.reference_range, result.reference_min,
           result.reference_max, result.flag, report.id AS report_id,
           report.collected_at, report.test_type, report.title AS report_title
      FROM lab_results result INNER JOIN lab_reports report ON report.id = result.report_id
     WHERE report.user_id = ${input.userId}
       AND LOWER(result.analyte_name) = LOWER(${input.analyteName})
       AND (${from}::timestamptz IS NULL OR report.collected_at >= ${from}::timestamptz)
       AND (${toExclusive}::timestamptz IS NULL OR report.collected_at < ${toExclusive}::timestamptz)
     ORDER BY report.collected_at ASC LIMIT ${input.limit}
  ` as LabHistoryRow[];
  return rows.map((row) => ({ ...toResult(row), reportId: row.report_id,
    collectedAt: new Date(row.collected_at).toISOString(), testType: row.test_type,
    reportTitle: row.report_title }));
}
