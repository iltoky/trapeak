import { rejectDataAccessInvitation } from "@/lib/access/data";
import { requireAuthUser } from "@/lib/auth/current-user";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const user = await requireAuthUser();
  const { token } = await context.params;
  const rejected = await rejectDataAccessInvitation({
    token,
    recipientUserId: user.id,
    recipientEmail: user.email,
  });
  return rejected
    ? Response.json({ rejected: true })
    : Response.json(
      { error: "Invitation is invalid, expired, or issued to another email" },
      { status: 404 },
    );
}
