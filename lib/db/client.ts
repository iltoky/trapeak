import "server-only";

import {
  neon,
  type NeonQueryFunction,
} from "@neondatabase/serverless";
import { readDatabaseUrl } from "./config";

export { DatabaseConfigurationError } from "./config";

let client: NeonQueryFunction<false, false> | null = null;
let connectionString: string | null = null;

export function getDatabase(): NeonQueryFunction<false, false> {
  const configuredUrl = readDatabaseUrl();

  if (!client || connectionString !== configuredUrl) {
    client = neon(configuredUrl);
    connectionString = configuredUrl;
  }

  return client;
}
