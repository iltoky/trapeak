import {
  AuthNotConfiguredError,
  getAuthUser,
} from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    if (error instanceof AuthNotConfiguredError) {
      return Response.json(
        { error: "Authentication is not configured" },
        { status: 503 },
      );
    }

    throw error;
  }
}
