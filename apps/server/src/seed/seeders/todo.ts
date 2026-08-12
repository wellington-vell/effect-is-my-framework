import { todos } from "@acme/db/schema/todos";
import { SAMPLE_TODOS } from "@acme/server/seed/constants";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export async function seedTodos(db: NodePgDatabase): Promise<void> {
  await db.insert(todos).values([...SAMPLE_TODOS]);
}
