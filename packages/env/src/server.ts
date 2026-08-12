import { Config, Context, Layer, Schema, type PlatformError } from "effect";

import { createLayerWithDotEnv, nodeEnv } from "@acme/env/config";

const defaultDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/acme";
const defaultBetterAuthSecret = "dev-only-change-me-min-32-chars!!";

const port = Config.schema(Config.Port, "PORT").pipe(Config.withDefault(3001));

const host = Config.schema(Schema.String, "HOST").pipe(
  Config.withDefault("0.0.0.0"),
);

const databaseUrl = Config.schema(Schema.String, "DATABASE_URL").pipe(
  Config.withDefault(defaultDatabaseUrl),
);

const corsOrigins = Config.schema(Schema.String, "CORS_ORIGINS").pipe(
  Config.withDefault("http://localhost:3000"),
);

const parsedCorsOrigins = Config.map(corsOrigins, (origins) =>
  origins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
);

const betterAuthSecret = Config.schema(
  Schema.String,
  "BETTER_AUTH_SECRET",
).pipe(Config.withDefault(defaultBetterAuthSecret));

const betterAuthUrl = Config.schema(Schema.String, "BETTER_AUTH_URL").pipe(
  Config.orElse(() =>
    Config.all({ host, port }).pipe(
      Config.map(
        ({ host: h, port: p }) =>
          `http://${h === "0.0.0.0" ? "localhost" : h}:${p}`,
      ),
    ),
  ),
);

/**
 * Config fragment for `NodeHttpServer.layerConfig` listen options.
 */
export const serverOptions = {
  port,
  host,
} as const satisfies Config.Wrap<{
  readonly port: number;
  readonly host: string;
}>;

const envConfig = Config.all({
  nodeEnv,
  port,
  host,
  databaseUrl,
  corsOrigins: parsedCorsOrigins,
  betterAuthSecret,
  betterAuthUrl,
});

export class Env extends Context.Service<
  Env,
  {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly host: string;
    readonly databaseUrl: string;
    readonly corsOrigins: ReadonlyArray<string>;
    readonly betterAuthSecret: string;
    readonly betterAuthUrl: string;
  }
>()("@acme/Env") {
  static readonly config: Config.Config<Env["Service"]> = envConfig;

  /** Load env from `process.env` only. */
  static readonly layer: Layer.Layer<Env, Config.ConfigError> = Layer.effect(
    Env,
    envConfig,
  );

  /**
   * Load env with `process.env` as primary and a `.env` file as fallback.
   * Missing `.env` files are ignored.
   */
  static layerWithDotEnv(options?: {
    readonly dotEnvPath?: string;
  }): Layer.Layer<Env, Config.ConfigError | PlatformError.PlatformError> {
    return createLayerWithDotEnv(Env.layer, options);
  }
}
