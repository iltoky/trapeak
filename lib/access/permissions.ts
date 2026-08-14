export const dataPermissions = [
  "training",
  "nutrition",
  "health",
  "recovery",
] as const;

export type DataPermission = typeof dataPermissions[number];

// Recovery stays reserved in storage so existing grants and migrations remain
// compatible. It is not offered until TRAPEAK has a dated recovery source.
export const assignableDataPermissions = [
  "training",
  "nutrition",
  "health",
] as const satisfies readonly DataPermission[];
