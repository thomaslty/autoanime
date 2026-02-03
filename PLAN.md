# RSS System Redesign Plan

> **Last Updated:** 2026-02-03

## Overview

Redesign the RSS database schema to support template-based parsing for different RSS sources (e.g., dmhy, nyaa). The new design separates RSS feed configuration from parsed items and uses a template system for site-specific XML parsing.

---

## Phase 1: Database Schema Changes

### 1.1 Remove Old Tables
Remove the following deprecated tables from `backend/src/db/schema.js`:
- [ ] `rss_sources` 
- [ ] `rss_feed_items`
- [ ] `rss_anime_configs`

### 1.2 Create RSS Template Enum
Create `backend/src/enums/rssTemplate.js`:

```javascript
const RssTemplate = {
  CUSTOM: 0,  // User-defined parsing rules
  DMHY: 1,    // 動漫花園 (share.dmhy.org)
};
```

### 1.3 Create New `rss` Table
Parent table for RSS feed configurations.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| name | varchar | Feed display name |
| description | text | Optional description |
| url | varchar | RSS feed URL |
| template_id | integer | References `RssTemplate` enum |
| is_enabled | boolean | Default true |
| last_fetched_at | timestamp | Last successful fetch |
| created_at | timestamp | |
| updated_at | timestamp | |

### 1.4 Create New `rss_item` Table  
Stores parsed RSS entries with normalized fields.

| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| rss_id | integer | FK to `rss.id` |
| guid | varchar | Hashed unique identifier |
| title | text | Item title |
| description | text | Item description/summary |
| link | varchar | Original item URL |
| published_date | timestamp | Publication date |
| magnet_link | text | Extracted magnet URI |
| author | varchar | Uploader/author |
| category | varchar | Category tag |
| created_at | timestamp | |

**Indexes:**
- `idx_rss_item_rss_id` on `rss_id`
- `idx_rss_item_guid` on `guid` (unique constraint)
- `idx_rss_item_published` on `published_date`

---

## Phase 2: Backend Implementation

### 2.1 Create RSS Parser Module
Create `backend/src/rss_parsers/` folder structure:

```
backend/src/rss_parsers/
├── index.js          # Parser registry/factory
├── baseParser.js     # Base parser class
└── dmhyParser.js     # DMHY-specific parser
```

### 2.2 DMHY Parser Specification

**XML Item to Database Mapping:**

| XML Element | DB Column | Transform |
|-------------|-----------|-----------|
| `<title>` | title | Extract from CDATA |
| `<link>` | link | Direct |
| `<pubDate>` | published_date | Parse date |
| `<description>` | description | Extract from CDATA |
| `<enclosure url="...">` | magnet_link | Extract `url` attribute |
| `<author>` | author | Extract from CDATA |
| `<category>` | category | Extract from CDATA |
| `<guid>` | guid | Hash the value for uniqueness |

**Parser Requirements:**
- Handle CDATA sections properly
- Deduplicate based on hashed `guid`
- Extract magnet link from `<enclosure>` element's `url` attribute
- Parse dates with timezone support (+0800 for dmhy)

### 2.3 Update RSS Service
Refactor `backend/src/services/rssService.js`:
- [ ] Import new schema tables (`rss`, `rssItem`)
- [ ] Use parser factory to select parser by `template_id`
- [ ] Update CRUD operations for new table structure
- [ ] Implement `fetchAndParseRss(rssId)` with template-based parsing

### 2.4 Update RSS Controller & Routes
Update `backend/src/controllers/rssController.js` and `backend/src/routes/rss.js`:
- [ ] Add `template_id` to create/update endpoints
- [ ] Add endpoint to list available templates

---

## Phase 3: Migration

### 3.1 Generate Migration
```bash
cd backend && npx drizzle-kit generate
```

### 3.2 Apply Migration
```bash
npm run db:migrate
```

> **Note:** This is a breaking change. Old RSS data will be lost. Consider data export if needed.

---

## Phase 4: Frontend Updates

### 4.1 Update RSSSourcesPage
Update `frontend/src/pages/RSSSourcesPage.jsx`:
- [ ] Add template selector dropdown in add/edit modal
- [ ] Display template name in sources table
- [ ] Update API calls to match new endpoints

### 4.2 API Endpoint Changes

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `GET /api/rss/sources` | `GET /api/rss` |
| `POST /api/rss/sources` | `POST /api/rss` |
| `PUT /api/rss/sources/:id` | `PUT /api/rss/:id` |
| `DELETE /api/rss/sources/:id` | `DELETE /api/rss/:id` |
| `POST /api/rss/sources/:id/fetch` | `POST /api/rss/:id/fetch` |
| `POST /api/rss/sources/:id/toggle` | `POST /api/rss/:id/toggle` |
| - | `GET /api/rss/templates` (new) |
| - | `GET /api/rss/:id/items` (new) |

---

## Reference: DMHY XML Structure

### RSS Channel Header
```xml
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
<channel>
  <title><![CDATA[ 動漫花園資源網 ]]></title>
  <link>http://share.dmhy.org</link>
  <description><![CDATA[ 動漫花園資訊網... ]]></description>
  <language>zh-cn</language>
  <pubDate>Tue, 03 Feb 2026 10:49:07 +0800</pubDate>
```

### RSS Item Example
```xml
<item>
  <title><![CDATA[ 【幻櫻字幕組】【1月新番】【黃金神威 Golden Kamuy】【54】【BIG5_MP4】【1280X720】 ]]></title>
  <link>http://share.dmhy.org/topics/view/712530_1_Golden_Kamuy_54_BIG5_MP4_1280X720.html</link>
  <pubDate>Tue, 03 Feb 2026 02:53:40 +0800</pubDate>
  <description><![CDATA[ <p>...</p> ]]></description>
  <enclosure url="magnet:?xt=urn:btih:GEFRQFDYBFEEPFJ7ZC5MYDXGIAJKGFGO&..." length="1" type="application/x-bittorrent"/>
  <author><![CDATA[ summer1278 ]]></author>
  <guid isPermaLink="true">http://share.dmhy.org/topics/view/712530_...</guid>
  <category domain="http://share.dmhy.org/topics/list/sort_id/2"><![CDATA[ 動畫 ]]></category>
</item>
```

---

## Implementation Checklist

### Database
- [ ] Create `rssTemplate.js` enum file
- [ ] Update `schema.js` - remove old tables
- [ ] Update `schema.js` - add new `rss` table
- [ ] Update `schema.js` - add new `rss_item` table
- [ ] Generate and apply migration

### Backend
- [ ] Create `rss_parsers/` directory
- [ ] Implement `baseParser.js`
- [ ] Implement `dmhyParser.js`
- [ ] Implement parser factory in `index.js`
- [ ] Update `rssService.js` for new schema
- [ ] Update `rssController.js` for new endpoints
- [ ] Update `rss.js` routes

### Frontend  
- [ ] Update `RSSSourcesPage.jsx` with template selector
- [ ] Update API endpoint paths
- [ ] Add RSS items view page (optional)

---

## Future Enhancements
- [ ] Add more RSS templates (nyaa, acg.rip, etc.)
- [ ] Custom parsing rules UI for `CUSTOM` template
- [ ] RSS item search/filter functionality
- [ ] Auto-match RSS items to Sonarr series