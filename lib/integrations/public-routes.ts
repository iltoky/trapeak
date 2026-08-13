const WAHOO_WEBHOOK_PATH = "/api/integrations/wahoo/webhook";

export function isPublicIntegrationPath(pathname: string) {
  return pathname === WAHOO_WEBHOOK_PATH || pathname === `${WAHOO_WEBHOOK_PATH}/`;
}
