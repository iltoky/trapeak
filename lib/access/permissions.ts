export const dataPermissions = [
  "training",
  "nutrition",
  "health",
  "recovery",
] as const;

export type DataPermission = typeof dataPermissions[number];
