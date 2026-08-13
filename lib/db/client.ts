import "server-only";

import {
  neon,
  type NeonQueryFunction,
} from "@neondatabase/serverless";

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("Database is not configured");
    this.name = "DatabaseConfigurationError";
  }
}

let client: NeonQueryFunction<false, false> | null = null;
let connectionString: string | null = null;

export function getDatabase(): NeonQueryFunction<false, false> {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  if (!configuredUrl) {
    throw new DatabaseConfigurationError();
  }

  if (!client || connectionString !== configuredUrl) {
    client = neon(configuredUrl);
    connectionString = configuredUrl;
  }

  return client;
}
