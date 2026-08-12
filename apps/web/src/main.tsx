import { RegistryContext } from "@effect/atom-react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Effect } from "effect";
import { AtomRegistry } from "effect/unstable/reactivity";
import React from "react";
import ReactDOM from "react-dom/client";
import { sessionAtom } from "@/lib/atoms/auth";
import { registry } from "@/lib/atoms/registry";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  context: {
    registry,
    getSession: () =>
      Effect.runPromise(
        AtomRegistry.getResult(registry, sessionAtom).pipe(
          Effect.orElseSucceed(() => null),
        ),
      ),
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RegistryContext.Provider value={registry}>
        <RouterProvider router={router} />
      </RegistryContext.Provider>
    </React.StrictMode>,
  );
}
