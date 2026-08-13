import assert from "node:assert/strict";
import test from "node:test";

import { isPublicIntegrationPath } from "./public-routes.ts";

test("allows only the Wahoo webhook integration route through auth middleware", () => {
  assert.equal(
    isPublicIntegrationPath("/api/integrations/wahoo/webhook"),
    true,
  );
  assert.equal(
    isPublicIntegrationPath("/api/integrations/wahoo/webhook/"),
    true,
  );
  assert.equal(isPublicIntegrationPath("/api/integrations/wahoo"), false);
  assert.equal(
    isPublicIntegrationPath("/api/integrations/wahoo/webhook/anything"),
    false,
  );
  assert.equal(isPublicIntegrationPath("/api/integrations/garmin/webhook"), false);
});
