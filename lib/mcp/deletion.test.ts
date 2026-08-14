import assert from "node:assert/strict";
import test from "node:test";

import { deletionConfirmationSchema } from "./deletion.ts";

test("destructive MCP actions require an explicit true confirmation", () => {
  assert.equal(deletionConfirmationSchema.parse(true), true);
  assert.equal(deletionConfirmationSchema.safeParse(false).success, false);
  assert.equal(deletionConfirmationSchema.safeParse(undefined).success, false);
});
