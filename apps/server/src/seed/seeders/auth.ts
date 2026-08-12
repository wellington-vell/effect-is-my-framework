import { account, user } from "@acme/db/schema/auth";
import { ADMIN_USER } from "@acme/server/seed/constants";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedAdminUser(
  db: NodePgDatabase,
  hashedPassword: string,
): Promise<void> {
  const now = new Date();

  await db.insert(user).values({
    id: ADMIN_USER.id,
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    emailVerified: true,
    image: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: crypto.randomUUID(),
    accountId: ADMIN_USER.id,
    providerId: "credential",
    userId: ADMIN_USER.id,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });
}
