# Per-Anime RSS Filtering Feature

## Overview
Implement per-anime and per-season RSS filtering to enable automatic download of specific anime episodes based on customizable regex patterns. Each series/season can have its own RSS configuration that filters RSS items by matching titles against user-defined regex patterns.

## Goals
- Allow users to create reusable RSS filter configurations with regex patterns
- Assign RSS configs to specific series or seasons for targeted auto-download
- Preview filtered RSS items before enabling auto-download
- Integrate configuration into the series detail page

---

## Database Changes

### New Table: `rss_config`
Stores reusable RSS filter configurations.

| Column       | Type         | Description                              |
|--------------|--------------|------------------------------------------|
| id           | serial PK    | Primary key                              |
| name         | varchar      | User-friendly name (e.g., "Blue Lock S2")|
| description  | text         | Optional description                     |
| regex        | text         | Regex pattern to filter RSS item titles  |
| rss_source_id| integer FK   | Reference to the `rss` table (source)    |
| is_enabled   | boolean      | Whether this config is active            |
| created_at   | timestamp    | Creation timestamp                       |
| updated_at   | timestamp    | Last update timestamp                    |

### Modify Table: `series`
Add column to link series to an RSS config.

| Column        | Type       | Description                               |
|---------------|------------|-------------------------------------------|
| rss_config_id | integer FK | Nullable FK to `rss_config` for auto-download |

### Modify Table: `series_seasons`
Add column for season-specific RSS config overrides.

| Column        | Type       | Description                               |
|---------------|------------|-------------------------------------------|
| rss_config_id | integer FK | Nullable FK to `rss_config` (overrides series-level) |

---

## Backend Implementation

### API Endpoints

#### RSS Config CRUD
| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/rss-config`           | List all RSS configs                 |
| GET    | `/api/rss-config/:id`       | Get single RSS config with preview   |
| POST   | `/api/rss-config`           | Create new RSS config                |
| PUT    | `/api/rss-config/:id`       | Update RSS config                    |
| DELETE | `/api/rss-config/:id`       | Delete RSS config                    |

#### RSS Config Assignment
| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| PUT    | `/api/series/:id/rss-config`          | Assign RSS config to series        |
| PUT    | `/api/series/:id/seasons/:num/rss-config` | Assign RSS config to season    |

#### Preview Endpoint
| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| POST   | `/api/rss-config/preview`             | Preview filtered RSS items by regex |

### New Files
- `backend/src/controllers/rssConfigController.js`
- `backend/src/services/rssConfigService.js`
- `backend/src/routes/rssConfig.js`

### Modify Existing Files
- `backend/src/db/schema.js` - Add `rss_config` table and FK columns
- `backend/src/services/rssSchedulerService.js` - Use RSS configs for filtering
- `backend/src/routes/index.js` - Register new routes

### Auto-Download Logic
When the RSS scheduler fetches new items:
1. For each series with `is_auto_download_enabled = true`:
   - Get the effective RSS config (season-level overrides series-level)
   - Fetch items from the RSS source linked to the config
   - Filter items matching the regex pattern
   - Trigger download for matching items via qBittorrent

---

## Frontend Implementation

### New Page: RSS Config Management
Enhance existing `RSSAnimeConfigsPage.jsx` or create dedicated management UI.

**Features:**
- Create/edit/delete RSS configs
- Regex input with live validation
- Select RSS source from dropdown
- Preview filtered items in real-time

### Series Detail Page Integration
Add RSS config assignment to `SeriesDetailPage.jsx`.

**Changes:**
- Add "Actions" dropdown button with:
  - Refresh (existing)
  - Configure RSS (opens modal)
- Modal component for RSS config assignment:
  - Series-level config selector
  - Per-season config override option
  - Create new config inline
  - Preview filtered items

### UI Components
- RSS Config assignment modal
- Season-specific config override UI
- Filtered RSS items preview card

---

## Implementation Order

### Phase 1: Database & Backend
1. [ ] Add `rss_config` table to schema
2. [ ] Add `rss_config_id` FK to `series` table
3. [ ] Add `rss_config_id` FK to `series_seasons` table
4. [ ] Generate and run migrations
5. [ ] Create RSS config service and controller
6. [ ] Add API routes for RSS config CRUD
7. [ ] Add preview endpoint for regex testing
8. [ ] Add series config assignment endpoints

### Phase 2: Frontend
1. [ ] Create RSS config management components
2. [ ] Add RSS config assignment modal
3. [ ] Integrate modal into series detail page
4. [ ] Add season-specific override UI
5. [ ] Implement filtered items preview

### Phase 3: Auto-Download Integration
1. [ ] Update RSS scheduler to use configs for filtering
2. [ ] Implement download trigger for matched items
3. [ ] Add download status tracking
4. [ ] Test end-to-end auto-download flow

---

## Verification Plan

### Manual Testing
1. **Create RSS Config**: Create a new config with regex pattern
2. **Preview Filter**: Verify regex correctly filters RSS items
3. **Assign to Series**: Assign config to a series and verify persistence
4. **Season Override**: Set different config for a season, verify it takes precedence
5. **Auto-Download**: Enable auto-download, verify correct items are downloaded

### Database Verification
```sql
-- Verify tables created
SELECT * FROM rss_config;
SELECT rss_config_id FROM series WHERE id = 1;
SELECT rss_config_id FROM series_seasons WHERE series_id = 1;
```

---

## RSS Parser Refactoring Plan

### Issue
The current RSS parsers use regex patterns to extract data from XML feeds. This approach is error-prone and has caused bugs:
- **Bug**: First RSS item was skipped because regex didn't account for whitespace/newlines between XML tags and CDATA sections
- **Root Cause**: Regex like `<title><![CDATA[...` failed when XML had `<title>\n<![CDATA[...`
- **Limitation**: Regex-based XML parsing is fragile and hard to maintain

### Solution
Refactor all RSS parsers to use a proper XML parsing library (`fast-xml-parser`) instead of regex.

### Implementation

#### 1. Install XML Library
```bash
cd backend
npm install fast-xml-parser
```

#### 2. Refactor Base Parser
**File**: `backend/src/rss_parsers/baseParser.js`

```javascript
const { XMLParser } = require('fast-xml-parser');

class BaseParser {
  constructor() {
    this.name = 'BaseParser';
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      cdataPropName: '#cdata',
      trimValues: true
    });
  }

  parse(xml) {
    throw new Error('parse() must be implemented by subclass');
  }

  parseXml(xml) {
    return this.parser.parse(xml);
  }

  extractText(node) {
    if (!node) return '';
    if (typeof node === 'string') return node.trim();
    if (node['#cdata']) return node['#cdata'].trim();
    if (node['#text']) return node['#text'].trim();
    return '';
  }

  // ... keep existing hashGuid and parseDate methods
}
```

#### 3. Refactor DMHY Parser
**File**: `backend/src/rss_parsers/dmhyParser.js`

```javascript
const { BaseParser } = require('./baseParser');

class DmhyParser extends BaseParser {
  constructor() {
    super();
    this.name = 'DmhyParser';
  }

  parse(xml) {
    const parsed = this.parseXml(xml);
    const items = [];
    
    const channel = parsed?.rss?.channel;
    if (!channel) return items;
    
    const rssItems = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
    
    for (const item of rssItems) {
      const title = this.extractText(item.title);
      const link = this.extractText(item.link);
      const publishedDate = this.parseDate(this.extractText(item.pubDate));
      const description = this.extractText(item.description);
      const magnetLink = item.enclosure?.['@_url'] || '';
      const author = this.extractText(item.author);
      const category = this.extractText(item.category);
      const guidValue = this.extractText(item.guid) || link;
      const guid = this.hashGuid(guidValue);

      if (link || guid) {
        items.push({
          guid, title, description, link,
          publishedDate, magnetLink, author, category
        });
      }
    }
    
    return items;
  }
}
```

### Tasks

#### Phase 1: Setup
- [x] Install `fast-xml-parser` npm package
- [x] Update `baseParser.js` to include XML parser instance
- [x] Add helper method `parseXml()` and `extractText()` to base parser

#### Phase 2: Parser Refactoring
- [x] Refactor `dmhyParser.js` to use XML parser
- [x] Remove regex patterns from DMHY parser
- [x] Handle edge cases (missing fields, malformed XML)

#### Phase 3: Testing
- [x] Test with sample RSS feed from DMHY
- [x] Verify all items are correctly parsed (including first item)
- [x] Test error handling for malformed XML
- [x] Verify existing RSS items continue to work

### Benefits
1. **Reliability**: Proper XML parsing handles whitespace, newlines, and encoding correctly
2. **Maintainability**: Cleaner code without complex regex patterns
3. **Robustness**: Library handles edge cases automatically
4. **Performance**: `fast-xml-parser` is one of the fastest XML parsers for Node.js

### Affected Files
- `backend/src/rss_parsers/baseParser.js`
- `backend/src/rss_parsers/dmhyParser.js`
- `backend/package.json` (new dependency)

---

## RSS Item Saving Fix

### Issue
Items were not being saved to the database if an item with the same GUID already existed for *any* RSS feed, even a different one. This prevented multiple feeds from tracking the same underlying content or incorrectly skipped items.

### Solution
Updated the `saveRssItems` function in `backend/src/services/rssService.js` to check for uniqueness based on the pair `(guid, rssId)` instead of just `guid`.

### Implementation
```javascript
const existing = await db.select()
  .from(rssItem)
  .where(and(
    eq(rssItem.guid, item.guid),
    eq(rssItem.rssId, rssId)
  ))
  .limit(1);
```

---

## Example Regex Patterns

| Anime                | Pattern                                      |
|----------------------|----------------------------------------------|
| Blue Lock Season 2   | `Blue.?Lock.*S2\|Season.?2.*1080p`          |
| Solo Leveling        | `Solo.?Leveling.*1080p.*HEVC`               |
| Frieren              | `Frieren.*1080p`                            |