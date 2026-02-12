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

## Screenshots
### Home Page
![home page](/images/homepage.jpg)

### Series Detail Page
![series detail page](/images/series_detail_page.JPG)
![configure rss](/images/series_detail_configure_rss.JPG)
![preview rss matches](/images/preview_rss_matches.JPG)

### RSS Config
![RSS Config](/images/add_rss_feed.JPG)

### Anime Specific Regex
![Anime Config](/images/add_anime_config.JPG)

### Settings
![Settings](/images/settings.JPG)


## Getting Started

Docker compose is the recommended way to run the application.
```
services:
  autoanime:
    image: ghcr.io/thomaslty/autoanime:latest
    container_name: autoanime
    ports:
      - "3000:3000"
    environment:
      - PUID=${PUID:-1000}
      - PGID=${PGID:-1000}
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://autoanime:autoanime@postgres:5432/autoanime

      # Optional, can be set in the UI
      - SONARR_URL=${SONARR_URL:-http://sonarr:8989}
      - SONARR_API_KEY=${SONARR_API_KEY:-}
      - QBITTORRENT_URL=${QBITTORRENT_URL:-http://qbittorrent:8080}
      - QBITTORRENT_USERNAME=${QBITTORRENT_USERNAME:-admin}
      - QBITTORRENT_PASSWORD=${QBITTORRENT_PASSWORD:-adminadmin}
    volumes:
      - ./sonarr/media:/media # your sonarr media folder
      - ./qbit_download:/downloads # your qbittorrent download folder
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - autoanime-network
    extra_hosts:
      - "host.docker.internal:host-gateway"

  postgres:
    image: postgres:16-alpine
    container_name: autoanime-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=autoanime
      - POSTGRES_PASSWORD=autoanime
      - POSTGRES_DB=autoanime
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U autoanime"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - autoanime-network

volumes:
  postgres_data:

networks:
  autoanime-network:
    driver: bridge
```

Create environment file (.env) with the following variables
or you can remove all the environment variables and setup in the UI.
```
SONARR_URL=http://host.docker.internal:8989
SONARR_API_KEY=your_sonarr_api_key_here
QBITTORRENT_URL=http://host.docker.internal:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminadmin
```

## Development

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
