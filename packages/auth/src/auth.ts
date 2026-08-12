import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { account, session, user, verification } from "@acme/db/schema/auth";

const authSchema = {
  user,
  session,
  account,
  verification,
};

export type CreateAuthOptions = {
  readonly databaseUrl: string;
  readonly secret: string;
  readonly baseURL: string;
  readonly trustedOrigins: ReadonlyArray<string>;
};

/**
 * Builds a Better Auth instance backed by a dedicated `pg.Pool` + Drizzle adapter.
 * The app's Effect Postgres layer is not used — Better Auth expects a Promise-based client.
 * Callers that own the pool (e.g. seed) must `pool.end()` when finished.
 */
export const createAuthResources = (options: CreateAuthOptions) => {
  const pool = new Pool({
    connectionString: options.databaseUrl,
    max: 5,
  });
  // drizzle-orm 1.0: pass `{ client }` (no positional Pool + schema)
  const db = drizzle({ client: pool });

  const instance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: [...options.trustedOrigins],
  });

  return { instance, pool };
};

export type AuthResources = ReturnType<typeof createAuthResources>;
export type AuthInstance = AuthResources["instance"];

export const createAuth = (options: CreateAuthOptions): AuthInstance =>
  createAuthResources(options).instance;
