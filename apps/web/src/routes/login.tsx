import { useAtomSet } from "@effect/atom-react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { signInFn } from "@/lib/atoms/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.getSession();
    if (session !== null) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const signIn = useAtomSet(signInFn, { mode: "promise" });
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("password");

  const onSignIn = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    void signIn({ email: email.trim(), password }).then(
      () => router.invalidate(),
      () => undefined,
    );
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 p-8">
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Use your account to access todos.
        </p>
      </header>

      <form onSubmit={onSignIn} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
