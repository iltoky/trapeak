export const labTestTypes = ["blood", "urine", "stool", "saliva", "other"] as const;
export const labResultFlags = ["low", "normal", "high", "abnormal", "unknown"] as const;

export type LabTestType = (typeof labTestTypes)[number];
export type LabResultFlag = (typeof labResultFlags)[number];

export type LabResultInput = Readonly<{
  analyteName: string;
  valueText: string;
  valueNumeric: number | null;
  unit: string | null;
  referenceRange: string | null;
  referenceMin: number | null;
  referenceMax: number | null;
  flag: LabResultFlag;
}>;

export type LabReportInput = Readonly<{
  collectedAt: Date;
  testType: LabTestType;
  title: string;
  laboratory: string | null;
  notes: string | null;
  results: readonly LabResultInput[];
}>;

export class LabValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LabValidationError";
  }
}

function requiredString(value: unknown, field: string, maximum: number) {
  if (typeof value !== "string") throw new LabValidationError(`${field} is required`);
  const text = value.trim();
  if (!text || text.length > maximum) {
    throw new LabValidationError(`${field} must contain 1 to ${maximum} characters`);
  }
  return text;
}

function optionalString(value: unknown, field: string, maximum: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new LabValidationError(`${field} must be text`);
  const text = value.trim();
  if (text.length > maximum) {
    throw new LabValidationError(`${field} must not exceed ${maximum} characters`);
  }
  return text || null;
}

function optionalNumber(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) throw new LabValidationError(`${field} must be a finite number`);
  return number;
}

function parseResult(value: unknown, index: number): LabResultInput {
  if (!value || typeof value !== "object") {
    throw new LabValidationError(`results[${index}] must be an object`);
  }
  const input = value as Readonly<Record<string, unknown>>;
  const flag = input.flag ?? "unknown";
  if (!labResultFlags.includes(flag as LabResultFlag)) {
    throw new LabValidationError(`results[${index}].flag is not supported`);
  }
  const referenceMin = optionalNumber(input.referenceMin, `results[${index}].referenceMin`);
  const referenceMax = optionalNumber(input.referenceMax, `results[${index}].referenceMax`);
  if (referenceMin !== null && referenceMax !== null && referenceMin > referenceMax) {
    throw new LabValidationError(`results[${index}] referenceMin must not exceed referenceMax`);
  }
  return {
    analyteName: requiredString(input.analyteName, `results[${index}].analyteName`, 200),
    valueText: requiredString(input.valueText, `results[${index}].valueText`, 200),
    valueNumeric: optionalNumber(input.valueNumeric, `results[${index}].valueNumeric`),
    unit: optionalString(input.unit, `results[${index}].unit`, 100),
    referenceRange: optionalString(input.referenceRange, `results[${index}].referenceRange`, 200),
    referenceMin,
    referenceMax,
    flag: flag as LabResultFlag,
  };
}

export function parseLabReportInput(value: Readonly<Record<string, unknown>>): LabReportInput {
  const collectedAtText = requiredString(value.collectedAt, "collectedAt", 100);
  const collectedAt = new Date(collectedAtText);
  if (Number.isNaN(collectedAt.getTime())) {
    throw new LabValidationError("collectedAt must be a valid date and time");
  }
  if (!labTestTypes.includes(value.testType as LabTestType)) {
    throw new LabValidationError("testType is not supported");
  }
  if (!Array.isArray(value.results) || value.results.length < 1 || value.results.length > 200) {
    throw new LabValidationError("results must contain 1 to 200 indicators");
  }
  return {
    collectedAt,
    testType: value.testType as LabTestType,
    title: requiredString(value.title, "title", 200),
    laboratory: optionalString(value.laboratory, "laboratory", 200),
    notes: optionalString(value.notes, "notes", 2000),
    results: value.results.map(parseResult),
  };
}
