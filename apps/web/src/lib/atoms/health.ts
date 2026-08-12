import { AppHttpClient } from "@/lib/atoms/http";

const privateHealthReactivityKey = ["private-health"] as const;

export const privateHealthAtom = AppHttpClient.query(
  "healthCheck",
  "healthCheck",
  {
    reactivityKeys: privateHealthReactivityKey,
    serializationKey: "private-health",
  },
);
