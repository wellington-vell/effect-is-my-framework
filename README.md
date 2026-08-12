# effect-framework

A full-stack TypeScript monorepo scaffold using the [Effect](https://effect.website) framework as its core architectural backbone. Demonstrates a production-style application with a Node.js HTTP API server, a React web frontend, and a PostgreSQL database — all wired together via Effect's dependency injection (Layer), Schema, and RPC systems.

The sample feature is a **Todos CRUD** application.

## Tech Stack

| Layer                     | Technology                                                                   |
| ------------------------- | ---------------------------------------------------------------------------- |
| Runtime / Package Manager | [Bun](https://bun.sh) (>=1.3.10)                                             |
| Language                  | TypeScript 7.0.2 + `@effect/tsgo`                                            |
| Core Framework            | [Effect](https://effect.website) v4.0.0-beta.107                             |
| Monorepo                  | [Turborepo](https://turbo.build)                                             |
| Database                  | PostgreSQL 18 via [Drizzle ORM](https://orm.drizzle.team) + `@effect/sql-pg` |
| API                       | Effect `HttpApi` (REST) + Effect `Rpc` (RPC over HTTP)                       |
| Auth                      | [Better Auth](https://www.better-auth.com) 1.6 (email/password)              |
| Frontend                  | React 19, [TanStack Router](https://tanstack.com/router), Vite 8             |
| Styling                   | [Tailwind CSS](https://tailwindcss.com) 4.1                                  |
| Reactive State            | `@effect/atom-react`                                                         |
| Linting                   | [oxlint](https://oxc-project.github.io) (type-aware)                         |
| Formatting                | [oxfmt](https://oxc-project.github.io)                                       |
| Testing                   | [Vitest](https://vitest.dev) 4.1 + `@effect/vitest`                          |

## Project Structure

```
├── apps/
│   ├── server/          # Node.js HTTP API server (composition root)
│   └── web/             # React SPA frontend
├── packages/
│   ├── shared/          # Shared kernel (schemas + tagged errors)
│   ├── contracts/       # HttpApi/Rpc transport contracts
│   ├── domain/          # Business logic (Context services)
│   ├── core/            # Transport handlers
│   ├── db/              # Database layer (Drizzle ORM + Effect)
│   ├── env/             # Typed environment configuration
│   └── auth/            # Better Auth (email/password)
└── repos/
    └── effect/          # Vendored Effect library (read-only reference)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.10
- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL)

### Installation

```bash
# Install dependencies
bun install

# Patch TypeScript/oxlint for tsgo compatibility
bun run prepare
```

### Development

```bash
# Start PostgreSQL container
bun run docker-dev

# Run database migrations
bun run db-migrate

# Seed admin user + sample todos (dev only)
bun run db-seed

# Start all apps in dev mode
bun run dev
```

The server starts at `http://localhost:3101` and the web app at `http://localhost:3100`.

### Database Commands

```bash
bun run db-gen       # Generate migrations
bun run db-migrate   # Run pending migrations
bun run db-push      # Push schema to database
bun run db-seed      # Seed admin user + sample todos (dev only)
bun run db-studio    # Open Drizzle Studio
```

### Lint & Format

```bash
bun run check        # Lint + format everything
```

### Build & Test

```bash
bun run build        # Build all packages/apps
bun run test         # Run all tests
```

### Docker

```bash
bun run docker-build   # Build and start production containers
bun run docker-down    # Stop and remove all containers + volumes
```

## Architecture

### Effect Layer Composition

The entire application is composed via Effect `Layer` composition. Each package exposes a layer (e.g., `DatabaseLayer`, `EnvLive`, `AppLayer`) and dependencies are explicitly provided via `Layer.provide()`. This makes the dependency graph fully explicit and testable.

```
EnvLive → DatabaseLayer → AppLayer → Server
```

### Dual HTTP + RPC Protocol

The API layer is defined once and served simultaneously as both a REST HTTP API and an RPC-over-HTTP endpoint:

- **HTTP REST** — `HttpApi` / `HttpApiBuilder` / `HttpApiGroup` with automatic schema validation
- **RPC** — `Rpc` / `RpcGroup` served at `/rpc` using NDJSON serialization

The frontend uses the RPC protocol exclusively via `AtomRpc.Service`.

### Schema-Driven Validation

All API inputs and outputs are defined using Effect `Schema`. These schemas are shared between HTTP endpoints and RPC procedures, providing automatic request/response validation with full type safety.

### Frontend Reactivity

Instead of traditional React Query/SWR, the frontend uses `@effect/atom-react` with `AtomRpc.Service` to create reactive queries and mutation functions. Atoms automatically track reactivity keys for cache invalidation.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
PORT=3101
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/acme
WEB_PORT=3100
VITE_API_BASE_URL=http://localhost:3101
CORS_ORIGINS=http://localhost:3100
BETTER_AUTH_SECRET=dev-only-change-me-min-32-chars!!
BETTER_AUTH_URL=http://localhost:3101
```

## License

[MIT](LICENSE) — Wellington Costa
