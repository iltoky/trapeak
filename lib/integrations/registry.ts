import type {
  ProviderId,
  WearableProviderAdapter,
} from "./provider";

export class ProviderNotConfiguredError extends Error {
  constructor(provider: ProviderId) {
    super(`Provider ${provider} is not configured`);
    this.name = "ProviderNotConfiguredError";
  }
}

export class ProviderAdapterRegistry {
  readonly #adapters = new Map<ProviderId, WearableProviderAdapter>();

  register(adapter: WearableProviderAdapter): void {
    if (this.#adapters.has(adapter.id)) {
      throw new Error(`Provider ${adapter.id} is already registered`);
    }

    this.#adapters.set(adapter.id, adapter);
  }

  get(provider: ProviderId): WearableProviderAdapter {
    const adapter = this.#adapters.get(provider);
    if (!adapter) {
      throw new ProviderNotConfiguredError(provider);
    }

    return adapter;
  }

  configuredProviders(): readonly ProviderId[] {
    return [...this.#adapters.keys()];
  }
}
