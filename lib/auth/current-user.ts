import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { isAuthConfigured } from "./config";

export type AuthUser = Readonly<{
  id: string;
  email: string | null;
}>;

export class AuthNotConfiguredError extends Error {
  constructor() {
    super("TRAPEAK authentication is not configured");
    this.name = "AuthNotConfiguredError";
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  if (!isAuthConfigured()) {
    throw new AuthNotConfiguredError();
  }

  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find(
      ({ id }) => id === user.primaryEmailAddressId,
    )?.emailAddress ?? null;

  return { id: userId, email: primaryEmail };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
