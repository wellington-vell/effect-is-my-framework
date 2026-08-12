export { account, session, user, verification } from "./auth.ts";
export { todos } from "./todos.ts";

import { account, session, user, verification } from "./auth.ts";
import { todos } from "./todos.ts";

export const schema = {
  todos,
  user,
  session,
  account,
  verification,
};
