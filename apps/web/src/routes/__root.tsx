import "@/styles.css";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

import type { AtomRegistry as AtomRegistryService } from "effect/unstable/reactivity/AtomRegistry";

type AppRouterContext = {
  readonly registry: AtomRegistryService;
};

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <Outlet />
        <Toaster richColors />
      </ThemeProvider>

      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{
            position: "bottom-right",
            panelLocation: "bottom",
            hideUntilHover: true,
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  );
}
