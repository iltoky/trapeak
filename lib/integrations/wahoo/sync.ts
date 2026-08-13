import "server-only";

import {
  markProviderReconnectRequired,
} from "../connections";
import {
  markProviderSyncError,
  saveProviderSnapshot,
} from "../provider-data";
import { WahooApiError } from "./adapter";
import {
  getUsableWahooTokens,
  getWahooAdapter,
  WahooReconnectRequiredError,
} from "./service";

export type WahooSyncResult = Readonly<{
  importedCount: number;
  providerTotal: number;
  createdCount: number;
  updatedCount: number;
}>;

async function recordSyncError(userId: string, errorCode: string): Promise<void> {
  try {
    await markProviderSyncError(userId, "wahoo", errorCode);
  } catch {
    // The original sync error is more useful than a secondary telemetry failure.
  }
}

export async function syncWahooData(userId: string): Promise<WahooSyncResult> {
  const tokens = await getUsableWahooTokens(userId);
  const adapter = getWahooAdapter();

  try {
    const [profile, activityPage] = await Promise.all([
      adapter.getProfile(tokens),
      adapter.listActivities(tokens, { page: 1, perPage: 30 }),
    ]);
    const saved = await saveProviderSnapshot({
      userId,
      provider: "wahoo",
      profile,
      activityPage,
    });

    return {
      importedCount: activityPage.activities.length,
      providerTotal: activityPage.total,
      createdCount: saved.createdCount,
      updatedCount: saved.updatedCount,
    };
  } catch (error) {
    if (error instanceof WahooApiError && [401, 403].includes(error.status)) {
      await markProviderReconnectRequired(userId, "wahoo", "api_access_rejected");
      await recordSyncError(userId, "reconnect_required");
      throw new WahooReconnectRequiredError();
    }

    await recordSyncError(
      userId,
      error instanceof WahooApiError && error.status === 429
        ? "provider_rate_limited"
        : "provider_sync_failed",
    );
    throw error;
  }
}
