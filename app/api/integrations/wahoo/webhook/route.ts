import { findConnectedUserByProviderAccount } from "@/lib/integrations/connections";
import { saveProviderActivity } from "@/lib/integrations/provider-data";
import { readWahooWebhookToken } from "@/lib/integrations/wahoo/config";
import {
  parseWahooWebhook,
  WahooWebhookAuthenticationError,
  WahooWebhookPayloadError,
} from "@/lib/integrations/wahoo/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > MAX_WEBHOOK_BYTES) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }

    const event = parseWahooWebhook(
      JSON.parse(body) as unknown,
      readWahooWebhookToken(),
    );
    if (!event) {
      return Response.json({ received: true, ignored: true });
    }

    const userId = await findConnectedUserByProviderAccount(
      "wahoo",
      event.providerUserId,
    );
    if (!userId) {
      return Response.json({ received: true, ignored: true });
    }

    const result = await saveProviderActivity({
      userId,
      provider: "wahoo",
      activity: event.activity,
    });
    return Response.json({
      received: true,
      created: result.created,
    });
  } catch (error) {
    if (error instanceof WahooWebhookAuthenticationError) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof SyntaxError || error instanceof WahooWebhookPayloadError) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
