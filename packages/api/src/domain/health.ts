import { Effect } from "effect";

export const healthCheck = Effect.succeed("OK" as const);
