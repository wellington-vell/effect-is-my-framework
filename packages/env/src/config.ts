import { NodeFileSystem } from "@effect/platform-node";
import {
  Config,
  ConfigProvider,
  Effect,
  Layer,
  Schema,
  type PlatformError,
} from "effect";
import { fileURLToPath } from "node:url";

export const defaultDotEnvPath = fileURLToPath(
  new URL("../../../.env", import.meta.url),
);

export const NodeEnvSchema = Schema.Literals([
  "development",
  "production",
  "test",
]);

export const nodeEnv = Config.schema(NodeEnvSchema, "NODE_ENV").pipe(
  Config.withDefault("development" as const),
);

export const createLayerWithDotEnv = <R, E>(
  layer: Layer.Layer<R, E>,
  options?: { readonly dotEnvPath?: string },
): Layer.Layer<R, E | PlatformError.PlatformError> => {
  const path = options?.dotEnvPath ?? defaultDotEnvPath;

  const dotEnvProvider = ConfigProvider.fromDotEnv({ path }).pipe(
    Effect.catchIf(
      (error): error is PlatformError.PlatformError =>
        error._tag === "PlatformError" && error.reason._tag === "NotFound",
      () => Effect.succeed(ConfigProvider.fromUnknown({})),
    ),
  );

  return layer.pipe(
    Layer.provideMerge(
      ConfigProvider.layerAdd(dotEnvProvider).pipe(
        Layer.provide(NodeFileSystem.layer),
      ),
    ),
  );
};
