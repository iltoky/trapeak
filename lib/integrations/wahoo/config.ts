export type WahooConfig = Readonly<{
  clientId: string;
  clientSecret: string;
}>;

export class WahooConfigurationError extends Error {
  constructor(variable: string) {
    super(`Missing required Wahoo configuration: ${variable}`);
    this.name = "WahooConfigurationError";
  }
}

function requireValue(
  environment: Readonly<Record<string, string | undefined>>,
  variable: "WAHOO_CLIENT_ID" | "WAHOO_CLIENT_SECRET",
): string {
  const value = environment[variable]?.trim();
  if (!value) {
    throw new WahooConfigurationError(variable);
  }

  return value;
}

export function readWahooConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): WahooConfig {
  return {
    clientId: requireValue(environment, "WAHOO_CLIENT_ID"),
    clientSecret: requireValue(environment, "WAHOO_CLIENT_SECRET"),
  };
}
