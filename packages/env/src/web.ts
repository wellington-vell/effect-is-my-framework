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

const defaultApiBaseUrl = "http://localhost:3001";

const EnvSchema = Schema.Struct({
  NODE_ENV: Schema.Literals(["development", "production", "test"]),
  WEB_PORT: Config.Port,
  VITE_API_BASE_URL: Schema.String,
});

const nodeEnv = Config.schema(EnvSchema.fields.NODE_ENV, "NODE_ENV").pipe(
  Config.withDefault("development" as const),
);

const port = Config.schema(EnvSchema.fields.WEB_PORT, "WEB_PORT").pipe(
  Config.withDefault(3000),
);

const apiBaseUrl = Config.schema(
  EnvSchema.fields.VITE_API_BASE_URL,
  "VITE_API_BASE_URL",
).pipe(Config.withDefault(defaultApiBaseUrl));

const envConfig = Config.all({
  nodeEnv,
  port,
  apiBaseUrl,
});

export class Env extends Context.Service<
  Env,
  {
    readonly nodeEnv: "development" | "production" | "test";
    readonly port: number;
    readonly apiBaseUrl: string;
  }
>()("@acme/WebEnv") {
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
