# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoAnime is a Chinese community-focused anime auto-downloader. It integrates with Sonarr (media management) and qBittorrent (downloads) via RSS feed parsing.

## Commands

### Backend
```bash
cd backend
npm run dev          # Development with nodemon hot reload
npm start            # Production

npm run db:generate  # Generate Drizzle migration after schema changes
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema directly (dev only)
npm run db:reset     # Reset database
```

### Frontend
```bash
cd frontend
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
```

### Docker (No need to use and worry about it)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build  # Dev with hot reload
docker-compose up --build                                                    # Production
```

### Add shadcn components
```bash
cd frontend && npx shadcn@latest add <component-name>
```

## Tech Stack Constraints

| Category | Requirement |
|----------|-------------|
| Language | JavaScript only (no TypeScript) |
| UI Components | shadcn/ui only |
| Icons | Lucide React |
| CSS | Tailwind CSS (component-scoped, never modify `index.css`) |

- Minimize new package installations — ask user before adding any
- API docs: Sonarr v3 at `/api_docs/sonarr_v3.json`, qBittorrent v5 at `/api_docs/WebUI-API-(qBittorrent-5.0).md`

## Architecture

**Backend** (`backend/src/`): Express.js MVC pattern
- `routes/` → `controllers/` → `services/` → `db/`
- `rss_parsers/` — Extensible parser system (BaseParser + DmhyParser)
- `enums/` — Constants (RssTemplate, AutoDownloadStatus)
- Settings are encrypted in the `settings` DB table

**Frontend** (`frontend/src/`): React SPA with React Router
- `pages/` — Full page views (Home, RSS, SeriesDetail, Settings)
- `components/` — Reusable UI + shadcn/ui wrappers in `components/ui/`
- `hooks/` — Custom React hooks
- `lib/` — Utilities (cn for className merging)

**Database**: PostgreSQL via Drizzle ORM
- Schema defined in `backend/src/db/schema.js`
- Core tables: `series`, `series_seasons`, `series_episodes`, `series_images`, `rss`, `rss_item`, `qbittorrent_downloads`, `settings`

> ⚠️ **Never write SQL migration files manually** — always use `npx drizzle-kit generate` after editing the schema, then `npm run db:migrate`

## Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health
