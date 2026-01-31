# Agent Guidelines

## Tech Stack

| Category | Requirement |
|----------|-------------|
| Language | JavaScript only (no TypeScript) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) only |
| Icons | Lucide React |
| CSS | Tailwind CSS (component-scoped, don't modify `index.css`) |

## API References

- **Sonarr**: v3 — see `/api_docs/sonarr_v3.json`
- **qBittorrent**: v5 — see `/api_docs/WebUI-API-(qBittorrent-5.0).md`
- **Library docs**: Use `context7` tools

## Package Management

- Minimize new package installations — ask user before adding
- **shadcn components**: `cd frontend && npx shadcn@latest add <component-name>`

## Database (Drizzle ORM)

> ⚠️ **Never write SQL migration files manually** — they require snapshot files only drizzle-kit can generate

1. Edit schema: `backend/src/db/schema.js`
2. Generate migration: `cd backend && npx drizzle-kit generate`
3. Apply migration: `npm run db:migrate`