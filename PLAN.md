# Series Metadata Enhancement Plan

## Current Missing Database Values
The following fields are missing from series sync and need to be added:
- `season_count`
- `total_episode_count`
- `episode_file_count`

## Proposed Database Schema Additions

Based on the Sonarr API response, enhance the `series` table with the following columns:

### Core Metadata
| Column | Type | Description |
|--------|------|-------------|
| `year` | INTEGER | Release year (e.g., 2023) |
| `ended` | BOOLEAN | Whether the series has ended |
| `genres` | TEXT (JSON array) | List of genres (e.g., ["Adventure", "Animation", "Anime"]) |
| `network` | VARCHAR(255) | Broadcasting network (e.g., "Nippon TV") |
| `runtime` | INTEGER | Episode runtime in minutes |
| `certification` | VARCHAR(50) | Content rating (e.g., "TV-14") |
| `series_type` | VARCHAR(50) | Type of series (e.g., "standard") |

### External IDs
| Column | Type | Description |
|--------|------|-------------|
| `imdb_id` | VARCHAR(20) | IMDb ID (e.g., "tt22248376") |
| `tmdb_id` | INTEGER | TheMovieDB ID |
| `tvdb_id` | INTEGER | TheTVDB ID |
| `tv_maze_id` | INTEGER | TVMaze ID |

### Statistics
| Column | Type | Description |
|--------|------|-------------|
| `season_count` | INTEGER | Number of seasons |
| `episode_count` | INTEGER | Number of monitored episodes |
| `total_episode_count` | INTEGER | Total episodes including unaired |
| `episode_file_count` | INTEGER | Number of downloaded episode files |
| `size_on_disk` | BIGINT | Total size in bytes |
| `percent_of_episodes` | DECIMAL(5,2) | Percentage of episodes downloaded |

### Dates & Airing
| Column | Type | Description |
|--------|------|-------------|
| `first_aired` | TIMESTAMP | First episode air date |
| `last_aired` | TIMESTAMP | Most recent episode air date |
| `next_airing` | TIMESTAMP | Next scheduled episode |
| `previous_airing` | TIMESTAMP | Previous episode air date |
| `air_time` | VARCHAR(10) | Regular air time (e.g., "23:00") |
| `added_at` | TIMESTAMP | When added to Sonarr |

### Ratings
| Column | Type | Description |
|--------|------|-------------|
| `rating_value` | DECIMAL(3,1) | Rating score (e.g., 8.9) |
| `rating_votes` | INTEGER | Number of votes |

### Images (Separate Table: `series_images`)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `series_id` | INTEGER | FK to series |
| `cover_type` | VARCHAR(50) | Type: banner, poster, fanart, clearlogo |
| `url` | TEXT | Local URL path |
| `remote_url` | TEXT | Original remote URL |

### Alternate Titles (Separate Table: `series_alternate_titles`)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `series_id` | INTEGER | FK to series |
| `title` | VARCHAR(500) | Alternate title |
| `scene_season_number` | INTEGER | Associated season (-1 for all) |

### Seasons (Separate Table: `series_seasons`)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key |
| `series_id` | INTEGER | FK to series |
| `season_number` | INTEGER | Season number |
| `monitored` | BOOLEAN | If season is monitored |
| `episode_count` | INTEGER | Episodes in season |
| `episode_file_count` | INTEGER | Downloaded episodes |
| `total_episode_count` | INTEGER | Total episodes |
| `size_on_disk` | BIGINT | Size in bytes |
| `percent_of_episodes` | DECIMAL(5,2) | Download percentage |
| `next_airing` | TIMESTAMP | Next episode air date |
| `previous_airing` | TIMESTAMP | Previous episode air date |

## Implementation Steps

1. [ ] Create database migration for new `series` table columns
2. [ ] Create migration for `series_images` table
3. [ ] Create migration for `series_alternate_titles` table
4. [ ] Create migration for `series_seasons` table
5. [ ] Update `sonarrService.js` to extract and map all new fields
6. [ ] Update Series model to include new fields
7. [ ] Update API endpoints to return enhanced metadata
8. [ ] Update frontend to display new metadata

---

## Reference JSON
<details>
<summary>Click to expand Sonarr API response example</summary>

```json
{
  "id": 1,
  "path": "/media/Frieren - Beyond Journey's End",
  "tags": [],
  "year": 2023,
  "added": "2026-01-31T21:37:29Z",
  "ended": false,
  "title": "Frieren: Beyond Journey's End",
  "genres": ["Adventure", "Animation", "Anime", "Drama", "Fantasy"],
  "images": [
    {
      "url": "/MediaCover/1/banner.jpg",
      "coverType": "banner",
      "remoteUrl": "https://artworks.thetvdb.com/..."
    }
  ],
  "imdbId": "tt22248376",
  "status": "continuing",
  "tmdbId": 209867,
  "tvdbId": 424536,
  "airTime": "23:00",
  "network": "Nippon TV",
  "ratings": {"value": 8.9, "votes": 65333},
  "runtime": 25,
  "seasons": [...],
  "overview": "...",
  "statistics": {
    "sizeOnDisk": 0,
    "seasonCount": 2,
    "episodeCount": 31,
    "releaseGroups": [],
    "episodeFileCount": 0,
    "percentOfEpisodes": 0,
    "totalEpisodeCount": 60
  },
  "certification": "TV-14",
  "alternateTitles": [...]
}
```
</details>