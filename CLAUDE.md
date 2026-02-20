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

### Backend Tests (Jest)
```bash
cd backend
npm test                              # Run all tests
npm test -- --testPathPattern=regex   # Run tests matching pattern
npm test -- test/utils/regexHelper    # Run a specific test file
npm run test:watch                    # Watch mode
```

### Frontend
```bash
cd frontend
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build
npm run lint         # ESLint
```

### Frontend Tests (Playwright)
```bash
cd frontend
npx playwright test                                    # Run all e2e tests
npx playwright test test/settings-connection.spec.js   # Run specific test file
npx playwright test --headed                           # Run with browser visible
```
Requires the app running on `http://localhost:3000` (Docker production build).

### Docker
```bash
docker compose down && docker compose up --build   # Rebuild and test (standard dev procedure)
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

### Backend (`backend/src/`)

Express.js MVC pattern: `routes/` → `controllers/` → `services/` → `db/`

- New route files must be registered in `routes/index.js`
- `rss_parsers/` — Pluggable parser system (BaseParser + DmhyParser); `getParser(templateId)` returns parser
- `enums/` — Constants (RssTemplate, AutoDownloadStatus)
- `utils/regexHelper.js` — Custom RSS regex syntax (see Custom Regex below)
- `utils/magnetHelper.js` — Magnet link / info hash parsing
- Settings stored encrypted in the `settings` DB table via `configService`

**Scheduler System** (`services/schedulerManager.js`): Uses `toad-scheduler` with `SimpleIntervalJob`. All jobs use `preventOverrun: true`. Jobs check service availability via `connectionMonitor` before running.

| Job | Interval | Purpose |
|-----|----------|---------|
| health-check | 30s | Check DB/Sonarr/qBit, broadcast status via Socket.IO |
| rss-fetch | 60s | Fetch overdue RSS feeds, parse items, store in DB |
| rss-matching | 60s | Match RSS items to episodes using custom regex configs |
| download-trigger | 60s | Find matched episodes and send magnets to qBittorrent |
| download-sync | 10s | Sync download statuses from qBittorrent back to DB |

**WebSocket** (`socket.js`): Socket.IO events:
- `services:status` — Broadcast service health (sent on connect + on state change)
- `watch:series` / `unwatch:series` — Client joins/leaves room `series:${seriesId}`
- `download:status-updated` — Real-time download progress to series rooms

### Frontend (`frontend/src/`)

React SPA with React Router (`App.jsx`):
- `pages/` — Full page views (Home, SeriesDetail, RSS*, Settings)
- `components/Layout.jsx` — Sidebar + connection status alert (WebSocket-driven)
- `hooks/useSocket.js` — Socket.IO singleton with auto-reconnect (1s→5s backoff)
- `hooks/useDownloadStatus.js` — Real-time download updates per series via Socket.IO rooms
- `components/ui/` — shadcn/ui components

### Database (PostgreSQL via Drizzle ORM)

Schema: `backend/src/db/schema.js`

> **Table ordering matters**: Referenced tables must be defined BEFORE tables that reference them in `schema.js`. Dependency chain: `rss` → `rss_config` → `series` → `series_seasons`

Core tables: `series`, `series_seasons`, `series_episodes`, `series_metadata`, `series_images`, `series_alternate_titles`, `rss`, `rss_item`, `rss_config`, `downloads`, `settings`, `download_status`, `rss_template`

Key relationships:
- `rss_config.rss_source_id` → `rss.id`
- `series.rss_config_id` → `rss_config.id` (series-level RSS assignment)
- `series_seasons.rss_config_id` → `rss_config.id` (season-level override)
- `series_episodes.rss_item_id` → `rss_item.id` (matched RSS item)

> ⚠️ **Never write SQL migration files manually** — always use `npx drizzle-kit generate` after editing the schema, then `npm run db:migrate`

> ⚠️ **Drizzle ORM `.where()` replacement bug**: Chaining multiple `.where()` calls does **NOT** AND them together — the second `.where()` **replaces** the first. Always combine conditions in a single `.where(and(...))` call:
> ```js
> // BAD — second .where() silently replaces the first
> let query = db.select().from(table).where(eq(table.col, 'a'));
> query = query.where(eq(table.col2, 'b')); // col='a' filter is LOST
>
> // GOOD — use and() to combine conditions
> const conditions = [eq(table.col, 'a')];
> if (someCondition) conditions.push(eq(table.col2, 'b'));
> const query = db.select().from(table).where(and(...conditions));
> ```

## Core Feature: RSS Auto-Download Flow

The main feature is a 4-phase pipeline running on scheduled intervals:

1. **Fetch** (rssFetchSchedulerService) — Fetch RSS feeds, parse XML with pluggable parsers, store new items
2. **Match** (rssMatchingSchedulerService) — For each series/season with an `rss_config`, convert custom regex to standard regex, test against RSS items, extract episode numbers, apply offset, link matched items to episodes
3. **Trigger** (downloadSchedulerService) — Find episodes with RSS matches but no downloads, send magnet links to qBittorrent, create download records
4. **Sync** (downloadSyncSchedulerService) — Poll qBittorrent for torrent status, update DB, broadcast progress to WebSocket clients

## Custom Regex Syntax

RSS configs use a simplified regex syntax (NOT standard regex), defined in `utils/regexHelper.js`:
- `:ep:` — Episode number placeholder (**mandatory**, validated by `validateCustomRegex()`)
- `:*:` — Wildcard for any characters (converted to `.*`)
- All other characters are escaped as literals

**Offset calculation** (for series where RSS episode numbering differs from Sonarr):
- RSS → Sonarr: `actualEpisode = rssEpisode - offset`
- Sonarr → RSS: `effectiveEpisode = sonarrEpisode + offset`

## E2E Pipeline Test (Playwright)

Full auto-download pipeline test in `frontend/test/e2e-pipeline.spec.js`. Tests run sequentially (`test.describe.serial()`) — each phase builds on the previous.

**Prerequisites:** Docker stack running, all services healthy (PostgreSQL, Sonarr, qBittorrent), Sonarr has "Frieren: Beyond Journey's End" in library, Playwright installed.

**Setup:**
```bash
docker compose down && docker compose up --build -d
# Reset DB to clean state
docker exec autoanime node scripts/db-reset.js --force
docker exec autoanime node scripts/migrate.js
```

**Test phases (sequential):**

| Phase | What it does |
|-------|-------------|
| 1. DB Verification | Confirm all tables exist and are empty after reset |
| 2. Service Health | Sidebar shows 3 green connection indicators |
| 3. Series Sync | Sync All from Sonarr, search for "Frieren" |
| 4. RSS Source | Add dmhy RSS feed (`葬送的芙莉蓮 S2`), fetch items, verify non-empty |
| 5. RSS Config | Add config with regex `[葬送的芙莉蓮 / Sousou no Frieren][:ep:][1080p][繁日雙語]`, offset 28, preview matches |
| 6. Series RSS | Assign config to Frieren Season 2, verify matches, apply matches, enable auto-download |
| 7. Download Monitor | Wait for scheduler to trigger downloads (120s timeout), monitor progress (300s timeout) |
| 8. Download Verify | Check DB for download records, verify files in `./qbit_download/` and `./sonarr/media/` |

**Key timeouts:**
- Sonarr sync: 60s
- RSS fetch: 30s
- Download trigger: 120s
- Torrent completion: 300s

**Implementation notes:**
- Tests must run in serial mode (state accumulates intentionally)
- Use Postgres MCP `execute_sql` for independent DB verification
- Use `waitForLoadState('networkidle')` and explicit `waitForSelector`/`waitForResponse` for async operations
- Increase Playwright global timeout to 120s; per-test `test.setTimeout()` for download tests (300s)

**Test file structure:**
```
frontend/test/
├── e2e-pipeline.spec.js          # Full pipeline test (serial)
├── settings-connection.spec.js   # Connection settings tests
└── homepage-filters.spec.js      # Filter persistence tests
```

## Dev Procedure

After finishing coding, rebuild and test with Docker:
```bash
docker compose down && docker compose up --build
```

## Access Points

- App (Docker production): http://localhost:3000 (nginx serves frontend + proxies API)
- Frontend dev server: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/health
