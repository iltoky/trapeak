import { z } from "zod";

export const profileStoredFieldKeys = [
  "birthDate",
  "biologicalSex",
  "heightCentimeters",
  "timeZone",
  "goals",
  "trainingExperience",
  "preferredActivities",
  "trainingPreferences",
  "injuries",
  "healthConditions",
  "contraindications",
  "medications",
  "dietaryRestrictions",
  "nutritionNotes",
  "sleepSchedule",
  "dailyActivityLevel",
  "workPattern",
  "stressLevel",
  "caffeineUse",
  "alcoholUse",
  "weeklyAvailability",
  "equipment",
  "weightReminderIntervalDays",
] as const;

export const profileFieldKeys = [
  ...profileStoredFieldKeys.filter((field) => field !== "weightReminderIntervalDays"),
  "weightHistory",
] as const;

export type ProfileStoredFieldKey = (typeof profileStoredFieldKeys)[number];
export type ProfileFieldKey = (typeof profileFieldKeys)[number];

export const profileSectionKeys = [
  "basics",
  "trainingAndGoals",
  "healthAndMedications",
  "nutrition",
  "sleepAndLifestyle",
  "scheduleAndEquipment",
] as const;

export type ProfileSectionKey = (typeof profileSectionKeys)[number];

export const profileFieldStatusValues = [
  "not_applicable",
  "prefer_not_to_answer",
] as const;

export type ProfileFieldStatus = (typeof profileFieldStatusValues)[number];

export const biologicalSexValues = [
  "female",
  "male",
  "other",
  "prefer_not_to_say",
] as const;

export const trainingExperienceValues = [
  "beginner",
  "returning",
  "intermediate",
  "advanced",
] as const;

export const dailyActivityLevelValues = [
  "sedentary",
  "light",
  "moderate",
  "high",
] as const;

export const stressLevelValues = ["low", "moderate", "high", "variable"] as const;
export const dayOfWeekValues = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export const timeOfDayValues = ["morning", "daytime", "evening", "flexible"] as const;

const optionalText = (maximum: number) => z.string().trim().min(1).max(maximum).nullable();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const birthDateSchema = dateSchema.refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value
    && calculateAgeYears(value) >= 13
    && calculateAgeYears(value) <= 120;
}, { message: "birthDate must be a valid date for an age between 13 and 120" });

export const profileGoalSchema = z.object({
  type: z.enum([
    "weight_loss",
    "general_fitness",
    "running_distance",
    "cycling",
    "performance",
    "health",
    "consistency",
    "rehabilitation",
    "other",
  ]),
  description: z.string().trim().min(1).max(500),
  priority: z.enum(["primary", "secondary"]).default("primary"),
  targetDate: dateSchema.nullable().optional(),
});

export const profileInjurySchema = z.object({
  name: z.string().trim().min(1).max(200),
  status: z.enum(["active", "recovering", "resolved"]),
  details: optionalText(1000).optional(),
});

export const profileMedicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: optionalText(100).optional(),
  frequency: optionalText(200).optional(),
  timing: optionalText(200).optional(),
  purpose: optionalText(500).optional(),
  startDate: dateSchema.nullable().optional(),
  endDate: dateSchema.nullable().optional(),
  notes: optionalText(1000).optional(),
}).refine(
  ({ startDate, endDate }) => !startDate || !endDate || startDate <= endDate,
  { message: "medication endDate must not be before startDate" },
);

export const sleepScheduleSchema = z.object({
  usualBedtime: timeSchema.nullable(),
  usualWakeTime: timeSchema.nullable(),
  averageHours: z.number().min(0).max(24).nullable(),
  quality: z.enum(["poor", "fair", "good", "variable"]).nullable(),
});

export const weeklyAvailabilitySchema = z.object({
  day: z.enum(dayOfWeekValues),
  preferredTime: z.enum(timeOfDayValues).nullable(),
  maxDurationMinutes: z.number().int().min(5).max(1440).nullable(),
});

const nullableStringList = z.array(z.string().trim().min(1).max(200)).max(50).nullable();

const profileShape = {
  birthDate: birthDateSchema.nullable(),
  biologicalSex: z.enum(biologicalSexValues).nullable(),
  heightCentimeters: z.number().min(80).max(260).nullable(),
  timeZone: optionalText(100),
  goals: z.array(profileGoalSchema).max(10).nullable(),
  trainingExperience: z.enum(trainingExperienceValues).nullable(),
  preferredActivities: nullableStringList,
  trainingPreferences: nullableStringList,
  injuries: z.array(profileInjurySchema).max(30).nullable(),
  healthConditions: nullableStringList,
  contraindications: nullableStringList,
  medications: z.array(profileMedicationSchema).max(50).nullable(),
  dietaryRestrictions: nullableStringList,
  nutritionNotes: optionalText(2000),
  sleepSchedule: sleepScheduleSchema.nullable(),
  dailyActivityLevel: z.enum(dailyActivityLevelValues).nullable(),
  workPattern: optionalText(1000),
  stressLevel: z.enum(stressLevelValues).nullable(),
  caffeineUse: optionalText(500),
  alcoholUse: optionalText(500),
  weeklyAvailability: z.array(weeklyAvailabilitySchema).max(14).nullable(),
  equipment: nullableStringList,
  weightReminderIntervalDays: z.number().int().min(7).max(90).nullable(),
};

export const userProfileSchema = z.object(profileShape);
export const userProfilePatchSchema = z.object(profileShape).partial();
export const profileFieldStatusUpdateSchema = z.object({
  field: z.enum(profileFieldKeys),
  status: z.enum(profileFieldStatusValues),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserProfilePatch = z.infer<typeof userProfilePatchSchema>;
export type ProfileGoal = z.infer<typeof profileGoalSchema>;
export type ProfileInjury = z.infer<typeof profileInjurySchema>;
export type ProfileMedication = z.infer<typeof profileMedicationSchema>;
export type ProfileFieldStatusUpdate = z.infer<typeof profileFieldStatusUpdateSchema>;

export type UserProfileRecord = Readonly<{
  profile: UserProfile;
  fieldStatuses: Readonly<Partial<Record<ProfileFieldKey, ProfileFieldStatus>>>;
  createdAt: string;
  updatedAt: string;
}>;

export type ProfileSectionCompleteness = Readonly<{
  key: ProfileSectionKey;
  title: string;
  percent: number;
  completedWeight: number;
  totalWeight: number;
  missingFields: readonly ProfileFieldKey[];
}>;

export type ProfileCompleteness = Readonly<{
  percent: number;
  completedWeight: number;
  totalWeight: 100;
  stage: "initial" | "progressive" | "complete";
  sections: readonly ProfileSectionCompleteness[];
  suggestedNextSections: readonly Pick<ProfileSectionCompleteness, "key" | "title" | "percent" | "missingFields">[];
}>;

export const emptyUserProfile: UserProfile = {
  birthDate: null,
  biologicalSex: null,
  heightCentimeters: null,
  timeZone: null,
  goals: null,
  trainingExperience: null,
  preferredActivities: null,
  trainingPreferences: null,
  injuries: null,
  healthConditions: null,
  contraindications: null,
  medications: null,
  dietaryRestrictions: null,
  nutritionNotes: null,
  sleepSchedule: null,
  dailyActivityLevel: null,
  workPattern: null,
  stressLevel: null,
  caffeineUse: null,
  alcoholUse: null,
  weeklyAvailability: null,
  equipment: null,
  weightReminderIntervalDays: null,
};

const sections: readonly Readonly<{
  key: ProfileSectionKey;
  title: string;
  fields: readonly Readonly<{ key: ProfileFieldKey; weight: number }>[];
}>[] = [
  {
    key: "basics",
    title: "Основные данные",
    fields: [
      { key: "birthDate", weight: 3 },
      { key: "biologicalSex", weight: 2 },
      { key: "heightCentimeters", weight: 2 },
      { key: "weightHistory", weight: 2 },
      { key: "timeZone", weight: 1 },
    ],
  },
  {
    key: "trainingAndGoals",
    title: "Тренировки и цели",
    fields: [
      { key: "goals", weight: 12 },
      { key: "trainingExperience", weight: 5 },
      { key: "preferredActivities", weight: 4 },
      { key: "trainingPreferences", weight: 4 },
    ],
  },
  {
    key: "healthAndMedications",
    title: "Здоровье и препараты",
    fields: [
      { key: "injuries", weight: 8 },
      { key: "healthConditions", weight: 6 },
      { key: "contraindications", weight: 7 },
      { key: "medications", weight: 9 },
    ],
  },
  {
    key: "nutrition",
    title: "Питание",
    fields: [
      { key: "dietaryRestrictions", weight: 6 },
      { key: "nutritionNotes", weight: 4 },
    ],
  },
  {
    key: "sleepAndLifestyle",
    title: "Сон и образ жизни",
    fields: [
      { key: "sleepSchedule", weight: 6 },
      { key: "dailyActivityLevel", weight: 3 },
      { key: "workPattern", weight: 2 },
      { key: "stressLevel", weight: 2 },
      { key: "caffeineUse", weight: 1 },
      { key: "alcoholUse", weight: 1 },
    ],
  },
  {
    key: "scheduleAndEquipment",
    title: "Расписание и оборудование",
    fields: [
      { key: "weeklyAvailability", weight: 6 },
      { key: "equipment", weight: 4 },
    ],
  },
];

const initialFields: readonly ProfileFieldKey[] = [
  "birthDate",
  "heightCentimeters",
  "weightHistory",
  "goals",
  "trainingExperience",
  "injuries",
  "contraindications",
  "medications",
  "weeklyAvailability",
];

export function normalizeUserProfile(value: unknown): UserProfile {
  const patch = userProfilePatchSchema.parse(value ?? {});
  return userProfileSchema.parse({ ...emptyUserProfile, ...patch });
}

export function normalizeFieldStatuses(
  value: unknown,
): Partial<Record<ProfileFieldKey, ProfileFieldStatus>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const statuses: Partial<Record<ProfileFieldKey, ProfileFieldStatus>> = {};
  for (const field of profileFieldKeys) {
    const status = (value as Record<string, unknown>)[field];
    if (profileFieldStatusValues.includes(status as ProfileFieldStatus)) {
      statuses[field] = status as ProfileFieldStatus;
    }
  }
  return statuses;
}

export function isProfileFieldComplete(
  record: Pick<UserProfileRecord, "profile" | "fieldStatuses">,
  field: ProfileFieldKey,
  options: Readonly<{ hasWeightMeasurement?: boolean }> = {},
): boolean {
  if (field === "weightHistory") {
    return options.hasWeightMeasurement === true
      || record.fieldStatuses.weightHistory !== undefined;
  }
  return record.profile[field] !== null || record.fieldStatuses[field] !== undefined;
}

export function calculateProfileCompleteness(
  record: Pick<UserProfileRecord, "profile" | "fieldStatuses"> | null,
  options: Readonly<{ hasWeightMeasurement?: boolean }> = {},
): ProfileCompleteness {
  const normalized = record ?? { profile: emptyUserProfile, fieldStatuses: {} };
  const sectionResults = sections.map((section): ProfileSectionCompleteness => {
    const completedWeight = section.fields.reduce(
      (total, field) => total
        + (isProfileFieldComplete(normalized, field.key, options) ? field.weight : 0),
      0,
    );
    const totalWeight = section.fields.reduce((total, field) => total + field.weight, 0);
    return {
      key: section.key,
      title: section.title,
      percent: Math.round((completedWeight / totalWeight) * 100),
      completedWeight,
      totalWeight,
      missingFields: section.fields
        .filter((field) => !isProfileFieldComplete(normalized, field.key, options))
        .map((field) => field.key),
    };
  });
  const completedWeight = sectionResults.reduce(
    (total, section) => total + section.completedWeight,
    0,
  );
  const initialComplete = initialFields.every(
    (field) => isProfileFieldComplete(normalized, field, options),
  );
  const stage = completedWeight === 100
    ? "complete"
    : initialComplete
      ? "progressive"
      : "initial";
  return {
    percent: completedWeight,
    completedWeight,
    totalWeight: 100,
    stage,
    sections: sectionResults,
    suggestedNextSections: sectionResults
      .filter(({ percent }) => percent < 100)
      .sort((left, right) => left.percent - right.percent || right.totalWeight - left.totalWeight)
      .slice(0, 3)
      .map(({ key, title, percent, missingFields }) => ({ key, title, percent, missingFields })),
  };
}

export function calculateAgeYears(birthDate: string, asOf: Date = new Date()): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  let age = asOf.getUTCFullYear() - year;
  const beforeBirthday = asOf.getUTCMonth() + 1 < month
    || (asOf.getUTCMonth() + 1 === month && asOf.getUTCDate() < day);
  if (beforeBirthday) {
    age -= 1;
  }
  return age;
}
