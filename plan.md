# AutoAnime
Chinese Community focused anime auto download tool

## Original Issue
This is a project that try to enhance AutoBangumi, with
- support custom rss feed (other than Mikan Project)
- support sonarr

In addition, I would like solve the pain point that XArr-Rss have:
- premium plan
- qbittorrent rename buggy
- sonarr integration buggy

## Feature
### RSS Parser
- predefined rss feed, with predefined rss parser (this is similar to AutoBangumi)
- custom rss feed, with custom rss parser (code your self / plugin system)

### Sonarr Integration
- Integrate with sonarr, no need to reinvent the wheels (AutoBangumi is sort of reinventing the wheels)

### Qbittorrent Integration
- This part need research, because qbittorrent download is usually triggered by Sonarr, but chinese animate have different title name in torrent, that makes sonarr not able to recognize (I think this is the main reason that AutoBangumi have their own integration, instead of using Sonarr)

### AI Feature (Optional / Phase 2)
- RSS parsing
- New anime push notification
  - Auto add new anime
  - Auto create parsing rules


## Architecture
### Frontend
- Vite + React (javascript only, typescript is prohibited)
- Shadcn for UI Component

### Backend
- Javascript nodejs framework
- Express.js (javascript only, typescript is prohibited)

### Database
- PostgresSQL

### Deployment
- Docker
  - Dockerfile
  - Docker Compose