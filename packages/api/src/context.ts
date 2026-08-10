import { Context } from "effect";

/**
 * Per-request context — extend with session/auth when those packages land.
 * Wire via HttpApiMiddleware / RpcMiddleware (not global layer merge).
 */
export class RequestContext extends Context.Service<
  RequestContext,
  {
    readonly clientIp: string;
  }
>()("@acme/RequestContext") {}
