import { Context } from "effect";

import type { EffectPgDatabase } from "drizzle-orm/effect-postgres";

export class Database extends Context.Service<Database, EffectPgDatabase>()(
  "@acme/db/Database",
) {}
