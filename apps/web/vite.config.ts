import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { Effect } from "effect";
import { defineConfig } from "vite";

import { Env } from "@acme/env/web";

const env = await Effect.runPromise(
  Env.config.pipe(Effect.provide(Env.layerWithDotEnv())),
);

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(env.apiBaseUrl),
  },
  server: {
    port: env.port,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
});

export default config;
