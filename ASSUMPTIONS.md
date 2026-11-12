# WASEL assumptions

## Initial implementation decisions

1. The application is a modular monolith using Next.js App Router, TypeScript, Prisma, PostgreSQL, and Supabase-hosted PostgreSQL.
2. Supabase project `lpeyblqbctglgqmtyrgs` is the connected database target. It is currently inactive, so migrations and runtime database verification are blocked until it is restored.
3. The existing repository was empty. This bootstrap establishes conventions without replacing existing application behavior.
4. The initial implementation will use npm scripts for type-checking, linting, formatting, unit tests, and development.
5. The first executable slice will establish configuration validation, the money module, tenant context seams, and Prisma schema foundations before UI workflows.
6. No external provider is considered configured until real credentials are supplied and the integration is exercised.
7. Development seed data will be guarded against `NODE_ENV=production` and will be added only after the schema and migration path are verified.

## Known blockers

- Supabase project status is currently `INACTIVE`; database migrations and RLS tests are not yet verified.
- GitHub connector writes individual files, so the bootstrap files may appear as separate commits rather than one atomic commit.
- No application runtime has been executed yet because this phase only bootstraps repository files.
