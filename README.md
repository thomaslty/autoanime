# AutoAnime

Chinese Community focused anime auto download tool.

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

Run the entire stack with Docker:

```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build
```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health Check: http://localhost:3000/health

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api` | GET | API info |
| `/api/rss` | GET | List all RSS feeds |
| `/api/rss/:id` | GET | Get RSS feed by ID |
| `/api/rss` | POST | Create RSS feed |
| `/api/rss/:id` | PUT | Update RSS feed |
| `/api/rss/:id` | DELETE | Delete RSS feed |
| `/api/rss/:id/refresh` | POST | Refresh RSS feed |
| `/api/sonarr/status` | GET | Sonarr connection status |
| `/api/sonarr/series` | GET | List Sonarr series |
| `/api/sonarr/series` | POST | Add series to Sonarr |

## Project Structure

```
autoanime/
├── frontend/                 # Vite + React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── app.js
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

## License

MIT
