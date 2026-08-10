import { scheduleTask } from "@effect/atom-react";
import { AtomRegistry } from "effect/unstable/reactivity";

import type { AtomRegistry as AtomRegistryService } from "effect/unstable/reactivity/AtomRegistry";

export const registry = AtomRegistry.make({
  scheduleTask,
  defaultIdleTTL: 400,
});

export type AppRouterContext = {
  readonly registry: AtomRegistryService;
};
