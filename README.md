# Aster

Aster is a technology intelligence and discovery platform that helps developers understand what technologies do and how they connect.

## Project status

The application includes Explore, technology profiles, Compare, and Ecosystem experiences. These experiences now read catalogue data from an Express REST API backed by PostgreSQL. Supabase provides the managed PostgreSQL database; this repository does not install or run a local PostgreSQL server.

## Stack

- React, TypeScript, and Vite client
- Express and TypeScript REST API
- Supabase hosted PostgreSQL, accessed by the API with `pg`

## Requirements

- Node.js 22 or newer and npm
- A Supabase project with a PostgreSQL connection string

## Setup

Install dependencies and create a local environment file:

```sh
npm install
cp .env.example .env
```

In Supabase Dashboard, open **Connect** and copy a PostgreSQL connection string into `DATABASE_URL` in `.env`. Use a connection method appropriate for your deployment (for local development, Supabase's session pooler is suitable when direct IPv6 connectivity is unavailable). Keep `.env` private and URL-encode any reserved characters in the password. The example enables SSL with `sslmode=require`.

Apply the schema and load the curated catalogue:

```sh
npm run db:migrate
npm run db:seed
```

The seed command synchronizes Aster's current curated catalogue and is intended for development setup. Do not point it at a production database with data you need to preserve.

Start both the API and Vite client:

```sh
npm run dev
```

The client runs at the Vite URL shown in the terminal and proxies `/api` to `http://127.0.0.1:3001`. Alternatively, use `npm run dev:api` and `npm run dev:client` separately. Configure `API_PORT`, `API_HOST`, `CLIENT_ORIGINS`, or `VITE_API_PROXY_TARGET` in `.env` when needed.

## API

The versioned API is served under `/api/v1`:

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | API and database health check |
| `GET /technologies` | Search, filter, sort by name, and paginate catalogue entries |
| `GET /technologies/:slug` | Retrieve one technology and its use cases/resources |
| `GET /technologies/:slug/relationships` | Retrieve its typed incoming and outgoing relationships |

List parameters are `search`, `category`, `type`, `ecosystem`, `sort=name`, `order=asc|desc`, `page`, and `limit` (maximum 100). Values are validated by the API; database queries use positional parameters.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The integration test suite uses `DATABASE_URL_TEST`, not `DATABASE_URL`. It creates a temporary schema, runs migrations and seeding there, checks relational constraints, then drops that schema. Set it to a separate Supabase test project/database before running the database integration test. Without it, that test is skipped while API and model tests still run.

## License

This project is licensed under the [MIT License](LICENSE).
