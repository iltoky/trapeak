import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations");
}

const sql = neon(databaseUrl);
await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const migrationsDirectory = join(process.cwd(), "db", "migrations");
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((name) => name.endsWith(".sql"))
  .sort();

const appliedRows = await sql`SELECT id FROM schema_migrations`;
const applied = new Set(appliedRows.map(({ id }) => String(id)));

for (const migrationFile of migrationFiles) {
  if (applied.has(migrationFile)) {
    continue;
  }

  const source = await readFile(join(migrationsDirectory, migrationFile), "utf8");
  const statements = source
    .split("-- statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await sql.transaction((transaction) => [
    ...statements.map((statement) => transaction.query(statement)),
    transaction`INSERT INTO schema_migrations (id) VALUES (${migrationFile})`,
  ]);
  process.stdout.write(`Applied ${migrationFile}\n`);
}

process.stdout.write("Database migrations are up to date\n");

