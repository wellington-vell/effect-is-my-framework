/**
 * Fixed IDs / credentials for local seed data.
 * Password is intentionally weak — development only.
 */
export const ADMIN_USER = {
  id: "0191a000-0000-7000-0000-000000000001",
  email: "admin@acme.com",
  name: "Admin",
  password: "password",
} as const;

export const SAMPLE_TODOS = [
  { title: "Buy groceries", completed: false },
  { title: "Read Effect docs", completed: false },
  { title: "Ship auth package", completed: true },
] as const;
