import { requireAuthUser } from "@/lib/auth/current-user";
import {
  createDataAccessGrant,
  listOwnedDataAccessGrants,
  listReceivedDataAccessGrants,
} from "@/lib/access/data";

export async function GET() {
  const user = await requireAuthUser();
  const [owned, received] = await Promise.all([
    listOwnedDataAccessGrants(user.id),
    listReceivedDataAccessGrants(user.id),
  ]);
  return Response.json({ owned, received });
}

export async function POST(request: Request) {
  const user = await requireAuthUser();
  try {
    const input = await request.json() as {
      recipientEmail?: unknown;
      permissions?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof input.recipientEmail !== "string"
      || !Array.isArray(input.permissions)
      || input.permissions.some((value) => typeof value !== "string")
      || typeof input.expiresAt !== "string"
    ) {
      return Response.json({ error: "Invalid grant input" }, { status: 400 });
    }
    const created = await createDataAccessGrant({
      ownerUserId: user.id,
      ownerEmail: user.email,
      recipientEmail: input.recipientEmail,
      permissions: input.permissions,
      expiresAt: input.expiresAt,
    });
    const origin = new URL(request.url).origin;
    return Response.json({
      grant: created.grant,
      invitationUrl: `${origin}/access/invite/${created.invitationToken}`,
    }, { status: 201 });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : "Invalid grant input",
    }, { status: 400 });
  }
}
