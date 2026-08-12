import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  beforeLoad: async ({ context }) => {
    const session = await context.getSession();
    if (session === null) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: () => <Outlet />,
});
