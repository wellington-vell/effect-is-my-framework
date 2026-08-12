## Vendored repos (`repos/`)

- Read-only reference — prefer vendored source over guesses or web search
- Do not edit or import from `repos/`; app code uses normal package deps
- For Effect idioms, use `repos/effect/` as source of truth

## Package layout

| Package           | Role                                      |
| ----------------- | ----------------------------------------- |
| `@acme/shared`    | Schemas + tagged errors (web + server)    |
| `@acme/contracts` | HttpApi / Rpc groups only                 |
| `@acme/domain`    | Context services, DB → error mapping      |
| `@acme/core`      | Transport handlers (`health/`, `todos/`)  |
| `@acme/db`        | Persistence                               |
| `@acme/auth`      | Better Auth (email/password) + HTTP mount |
| `apps/server`     | Composition root (`AppLayer`)             |

**Rules:**

- Errors/schemas stay in `@acme/shared` (not domain) so web can use them without domain/db
- Handlers in `@acme/core`; compose in `apps/server` — do not put `AppLayer` in core
- Core must not import `@acme/db` in production code (devDependency OK for test mocks)
- Auth owns Better Auth config and `/api/auth/*` routes; compose in `apps/server`
- After structural changes: `bun run boundaries` (`turbo.json` deny-lists; tags apply transitively)
