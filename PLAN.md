# AutoAnime - Settings & Configuration Plan

## Overview
Add a dynamic configuration system that allows users to configure Sonarr and qBittorrent connections via the Settings page, with graceful error handling when services are unreachable.

---

## Frontend

### 1. Graceful Error Handling (All Pages)
- [ ] Display user-friendly error messages when Sonarr is not reachable or not configured
- [ ] Display user-friendly error messages when qBittorrent is not reachable or not configured
- [ ] Add "Configure Now" button linking to Settings page when services are disconnected
- [ ] Show connection status indicator in the sidebar/header

### 2. Settings Page Enhancements
The current `SettingsPage.jsx` shows connection status but needs full configuration support.

#### Sonarr Configuration (currently read-only, needs to be editable)
- [ ] URL input field (editable)
- [ ] API Key input field (editable, password masked)
- [ ] "Test Connection" button
- [ ] "Save" button to persist configuration

#### qBittorrent Configuration (partially implemented)
- [ ] URL input field ✅ (exists)
- [ ] Username input field ✅ (exists)
- [ ] Password input field ✅ (exists)
- [ ] "Test Connection" button (separate from save)
- [ ] "Save" button ✅ (exists, but needs backend persistence)

#### UI/UX Improvements
- [ ] Show success/error toast notifications
- [ ] Disable form during save operation
- [ ] Clear visual distinction between "saved" and "unsaved" state
- [ ] Loading spinners for async operations

---

## Backend

### 1. Configuration Management

#### Priority Order (highest to lowest)
1. **Database settings** – User-configured values from Settings page
2. **Environment variables (.env)** – Fallback/default values

> Note: Database settings take priority so users can override defaults via UI without editing files.

#### New API Endpoints
- [ ] `GET /api/settings` – Retrieve all current settings (masked secrets)
- [ ] `PUT /api/settings/sonarr` – Update Sonarr configuration
- [ ] `PUT /api/settings/qbittorrent` – Update qBittorrent configuration
- [ ] `POST /api/settings/sonarr/test` – Test Sonarr connection with provided credentials
- [ ] `POST /api/settings/qbittorrent/test` – Test qBittorrent connection with provided credentials

#### Configuration Service
- [ ] Create `configService.js` to handle configuration resolution
  - Check database first for user settings
  - Fall back to environment variables if not in database
  - No hardcoded default values

#### Security Considerations
- [ ] Encrypt sensitive values (API keys, passwords) before storing in database
- [ ] Never return raw secrets in API responses (return masked version)
- [ ] Validate URLs before saving

---

## Database

### New Table: `settings`

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);
```

#### Expected Keys
| Key | Description | Encrypted |
|-----|-------------|-----------|
| `sonarr_url` | Sonarr server URL | No |
| `sonarr_api_key` | Sonarr API key | Yes |
| `qbittorrent_url` | qBittorrent server URL | No |
| `qbittorrent_username` | qBittorrent username | No |
| `qbittorrent_password` | qBittorrent password | Yes |

---

## Implementation Order

1. **Database** – Create `settings` table migration
2. **Backend** – Implement `configService.js` with priority resolution
3. **Backend** – Add settings API endpoints
4. **Frontend** – Make Sonarr configuration editable
5. **Frontend** – Add test connection buttons
6. **Frontend** – Implement graceful error handling across pages

---

## Already Implemented ✅
- Basic Settings page layout (`frontend/src/pages/SettingsPage.jsx`)
- System status display (backend, database, Sonarr, qBittorrent)
- qBittorrent form fields (but no backend persistence)
- Health check endpoint with service status
- Drizzle ORM setup with existing tables