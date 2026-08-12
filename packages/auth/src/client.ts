import { createAuthClient } from "better-auth/client";

/** Framework-agnostic Better Auth client for browser / SPA consumers. */
export const makeAuthClient = (baseURL: string) =>
  createAuthClient({ baseURL });
