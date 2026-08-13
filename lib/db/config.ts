export class DatabaseConfigurationError extends Error {
  constructor() {
    super("Database is not configured");
    this.name = "DatabaseConfigurationError";
  }
}

export function readDatabaseUrl(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const configuredUrl = environment.DATABASE_URL?.trim()
    || environment.POSTGRES_URL?.trim();
  if (!configuredUrl) {
    throw new DatabaseConfigurationError();
  }

  return configuredUrl;
}
