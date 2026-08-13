import assert from "node:assert/strict";
import test from "node:test";

import {
  DatabaseConfigurationError,
  readDatabaseUrl,
} from "./config.ts";

test("readDatabaseUrl prefers DATABASE_URL", () => {
  assert.equal(readDatabaseUrl({
    DATABASE_URL: "postgresql://primary",
    POSTGRES_URL: "postgresql://neon",
  }), "postgresql://primary");
});

test("readDatabaseUrl falls back to Neon POSTGRES_URL", () => {
  assert.equal(readDatabaseUrl({
    POSTGRES_URL: "  postgresql://neon  ",
  }), "postgresql://neon");
});

test("readDatabaseUrl rejects missing database configuration", () => {
  assert.throws(
    () => readDatabaseUrl({}),
    DatabaseConfigurationError,
  );
});
