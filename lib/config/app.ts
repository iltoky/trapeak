export class AppConfigurationError extends Error {
  constructor(variable: string, reason = "is missing") {
    super(`Invalid application configuration: ${variable} ${reason}`);
    this.name = "AppConfigurationError";
  }
}

export function readAppUrl(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): URL {
  const value = environment.APP_URL?.trim();
  if (!value) {
    throw new AppConfigurationError("APP_URL");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppConfigurationError("APP_URL", "must be an absolute URL");
  }

  if (!(["http:", "https:"] as const).includes(url.protocol as "http:" | "https:")) {
    throw new AppConfigurationError("APP_URL", "must use http or https");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

