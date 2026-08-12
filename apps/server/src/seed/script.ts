import { drizzle } from "drizzle-orm/node-postgres";
import { Effect } from "effect";

import { createAuthResources } from "@acme/auth/auth";
import { account, session, user, verification } from "@acme/db/schema/auth";
import { todos } from "@acme/db/schema/todos";
import { Env } from "@acme/env/server";
import { ADMIN_USER, SAMPLE_TODOS } from "@acme/server/seed/constants";
import { seedAdminUser } from "@acme/server/seed/seeders/auth";
import { seedTodos } from "@acme/server/seed/seeders/todo";

const main = Effect.gen(function* () {
  const env = yield* Env;

  if (env.nodeEnv !== "development") {
    yield* Effect.logError(
      "seed: Skipping. Run only when NODE_ENV=development",
    );
    process.exit(1);
  }

  yield* Effect.log("Starting database seeding...");

  yield* Effect.acquireUseRelease(
    Effect.sync(() =>
      createAuthResources({
        databaseUrl: env.databaseUrl,
        secret: env.betterAuthSecret,
        baseURL: env.betterAuthUrl,
        trustedOrigins: env.corsOrigins,
      }),
    ),
    ({ instance, pool }) =>
      Effect.gen(function* () {
        const db = drizzle({ client: pool });

        yield* Effect.tryPromise({
          try: async () => {
            await db.delete(session);
            await db.delete(account);
            await db.delete(verification);
            await db.delete(user);
            await db.delete(todos);
          },
          catch: () => new Error("seed step 'reset' failed"),
        });

        const ctx = yield* Effect.tryPromise({
          try: () => instance.$context,
          catch: () => new Error("seed step 'resolve auth context' failed"),
        });

        const hashedPassword = yield* Effect.tryPromise({
          try: () => ctx.password.hash(ADMIN_USER.password),
          catch: () => new Error("seed step 'hash password' failed"),
        });

        yield* Effect.tryPromise({
          try: () => seedAdminUser(db, hashedPassword),
          catch: () => new Error("seed step 'seed admin user' failed"),
        });

        yield* Effect.tryPromise({
          try: () => seedTodos(db),
          catch: () => new Error("seed step 'seed todos' failed"),
        });

        yield* Effect.log("Database seeding completed successfully!");
        yield* Effect.log(
          `\x1b[32mSeeded admin user. Password: "${ADMIN_USER.password}"\x1b[0m`,
        );
        yield* Effect.log(
          `\x1b[33mEmail:\x1b[0m \x1b[36m${ADMIN_USER.email}\x1b[0m`,
        );
        yield* Effect.log(`\x1b[33mTodos:\x1b[0m ${SAMPLE_TODOS.length} rows`);
      }),
    ({ pool }) => Effect.promise(() => pool.end()),
  );
});

void Effect.runPromise(main.pipe(Effect.provide(Env.layerWithDotEnv()))).then(
  () => process.exit(0),
  (error) => {
    console.error("seed failed:", error);
    process.exit(1);
  },
);
