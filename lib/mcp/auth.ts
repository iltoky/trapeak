export type McpAuthInfo = Readonly<{
  extra?: Readonly<Record<string, unknown>>;
}>;

export class McpUnauthorizedError extends Error {
  constructor() {
    super("The MCP request is not linked to a TRAPEAK user");
    this.name = "McpUnauthorizedError";
  }
}

export function requireMcpUserId(authInfo: McpAuthInfo | undefined): string {
  const userId = authInfo?.extra?.userId;
  if (typeof userId !== "string" || userId.length === 0) {
    throw new McpUnauthorizedError();
  }

  return userId;
}
