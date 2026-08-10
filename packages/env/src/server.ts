import { NodeFileSystem } from "@effect/platform-node";
import {
  Config,
  ConfigProvider,
  Context,
  Effect,
  Layer,
  Schema,
  type PlatformError,
} from "effect";
import { fileURLToPath } from "node:url";

const defaultDotEnvPath = fileURLToPath(
  new URL("../../../.env", import.meta.url),
);

const defaultDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/acme";

const EnvSchema = Schema.Struct({
  NODE_ENV: Schema.Literals(["development", "production", "test"]),
  PORT: Config.Port,
  HOST: Schema.String,
  DATABASE_URL: Schema.String,
});

const nodeEnv = Config.schema(EnvSchema.fields.NODE_ENV, "NODE_ENV").pipe(
  Config.withDefault("development" as const),
);

const port = Config.schema(EnvSchema.fields.PORT, "PORT").pipe(
  Config.withDefault(3000),
);

const host = Config.schema(EnvSchema.fields.HOST, "HOST").pipe(
  Config.withDefault("0.0.0.0"),
);

const databaseUrl = Config.schema(
  EnvSchema.fields.DATABASE_URL,
  "DATABASE_URL",
).pipe(Config.withDefault(defaultDatabaseUrl));

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
});

export class Env extends Context.Service<
  Env,
  {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly host: string;
    readonly databaseUrl: string;
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
    const path = options?.dotEnvPath ?? defaultDotEnvPath;

    const dotEnvProvider = ConfigProvider.fromDotEnv({ path }).pipe(
      Effect.catchIf(
        (error): error is PlatformError.PlatformError =>
          error._tag === "PlatformError" && error.reason._tag === "NotFound",
        () => Effect.succeed(ConfigProvider.fromUnknown({})),
      ),
    );

    return Env.layer.pipe(
      Layer.provideMerge(
        ConfigProvider.layerAdd(dotEnvProvider).pipe(
          Layer.provide(NodeFileSystem.layer),
        ),
      ),
    );
  }
}
