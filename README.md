# WASEL

WASEL is a modular-monolith delivery operations platform for Moroccan merchants, internal fleet dispatch, COD collection, settlements, and customer tracking.

## Status

Foundation bootstrap in progress. Database execution is not yet verified.

## Planned stack

- Next.js App Router and TypeScript strict mode
- PostgreSQL with Prisma and Row Level Security
- Zod validation
- Vitest and Playwright
- Tailwind CSS v4

## Security principles

- Tenant context is derived from authenticated sessions or API keys.
- Tenant isolation is enforced by application context, transaction-local PostgreSQL settings, and PostgreSQL RLS.
- Monetary values use decimal NUMERIC(12,2) semantics and MAD by default.
- State history is append-only.

See `ASSUMPTIONS.md` for initial decisions and known blockers.
