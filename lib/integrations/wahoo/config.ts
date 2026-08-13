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
  variable: "WAHOO_CLIENT_ID" | "WAHOO_CLIENT_SECRET" | "WAHOO_WEBHOOK_TOKEN",
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

export function readWahooWebhookToken(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string {
  return requireValue(environment, "WAHOO_WEBHOOK_TOKEN");
}

export function isWahooWebhookConfigured(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  return Boolean(environment.WAHOO_WEBHOOK_TOKEN?.trim());
}
