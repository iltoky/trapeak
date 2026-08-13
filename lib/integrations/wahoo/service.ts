import "server-only";

import { WahooProviderAdapter } from "./adapter";
import { readWahooConfig } from "./config";

export function getWahooAdapter(): WahooProviderAdapter {
  return new WahooProviderAdapter(readWahooConfig());
}

