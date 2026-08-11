import { scheduleTask } from "@effect/atom-react";
import { AtomRegistry } from "effect/unstable/reactivity";

export const registry = AtomRegistry.make({
  scheduleTask,
  defaultIdleTTL: 400,
});
