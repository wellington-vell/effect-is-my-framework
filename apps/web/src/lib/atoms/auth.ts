import { AppHttpClient } from "@/lib/atoms/http";
import { withToast } from "@/lib/atoms/with-toast";

const sessionReactivityKey = ["session"] as const;

export const sessionAtom = AppHttpClient.query("auth", "getSession", {
  reactivityKeys: sessionReactivityKey,
  serializationKey: "session",
});

export const signInFn = AppHttpClient.runtime.fn(
  (payload: { readonly email: string; readonly password: string }) =>
    AppHttpClient.use((client) => client.auth.signIn({ payload })).pipe(
      withToast({ onFailure: () => "Invalid email or password" }),
    ),
  {
    reactivityKeys: [sessionReactivityKey],
  },
);

export const signOutFn = AppHttpClient.runtime.fn(
  () =>
    AppHttpClient.use((client) => client.auth.signOut({})).pipe(
      withToast({
        onSuccess: () => "Signed out",
        onFailure: () => "Sign out failed",
      }),
    ),
  {
    reactivityKeys: [sessionReactivityKey],
  },
);
