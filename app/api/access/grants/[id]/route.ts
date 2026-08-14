import { requireAuthUser } from "@/lib/auth/current-user";
import { revokeDataAccessGrant } from "@/lib/access/data";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireAuthUser();
  const { id } = await context.params;
  const revoked = await revokeDataAccessGrant(user.id, id);
  return Response.json({ id, revoked }, { status: revoked ? 200 : 404 });
}
