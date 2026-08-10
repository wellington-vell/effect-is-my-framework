import { PgClient } from "@effect/sql-pg";
import { makeWithDefaults } from "drizzle-orm/effect-postgres";
import { migrate } from "drizzle-orm/effect-postgres/migrator";
import { Effect, Layer, Redacted } from "effect";
import { fileURLToPath } from "node:url";

import { Database } from "@acme/db/database";
import { Env } from "@acme/env/server";

const migrationsFolder = fileURLToPath(
  new URL("../src/migrations", import.meta.url),
);

/** PgClient pool from `Env.databaseUrl`. */
export const PgClientLive = Layer.unwrap(
  Effect.gen(function* () {
    const { databaseUrl } = yield* Env;
    return PgClient.layer({ url: Redacted.make(databaseUrl) });
  }),
);

/** App-scoped Drizzle database over PgClient. */
export const DatabaseLayer = Layer.effect(Database, makeWithDefaults()).pipe(
  Layer.provide(PgClientLive),
);

/**
 * Runs pending Drizzle migrations. Requires `Database` in context.
 * Provides nothing — use before launching the HTTP server.
 */
export const MigrateLayer = Layer.unwrap(
  Effect.gen(function* () {
    const db = yield* Database;
    yield* migrate(db, { migrationsFolder });
    return Layer.empty;
  }),
);

/** Run migrations as an Effect (requires Database). */
export const runMigrations = Effect.gen(function* () {
  const db = yield* Database;
  yield* migrate(db, { migrationsFolder });
});
