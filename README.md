# AutoAnime

Chinese Community focused anime auto download tool.

## Motivation
Similar project that does not fit all my needs:
- **AutoBangumi**: Mature but heavily depends on Mikan Project
  - I would like to use dhmy as main source
  - and pick my favorite sub-group
- **xarr-rss**: Exactly what I needed but
  - have premium subscription
  - author banned my ip, I cannot login, thus cannot use the app.

## Features

- **RSS Parser**: Support for predefined and custom RSS feeds
- **Sonarr Integration**: Seamless integration with Sonarr for media management
- **qBittorrent Integration**: Download management (coming soon)
- **AI Features**: Intelligent RSS parsing and notifications (Phase 2)

## Tech Stack

- **Frontend**: Vite + React (JavaScript)
- **Backend**: Express.js (JavaScript)
- **Database**: PostgreSQL
- **Deployment**: Docker

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd autoanime
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

### Docker Development
```bash
docker compose up -d --build
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## Project Structure

```
autoanime/
├── frontend/                 # React SPA with React Router
│   ├── src/
│   │   ├── components/      # Reusable UI + shadcn/ui wrappers in components/ui/
│   │   ├── pages/           # Full page views (Home, RSS, SeriesDetail, Settings)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities (cn for className merging)
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── backend/                  # Express.js MVC pattern
│   ├── src/
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── db/              # Drizzle ORM schema and migrations
│   │   ├── rss_parsers/     # Extensible parser system (BaseParser + DmhyParser)
│   │   ├── enums/           # Constants (RssTemplate, AutoDownloadStatus)
│   │   ├── middleware/
│   │   ├── config/
│   │   └── app.js
│
├── api_docs/                 # API documentation
├── docker-compose.yml
└── .env.example
```

**Database**: PostgreSQL via Drizzle ORM
- Schema: `backend/src/db/schema.js`
- Core tables: `series`, `series_seasons`, `series_episodes`, `series_images`, `rss`, `rss_item`, `qbittorrent_downloads`, `settings`

## License

MIT
