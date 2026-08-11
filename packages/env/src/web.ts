import { Config, Context, Layer, Schema, type PlatformError } from "effect";

import { createLayerWithDotEnv, nodeEnv } from "@acme/env/config";

const defaultApiBaseUrl = "http://localhost:3001";

const port = Config.schema(Config.Port, "WEB_PORT").pipe(
  Config.withDefault(3000),
);

const apiBaseUrl = Config.schema(Schema.String, "VITE_API_BASE_URL").pipe(
  Config.withDefault(defaultApiBaseUrl),
);

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
    return createLayerWithDotEnv(Env.layer, options);
  }
}
