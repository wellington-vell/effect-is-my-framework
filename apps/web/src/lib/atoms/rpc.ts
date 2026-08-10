import { Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { Atom } from "effect/unstable/reactivity";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

const rpcUrl = new URL(
  "/rpc",
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
).href;

const RpcLayer = RpcClient.layerProtocolHttp({ url: rpcUrl }).pipe(
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(FetchHttpClient.layer),
);

export const rpcRuntime = Atom.runtime(RpcLayer);
