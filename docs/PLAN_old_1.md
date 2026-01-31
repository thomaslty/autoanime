# Frontend
## Home page
### Main 
- left 30% - navigation menu (collapsible)
- right 70%
  - wallpaper poster board, like sonarr or jellyfin
  - the poster board data is coming from Sonarr
  - color schema
    - green: auto download enabled, no error, in-progress
    - blue: series end
    - yellow: warning, auto download enabled, in-progress, maybe some episode need manual fix / missing
    - red: disabled, error

### Inner page (when click into an animate)
- a new page, not a modal
- show basic info from sonarr, like animate name, series, etc
- leave others blank, I'll figure out later

## RSS Management page
### Main source config page
- a table with rss source
  - id, name, url, edit
- a top control bar for table control
  - add, edit, disable, delete

### Animate Specific RSS config page
- a table with animate specific rss source
  - id, name, linked animate, url, edit
- a top control bar for table control
  - add, edit, disable, delete


## Setting page
- System status
  - backend connection status
  - database connection status
  - sonarr connection status
  - qbittorrent connection status
- Sonarr connection config
- qBittorrent connection config



# Backend
## Sonarr integration
- grab current tracking anime from sonarr, for home page
  - auto refresh
  - save to database

## qBittorrent integration
- initial new download to qbittorrent
  - using magnet link, custom category, eg "autoanime"
  - save the record to database for autoanime to track

- monitor download status
  - tracks enabled animate and its download status
  - in database

- post download operation
  - Copy anime & corresponding series / season to sonarr data folder
  - Rename anime file in "<Season><Episode>.<extension>" format, eg "S01E01.mp4"
  - trigger sonarr refresh for that anime using sonarr api
  - trigger sonarr rename feature using sonarr api
  - (optional) trigger qbittorrent delete api (also remove file from disk if api has this feature)

## RSS
- auto fetch 
- deduplication
- save to database
  - add index

# Database
- postgres database
- use ORM for query management and migration management, like Drizzle ORM
- create table accordingly
- add index / composit index accordingly