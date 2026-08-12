import { Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { AtomHttpApi } from "effect/unstable/reactivity";

import { AppApi } from "@acme/contracts/http/api";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3101";

/** Capture RequestInit at layer build time so credentials survive layerMergedContext. */
const HttpClientLayer = Layer.fresh(FetchHttpClient.layer).pipe(
  Layer.provide(
    Layer.succeed(FetchHttpClient.RequestInit, {
      credentials: "include",
    }),
  ),
);

export const AppHttpClient = AtomHttpApi.Service()("@acme/AppHttpClient", {
  api: AppApi,
  httpClient: HttpClientLayer,
  baseUrl: apiBaseUrl,
});
